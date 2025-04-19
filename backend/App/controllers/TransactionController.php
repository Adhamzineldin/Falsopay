<?php

namespace App\controllers;

use App\models\BankAccount;
use App\models\InstantPaymentAddress;
use App\models\Transaction;
use App\models\User;
use App\services\SocketService;
use Exception;
use JetBrains\PhpStorm\NoReturn;
use function Symfony\Component\String\b;

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
            'iban_used', 'iban'
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

        $requiredFields = [
            'sender_user_id', 'receiver_user_id', 'amount',
            'sender_bank_id', 'receiver_bank_id',
            'sender_account_number', 'receiver_account_number',
            'ipa_used', 'iban_used',
        ];

        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) {
                self::json(['error' => "Missing required field: $field"], 400);
            }
        }

        try {
            $bankAccountModel = new BankAccount();
            $ipnModel = new InstantPaymentAddress();

            // For the sender account, check if IPA or IBAN is used
            if ($data['ipa_used'] && isset($data['ipa_id'])) {
                // Use IPA to get account info
                $senderAccount = $ipnModel->getByIpaAddress($data['ipa_id']);
            } elseif ($data['iban_used'] && isset($data['iban'])) {
                // Use IBAN to get account info
                $senderAccount = $bankAccountModel->getByIban($data['iban']);
            } else {
                // Default behavior: use bank ID and account number
                $senderAccount = $bankAccountModel->getByCompositeKey($data['sender_bank_id'], $data['sender_account_number']);
            }

            // For the receiver account, check if IPA or IBAN is used
            if ($data['ipa_used'] && isset($data['ipa_id'])) {
                // Use IPA to get account info
                $receiverAccount = $ipnModel->getByIpaAddress($data['ipa_id']);
            } elseif ($data['iban_used'] && isset($data['iban'])) {
                // Use IBAN to get account info
                $receiverAccount = $bankAccountModel->getByIban($data['iban']);
            } else {
                // Default behavior: use bank ID and account number
                $receiverAccount = $bankAccountModel->getByCompositeKey($data['receiver_bank_id'], $data['receiver_account_number']);
            }

            // Check if the sender and receiver accounts exist
            if (!$senderAccount || !$receiverAccount) {
                self::json(['error' => 'Invalid sender or receiver account'], 400);
            }

            // Set transaction type
            $data['transaction_type'] = 'send';
            
            
            // Create the transaction
            $transactionId = $transactionModel->createTransaction($data);
            
            
            // Deduct the amount from the sender's account
            $bankAccountModel->subtractBalance($senderAccount["bank_id"], $senderAccount["account_number"],  $data['amount']);
            $bankAccountModel->addBalance($receiverAccount["bank_id"], $receiverAccount["account_number"],  $data['amount']);
            
            $userModel = new User();
            // Get sender and receiver user details
            $senderUser = $userModel->getUserById($data['sender_user_id']);
            $receiverUser = $userModel->getUserById($data['receiver_user_id']);

            // Send the transaction status to both users
            $socketService->sendTransactionStatus(
                fromUserId: $data['sender_user_id'],
                toUserId: $data['receiver_user_id'],
                amount: $data['amount'],
                fromName: $senderUser['first_name'] . ' ' . $senderUser['last_name'],
                toName: $receiverUser['first_name'] . ' ' . $receiverUser['last_name'],
                transactionId: $transactionId
            );
            
//            $socketService->sendTransactionStatus(
//                fromUserId: $data['sender_user_id'],
//                toUserId: $data['sender_user_id'],
//                amount: $data['amount'],
//                fromName: $senderAccount['account_holder_name'],
//                toName: $receiverAccount['account_holder_name'],
//                transactionId: $transactionId
//            );


            self::json(['success' => true, 'transaction_id' => $transactionId]);
        } catch (Exception $e) {
            self::json(['error' => 'Transaction creation failed: ' . $e->getMessage()], 500);
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
