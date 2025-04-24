<?php

namespace App\database\seeders;

use App\database\Database;

class TransactionSeeder {
    public static function run() {
        try {
            $database = Database::getInstance();
            $pdo = $database->getConnection();

            // Get all users
            $userQuery = $pdo->query("SELECT user_id, first_name, last_name FROM users");
            $users = [];
            while ($row = $userQuery->fetch(\PDO::FETCH_ASSOC)) {
                $users[$row['user_id']] = $row['first_name'] . ' ' . $row['last_name'];
            }

            // Get all accounts
            $accountQuery = $pdo->query("
                SELECT ba.bank_user_id, ba.bank_id, ba.account_number, u.user_id 
                FROM bank_accounts ba
                JOIN bank_users bu ON ba.bank_user_id = bu.bank_user_id
                JOIN users u ON bu.email = u.email
            ");
            $accounts = [];
            while ($row = $accountQuery->fetch(\PDO::FETCH_ASSOC)) {
                if (!isset($accounts[$row['user_id']])) {
                    $accounts[$row['user_id']] = [];
                }
                $accounts[$row['user_id']][] = [
                    'bank_id' => $row['bank_id'],
                    'account_number' => $row['account_number']
                ];
            }

            // Get all IPAs
            $ipaQuery = $pdo->query("SELECT user_id, ipa_address FROM instant_payment_addresses");
            $ipas = [];
            while ($row = $ipaQuery->fetch(\PDO::FETCH_ASSOC)) {
                if (!isset($ipas[$row['user_id']])) {
                    $ipas[$row['user_id']] = [];
                }
                $ipas[$row['user_id']][] = $row['ipa_address'];
            }

            // Get all cards
            $cardQuery = $pdo->query("
                SELECT c.bank_user_id, c.card_number, u.user_id
                FROM cards c
                JOIN bank_users bu ON c.bank_user_id = bu.bank_user_id
                JOIN users u ON bu.email = u.email
            ");
            $cards = [];
            while ($row = $cardQuery->fetch(\PDO::FETCH_ASSOC)) {
                if (!isset($cards[$row['user_id']])) {
                    $cards[$row['user_id']] = [];
                }
                $cards[$row['user_id']][] = $row['card_number'];
            }

            // Transfer methods
            $transferMethods = ['ipa', 'iban', 'card', 'mobile', 'account'];

            // Prepare statement for transaction insertion
            $stmt = $pdo->prepare("
                INSERT INTO transactions (
                    sender_user_id, receiver_user_id, sender_name, receiver_name,
                    amount, sender_bank_id, receiver_bank_id, sender_account_number,
                    receiver_account_number, transfer_method, sender_ipa_address,
                    receiver_ipa_address, receiver_phone, receiver_card, receiver_iban,
                    transaction_time
                )
                VALUES (
                    :sender_user_id, :receiver_user_id, :sender_name, :receiver_name,
                    :amount, :sender_bank_id, :receiver_bank_id, :sender_account_number,
                    :receiver_account_number, :transfer_method, :sender_ipa_address,
                    :receiver_ipa_address, :receiver_phone, :receiver_card, :receiver_iban,
                    :transaction_time
                )
            ");

            // Generate 100 random transactions
            $transactionCount = 0;
            $maxTransactions = 100; // Adjust as needed

            for ($i = 0; $i < $maxTransactions; $i++) {
                // Select random sender and receiver (different users)
                $senderUserId = array_rand($users);
                $receiverUserId = $senderUserId;
                while ($receiverUserId == $senderUserId) {
                    $receiverUserId = array_rand($users);
                }

                // Skip if either user has no accounts
                if (!isset($accounts[$senderUserId]) || !isset($accounts[$receiverUserId])) {
                    continue;
                }

                // Select random sender account
                $senderAccount = $accounts[$senderUserId][array_rand($accounts[$senderUserId])];

                // Select random receiver account
                $receiverAccount = $accounts[$receiverUserId][array_rand($accounts[$receiverUserId])];

                // Select random transfer method
                $transferMethod = $transferMethods[array_rand($transferMethods)];

                // Random amount between 10 and 10,000
                $amount = mt_rand(1000, 1000000) / 100; // Convert to decimal

                // Calculate a random date in the past year
                $randomDaysAgo = mt_rand(0, 365);
                $transactionDate = date('Y-m-d H:i:s', strtotime("-$randomDaysAgo days"));

                // Prepare transaction data
                $transactionData = [
                    'sender_user_id' => $senderUserId,
                    'receiver_user_id' => $receiverUserId,
                    'sender_name' => $users[$senderUserId],
                    'receiver_name' => $users[$receiverUserId],
                    'amount' => $amount,
                    'sender_bank_id' => $senderAccount['bank_id'],
                    'receiver_bank_id' => $receiverAccount['bank_id'],
                    'sender_account_number' => $senderAccount['account_number'],
                    'receiver_account_number' => $receiverAccount['account_number'],
                    'transfer_method' => $transferMethod,
                    'sender_ipa_address' => null,
                    'receiver_ipa_address' => null,
                    'receiver_phone' => null,
                    'receiver_card' => null,
                    'receiver_iban' => null,
                    'transaction_time' => $transactionDate
                ];

                // Add method-specific data
                switch ($transferMethod) {
                    case 'ipa':
                        if (isset($ipas[$senderUserId]) && isset($ipas[$receiverUserId])) {
                            $transactionData['sender_ipa_address'] = $ipas[$senderUserId][array_rand($ipas[$senderUserId])];
                            $transactionData['receiver_ipa_address'] = $ipas[$receiverUserId][array_rand($ipas[$receiverUserId])];
                        }
                        break;
                    case 'card':
                        if (isset($cards[$receiverUserId])) {
                            $transactionData['receiver_card'] = $cards[$receiverUserId][array_rand($cards[$receiverUserId])];
                        }
                        break;
                    case 'mobile':
                        // Get receiver's phone number from users table
                        $phoneQuery = $pdo->prepare("SELECT phone_number FROM users WHERE user_id = :user_id");
                        $phoneQuery->execute(['user_id' => $receiverUserId]);
                        $transactionData['receiver_phone'] = $phoneQuery->fetchColumn();
                        break;
                    case 'iban':
                        // Generate a random IBAN for the receiver
                        $checkDigits = sprintf("%02d", mt_rand(10, 99));
                        $bankCode = sprintf("%04d", mt_rand(1000, 9999));
                        $branchCode = sprintf("%04d", mt_rand(1000, 9999));
                        $accountPart = '';
                        for ($j = 0; $j < 20; $j++) {
                            $accountPart .= mt_rand(0, 9);
                        }
                        $transactionData['receiver_iban'] = "EG" . $checkDigits . $bankCode . $branchCode . $accountPart;
                        break;
                    case 'account':
                        // Already have account numbers set
                        break;
                }

                // Insert transaction
                $stmt->execute($transactionData);
                $transactionCount++;
            }

            echo "Transactions table seeded successfully with $transactionCount transactions.\n";
        } catch (\Exception $e) {
            echo "Error seeding transactions table: " . $e->getMessage() . "\n";
        }
    }
}