<?php

namespace App\controllers;

use App\models\BankAccount;
use App\models\Card;
use App\models\InstantPaymentAddress;
use App\models\Transaction;
use App\models\User;
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
            'ipa_used', 'ipa_id',
            'iban_used', 'iban',
            'phone_number_used',
            'phone_number'
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

    public static function sendMoney(array $data): void
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
            if (isset($data['receiver_mobile_number'])) {
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

            } elseif (isset($data['ipa_used']) && isset($data['ipa_address'])) {
                $receiverAccount = $ipaModel->getByIpaAddress($data['ipa_address']);
            } elseif (isset($data['iban_used']) && isset($data['iban'])) {
                $receiverAccount = $bankAccountModel->getByIban($data['iban']);
            } elseif (isset($data['card_number_used']) && isset($data['receiver_card_number'])) {
                $card = $cardModel->getByBankAndCardNumber($data['receiver_bank_id'], $data['receiver_card_number']);
                if (!$card) {
                    self::json(['error' => 'Invalid card details'], 400);
                }
                $receiverAccount = $bankAccountModel->getAllByUserAndBankId($card["bank_user_id"], $data['receiver_bank_id'])[0];
            } elseif (isset($data['receiver_bank_id'], $data['receiver_account_number'])) {
                $receiverAccount = $bankAccountModel->getByCompositeKey($data['receiver_bank_id'], $data['receiver_account_number']);
            } else {
                self::json(['error' => 'Invalid receiver details'], 400);
            }

            if (!$receiverAccount) {
                self::json(['error' => 'Invalid receiver account'], 400);
            }

            // Transaction creation
            $data['transaction_type'] = 'send';


            $transactionData = [
                'sender_user_id' => $data['sender_user_id'],
                'receiver_user_id' => $data['receiver_user_id'] ?? null,  // Handle nullable receiver_user_id
                'amount' => $data['amount'],
                'transaction_type' => $data['transaction_type'],
                'sender_bank_id' => $senderAccount['bank_id'],
                'receiver_bank_id' => $receiverAccount['bank_id'],
                'sender_account_number' => $senderAccount['account_number'],
                'receiver_account_number' => $receiverAccount['account_number'],
                'ipa_used' => $data['ipa_used'] ?? 0,  // Default to 0 if not set
                'ipa_id' => $data['ipa_id'] ?? null,   // Nullable ipa_id
                'iban_used' => $data['iban_used'] ?? 0,  // Default to 0 if not set
                'iban' => $data['iban'] ?? null,   // Nullable iban
                'phone_number_used' => isset($data['receiver_mobile_number']) ? 1 : 0,  // Check if mobile number is provided
                'phone_number' => $data['receiver_mobile_number'] ?? null,  // Nullable phone_number,
                'card_number_used' => $data['card_number_used'] ? 1 : 0,  // Default to 0 if not set
                'card_number' => $data['receiver_card_number'] ?? null,  // Nullable card_number
            ];


            $transactionId = $transactionModel->createTransaction($transactionData);

            // Balance update
            $bankAccountModel->subtractBalance($senderAccount['bank_id'], $senderAccount['account_number'], $data['amount']);
            $bankAccountModel->addBalance($receiverAccount['bank_id'], $receiverAccount['account_number'], $data['amount']);
            
            // Get new balances
            $senderNewBalance = $bankAccountModel->getBalance($senderAccount['bank_id'], $senderAccount['account_number']);
            $receiverNewBalance = $bankAccountModel->getBalance($receiverAccount['bank_id'], $receiverAccount['account_number']);

            $receiverUser = $ipaModel->getByBankAndAccount($receiverAccount['bank_id'], $receiverAccount['account_number']) ?? null;
            $receiverUserId = $receiverUser['user_id'] ?? null;
            // Send status update via socket
            $senderUser = $userModel->getUserById($data['sender_user_id']);
            if ($receiverUserId){
                $receiverUser = $userModel->getUserById($receiverUserId);
            }

            $receiverName = $receiverUser ? $receiverUser['first_name'] . ' ' . $receiverUser['last_name'] : null;
            
            $socketService->sendTransactionStatus(
                fromUserId: $data['sender_user_id'],
                toUserId: $receiverUserId ?? null,
                amount: $data['amount'],
                fromName: $senderUser['first_name'] . ' ' . $senderUser['last_name'],
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

    static function sendTransactionNotification($transactionData, $senderUser, $receiverUser, $transactionId, $senderNewBalance, $receiverNewBalance) {
        // Helper function to determine the method of transaction
        function getMethodDetails($transactionData, $isSender = true): string
        {
            if ($isSender) {
                if ($transactionData['phone_number_used']) {
                    return "to phone number {$transactionData['phone_number']}.";
                } elseif ($transactionData['card_number_used']) {
                    return "to card number ending in " . substr($transactionData['card_number'], -4) . ".";
                } elseif ($transactionData['iban_used']) {
                    return "to IBAN {$transactionData['iban']}.";
                } elseif ($transactionData['sender_account_number']) {
                    return "to account number {$transactionData['sender_account_number']}.";
                }
            } else {
                if ($transactionData['phone_number_used']) {
                    return "to your phone number {$transactionData['phone_number']}.";
                } elseif ($transactionData['card_number_used']) {
                    return "to your card number ending in " . substr($transactionData['card_number'], -4) . ".";
                } elseif ($transactionData['iban_used']) {
                    return "to your IBAN {$transactionData['iban']}.";
                } elseif ($transactionData['receiver_account_number']) {
                    return "to your account number {$transactionData['receiver_account_number']}.";
                }
            }
            return ''; // Default return if no method is matched
        }

        

        // Sender WhatsApp notification
        try {
            $senderPhone = $senderUser['phone_number'] ?? null;
            if ($senderPhone) {
                $methodDetails = getMethodDetails($transactionData, true); // Get sender's method details
                $message = "🔹 **Transaction Summary**\n\n";
                $message .= "You have successfully sent *EGP {$transactionData['amount']}* to *{$receiverUser['first_name']} {$receiverUser['last_name']}*.\n";
                $message .= "*Transaction ID*: {$transactionId}\n";
                $message .= "*Payment Method*: {$methodDetails}\n\n";
                $message .= "🔸 **Balance Update**\n\n";
                $message .= "Your new balance is *EGP {$senderNewBalance}*.\n";
                $whatsAppAPI = new WhatsAppAPI();
                $whatsAppAPI->sendMessage($senderPhone, $message);
            }
        } catch (Exception $e) {
            // Log error silently or ignore – don't block transaction for WhatsApp failures
            error_log("WhatsApp send failed (sender): " . $e->getMessage());
        }

        // Receiver WhatsApp notification
        try {
            $receiverPhone = $receiverUser['phone_number'] ?? null;
            if ($receiverPhone) {
                $methodDetails = getMethodDetails($transactionData, false); // Get receiver's method details
                $message = "🔹 **Transaction Summary**\n\n";
                $message .= "You have received *EGP {$transactionData['amount']}* from *{$senderUser['first_name']} {$senderUser['last_name']}*.\n";
                $message .= "*Transaction ID*: {$transactionId}\n";
                $message .= "*Received Method*: {$methodDetails}\n\n";
                $message .= "🔸 **Balance Update**\n\n";
                $message .= "Your new balance is *EGP {$receiverNewBalance}*.\n";
                $whatsAppAPI = new WhatsAppAPI();
                $whatsAppAPI->sendMessage($receiverPhone, $message);
            }
        } catch (Exception $e) {
            // Log error silently or ignore – don't block transaction for WhatsApp failures
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
