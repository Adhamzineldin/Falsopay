<?php

namespace App\controllers;

use App\models\BankAccount;
use App\models\Card;
use App\models\InstantPaymentAddress;
use App\models\Transaction;
use App\models\User;
use App\models\SystemSettings;
use App\services\EmailService;
use App\services\SocketService;
use App\services\WhatsAppAPI;
use Exception;
use JetBrains\PhpStorm\NoReturn;
use function Symfony\Component\String\b;
use function Symfony\Component\String\s;

class TransactionController
{
    #[NoReturn] public static function createTransaction(array $data): void
    {
        $transactionModel = new Transaction();
        $requiredFields = [
            'sender_user_id', 'receiver_user_id', 'amount', 'transaction_type',
            'sender_bank_id', 'receiver_bank_id',
            'sender_account_number', 'receiver_account_number',
            'transfer_method'
        ];

        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) {
                self::json(['error' => "Missing required field: $field"], 400);
            }
        }

        try {
            $transactionId = $transactionModel->createTransaction($data);
            self::json(['success' => true, 'transaction_id' => $transactionId]);
        } catch (Exception $e) {
            self::json(['error' => 'Transaction creation failed: ' . $e->getMessage()], 500);
        }
    }

    #[NoReturn] public static function getAllTransactions(): void
    {
        $transactionModel = new Transaction();
        $transactions = $transactionModel->getAll();
        self::json($transactions);
    }

    #[NoReturn] public static function getTransactionsByUserId(int $userId): void
    {
        $transactionModel = new Transaction();
        $transactions = $transactionModel->getAllByUserId($userId);
        self::json($transactions);
    }

    #[NoReturn] public static function sendMoney(array $data): void
    {
        $transactionModel = new Transaction();
        $socketService = new SocketService();
        $bankAccountModel = new BankAccount();
        $cardModel = new Card();
        $ipaModel = new InstantPaymentAddress();
        $userModel = new User();

        $requiredFields = [
            'amount', 'pin' // PIN is required, others can be conditional
        ];

        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) {
                self::json(['error' => "Missing required field: $field"], 400);
            }
        }

        try {
            // Check system settings for transaction status
            $systemSettings = (new SystemSettings())->getSettings();
            
            // Check if transactions are blocked
            if (isset($systemSettings['transactions_blocked']) && $systemSettings['transactions_blocked']) {
                $message = $systemSettings['block_message'] ?: 'Transactions are temporarily disabled by the administrator';
                self::json([
                    'error' => $message,
                    'code' => 'TRANSACTIONS_BLOCKED'
                ], 403);
                return;
            }
            
            // Check transfer limit if enabled
            if (isset($systemSettings['transfer_limit_enabled']) && 
                $systemSettings['transfer_limit_enabled'] && 
                isset($data['amount']) && 
                $data['amount'] > $systemSettings['transfer_limit_amount']) {
                
                self::json([
                    'error' => "Transaction amount exceeds the current transfer limit of {$systemSettings['transfer_limit_amount']}",
                    'code' => 'TRANSFER_LIMIT_EXCEEDED',
                    'limit' => $systemSettings['transfer_limit_amount']
                ], 403);
                return;
            }

            // Sender account retrieval (can use bank_id + account_number or IPA details)
            $senderAccount = null;
            if (isset($data['sender_bank_id'], $data['sender_account_number'])) {
                $senderAccount = $bankAccountModel->getByCompositeKey($data['sender_bank_id'], $data['sender_account_number']);
            } elseif (isset($data['sender_ipa_address'])) {
                $senderIpaAddressAccount = $ipaModel->getByIpaAddress($data['sender_ipa_address']);
                if ($senderIpaAddressAccount) {
                    $senderAccount = $bankAccountModel->getByCompositeKey($senderIpaAddressAccount['bank_id'], $senderIpaAddressAccount['account_number']);
                }
            }

            if (!$senderAccount) {
                self::json(['error' => 'Invalid sender account or IPA address'], 400);
            }

            $senderIpaAddress = $ipaModel->getByBankAndAccount($senderAccount['bank_id'], $senderAccount['account_number'])["ipa_address"];
            // PIN verification for the sender
            if (!$ipaModel->verifyPin($senderIpaAddress, $data['pin'])) {
                self::json(['error' => 'Invalid PIN'], 401);
            }

            // Receiver account retrieval (should use mobile number to find account)
            $receiverAccount = null;
            if ($data['transfer_method'] == 'mobile' && isset($data['receiver_mobile_number'])){
                $receiverUser = $userModel->getUserByPhoneNumber($data['receiver_mobile_number']);
                if (!$receiverUser) {
                    self::json(['error' => 'No user with that mobile number'], 404);
                }

                // Now, get the receiver's IPA or bank details
                if (isset($receiverUser['default_account'])) {
                    $receiverIpaAddressAccount = $ipaModel->getByIpaId($receiverUser['default_account']);
                    if ($receiverIpaAddressAccount) {
                        $receiverAccount = $bankAccountModel->getByCompositeKey($receiverIpaAddressAccount['bank_id'], $receiverIpaAddressAccount['account_number']);
                    }
                }

                if (!$receiverAccount) {
                    self::json(['error' => 'Receiver does not have an IPA account or valid bank account'], 400);
                }

            } elseif ($data['transfer_method'] == 'ipa' && isset($data['receiver_ipa_address'])) {
                $receiverAccount = $ipaModel->getByIpaAddress($data['receiver_ipa_address']);
            } elseif ($data['transfer_method'] == 'iban' && isset($data['receiver_iban'])) {
                $receiverAccount = $bankAccountModel->getByIban($data['receiver_iban']);
            } elseif ($data['transfer_method'] == 'card' && isset($data['receiver_card_number'])) {
                $card = $cardModel->getByBankAndCardNumber($data['receiver_bank_id'], $data['receiver_card_number']);
                if (!$card) {
                    self::json(['error' => 'Invalid card details'], 400);
                }
                $receiverAccount = $bankAccountModel->getAllByUserAndBankId($card["bank_user_id"], $data['receiver_bank_id'])[0];
            } elseif ($data['transfer_method'] == 'account' && isset($data['receiver_bank_id'], $data['receiver_account_number'])) {
                $receiverAccount = $bankAccountModel->getByCompositeKey($data['receiver_bank_id'], $data['receiver_account_number']);
            } else {
                self::json(['error' => 'Invalid receiver details or type'], 400);
            }

            if (!$receiverAccount) {
                self::json(['error' => 'Invalid receiver account'], 400);
            }

            
            $senderUser = $userModel->getUserById($data['sender_user_id']);
            $senderName = $senderUser['first_name'] . ' ' . $senderUser['last_name'];

            $receiverUser = $ipaModel->getByBankAndAccount($receiverAccount['bank_id'], $receiverAccount['account_number']) ?? null;
            $receiverUserId = $receiverUser['user_id'] ?? null;
            if ($receiverUserId){
                $receiverUser = $userModel->getUserById($receiverUserId);
            }

            $receiverName = $receiverUser ? $receiverUser['first_name'] . ' ' . $receiverUser['last_name'] : null;

            // Transaction data with names
            $transactionData = [
                'sender_user_id' => $data['sender_user_id'],
                'receiver_user_id' => $data['receiver_user_id'] ?? $receiverUserId ?? null,
                'amount' => $data['amount'],
                'sender_bank_id' => $senderAccount['bank_id'],
                'receiver_bank_id' => $receiverAccount['bank_id'],
                'sender_account_number' => $senderAccount['account_number'],
                'receiver_account_number' => $receiverAccount['account_number'],
                'transfer_method' => $data['transfer_method'],
                'sender_ipa_address' => $data['sender_ipa_address'] ?? null,
                'receiver_ipa_address' => $data['receiver_ipa_address'] ?? null,
                'receiver_phone' => $data['receiver_mobile_number'] ?? null,
                'receiver_card' => $data['receiver_card_number'] ?? null,
                'receiver_iban' => $data['receiver_iban'] ?? null,
                'sender_name' => $senderName,
                'receiver_name' => $receiverName,
            ];
            
            
            
            $senderBalance = $bankAccountModel->getBalance($senderAccount['bank_id'], $senderAccount['account_number']);
            if ($senderBalance < $data['amount']) {
                self::json(['error' => 'Insufficient balance'], 400);
            }
            

            $transactionId = $transactionModel->createTransaction($transactionData);

            // Balance update
            $bankAccountModel->subtractBalance($senderAccount['bank_id'], $senderAccount['account_number'], $data['amount']);
            $bankAccountModel->addBalance($receiverAccount['bank_id'], $receiverAccount['account_number'], $data['amount']);
            
            // Get new balances
            $senderNewBalance = $bankAccountModel->getBalance($senderAccount['bank_id'], $senderAccount['account_number']);
            $receiverNewBalance = $bankAccountModel->getBalance($receiverAccount['bank_id'], $receiverAccount['account_number']);
            
            
            
            $socketService->sendTransactionStatus(
                fromUserId: $data['sender_user_id'],
                toUserId: $receiverUserId ?? null,
                amount: $data['amount'],
                fromName: $senderName,
                toName: $receiverName ?? $receiverAccount['iban'],
                transactionId: $transactionId
            );
            
            self::sendTransactionNotification($transactionData, $senderUser, $receiverUser, $transactionId, $senderNewBalance, $receiverNewBalance);
            EmailService::sendTransactionNotification($transactionData, $senderUser, $receiverUser, $transactionId, $senderNewBalance, $receiverNewBalance);
            
            // Response
            self::json(['success' => true, 'transaction_id' => $transactionId]);

        } catch (Exception $e) {
            self::json(['error' => 'Transaction creation failed: ' . $e->getMessage()], 500);
        }
    }

    static function sendTransactionNotification($transactionData, $senderUser, $receiverUser, $transactionId, $senderNewBalance, $receiverNewBalance): void
    {
        // Helper function to get proper transfer method description
        function getTransferMethodDescription($transactionData, $isSender = true): string
        {
            $method = $transactionData['transfer_method'] ?? 'unknown';

            switch ($method) {
                case 'mobile':
                    $phoneNumber = $transactionData['receiver_phone'] ?? '(unknown)';
                    return $isSender ? "to mobile number {$phoneNumber}" : "via your registered mobile number";
                case 'ipa':
                    $ipaAddress = $isSender ? ($transactionData['receiver_ipa_address'] ?? null) : ($transactionData['sender_ipa_address'] ?? null);
                    return $ipaAddress ? "via IPA address {$ipaAddress}" : "via IPA address";
                case 'iban':
                    $iban = $transactionData['receiver_iban'] ?? null;
                    if ($iban && $isSender) {
                        // Mask the IBAN for privacy, showing only last 4 digits
                        $maskedIban = '••••' . substr($iban, -4);
                        return "to IBAN {$maskedIban}";
                    }
                    return $isSender ? "to IBAN account" : "to your IBAN account";
                case 'card':
                    $cardNumber = $transactionData['receiver_card'] ?? null;
                    if ($cardNumber && $isSender) {
                        // Show only last 4 digits of card
                        $maskedCard = '••••' . substr($cardNumber, -4);
                        return "to card ending in {$maskedCard}";
                    }
                    return $isSender ? "to card account" : "to your card";
                case 'account':
                    $accountNumber = $isSender ? ($transactionData['receiver_account_number'] ?? null) : ($transactionData['sender_account_number'] ?? null);
                    if ($accountNumber) {
                        // Mask account number for privacy
                        $maskedAccount = '••••' . substr($accountNumber, -4);
                        $bankId = $isSender ? ($transactionData['receiver_bank_id'] ?? null) : ($transactionData['sender_bank_id'] ?? null);
                        $bankInfo = $bankId ? " (Bank ID: {$bankId})" : "";
                        return ($isSender ? "to" : "from") . " account {$maskedAccount}{$bankInfo}";
                    }
                    return ($isSender ? "to" : "from") . " bank account";
                default:
                    return "using direct transfer";
            }
        }

        // Format currency with thousand separators
        function formatCurrency($amount): string
        {
            return number_format($amount, 2);
        }

        // Generate transaction timestamp and reference ID
        $timestamp = date('Y-m-d H:i:s');
        $formattedDate = date('d M Y, h:i A');
        $shortRefId = substr($transactionId, 0, 8);

        // Detect transaction purpose if available
        $purpose = $transactionData['purpose'] ?? null;
        $purposeText = $purpose ? "\n• Purpose: {$purpose}" : "";

        // Sender notification
        try {
            $senderPhone = $senderUser['phone_number'] ?? null;
            if ($senderPhone) {
                $formattedAmount = formatCurrency($transactionData['amount']);
                $formattedBalance = formatCurrency($senderNewBalance);
                $transferMethod = getTransferMethodDescription($transactionData, true);
                $receiverName = $transactionData['receiver_name'] ?? 'the recipient';

                // Identify what's being sent based on amount
                $sentDescription = "funds";
                if (isset($transactionData['description'])) {
                    $sentDescription = $transactionData['description'];
                } else if ($transactionData['amount'] <= 20) {
                    $sentDescription = "payment";
                } else if ($transactionData['amount'] >= 500) {
                    $sentDescription = "large payment";
                }

                // Build an improved message with better styling
                $message = "✅ *PAYMENT SENT* ✅\n";
                $message .= "━━━━━━━━━━━━━━━━━━━━━━\n\n";
                $message .= "You've successfully sent *{$sentDescription}* worth *EGP {$formattedAmount}* to *{$receiverName}* {$transferMethod}.\n\n";

                $message .= "📋 *DETAILS*\n";
                $message .= "• Amount: *EGP {$formattedAmount}*\n";
                $message .= "• To: *{$receiverName}*\n";
                $message .= "• Method: " . ucfirst($transactionData['transfer_method'] ?? 'transfer') . "\n";
                $message .= "• Date: {$formattedDate}\n";
                $message .= "• Reference: #{$shortRefId}{$purposeText}\n";
                $message .= "━━━━━━━━━━━━━━━━━━━━━━\n\n";

                $message .= "💰 *BALANCE UPDATE*\n";
                $message .= "Your new balance is *EGP {$formattedBalance}*\n\n";

                // Add contextual information based on transaction amount
                if ($transactionData['amount'] > 100000) {
                    $message .= "⚠️ *IMPORTANT*: This was a large transaction. For security, please verify all details.\n\n";
                }
                

                $whatsAppAPI = new WhatsAppAPI();
                $whatsAppAPI->sendMessage($senderPhone, $message);
            }
        } catch (Exception $e) {
            error_log("WhatsApp send failed (sender): " . $e->getMessage());
        }

        // Receiver notification
        try {
            $receiverPhone = $receiverUser['phone_number'] ?? null;
            if ($receiverPhone) {
                $formattedAmount = formatCurrency($transactionData['amount']);
                $formattedBalance = formatCurrency($receiverNewBalance);
                $transferMethod = getTransferMethodDescription($transactionData, false);
                $senderName = $transactionData['sender_name'] ?? 'Someone';

                // Identify what's being received based on amount or description
                $receivedDescription = "funds";
                if (isset($transactionData['description'])) {
                    $receivedDescription = $transactionData['description'];
                } else if ($transactionData['amount'] <= 20000) {
                    $receivedDescription = "payment";
                } else if ($transactionData['amount'] >= 100000) {
                    $receivedDescription = "large payment";
                }

                // Build an improved message with better styling
                $message = "💸 *PAYMENT RECEIVED* 💸\n";
                $message .= "━━━━━━━━━━━━━━━━━━━━━━\n\n";
                $message .= "You've received *{$receivedDescription}* worth *EGP {$formattedAmount}* from *{$senderName}* {$transferMethod}.\n\n";

                $message .= "📋 *DETAILS*\n";
                $message .= "• Amount: *EGP {$formattedAmount}*\n";
                $message .= "• From: *{$senderName}*\n";
                $message .= "• Method: " . ucfirst($transactionData['transfer_method'] ?? 'transfer') . "\n";
                $message .= "• Date: {$formattedDate}\n";
                $message .= "• Reference: #{$shortRefId}{$purposeText}\n";
                $message .= "━━━━━━━━━━━━━━━━━━━━━━\n\n";

                $message .= "💰 *BALANCE UPDATE*\n";
                $message .= "Your new balance is *EGP {$formattedBalance}*\n\n";
                
                $whatsAppAPI = new WhatsAppAPI();
                $whatsAppAPI->sendMessage($receiverPhone, $message);
            }
        } catch (Exception $e) {
            error_log("WhatsApp send failed (receiver): " . $e->getMessage());
        }
    }







    #[NoReturn] private static function json($data, int $code = 200): void
    {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
}
