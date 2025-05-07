<?php

namespace App\database\seeders;

use App\database\Database;

class BankAccountSeeder {
    public static function run() {
        try {
            $database = Database::getInstance();
            $pdo = $database->getConnection();

            // We'll create 6 accounts per user: 2 accounts per bank across 3 different banks
            // Total: 20 users * 6 accounts = 120 accounts

            $bankIds = [1, 2, 3]; // HSBC, CIB, NBE - the 3 main banks
            $accountTypes = ['current', 'savings'];
            $statuses = ['active', 'active', 'active', 'inactive']; // 75% active, 25% inactive

            $stmt = $pdo->prepare("
                INSERT INTO bank_accounts (bank_id, account_number, bank_user_id, iban, status, type, balance)
                VALUES (:bank_id, :account_number, :bank_user_id, :iban, :status, :type, :balance)
            ");

            $accountsCreated = 0;

            // For each of the 20 users
            for ($userId = 1; $userId <= 20; $userId++) {
                // For each of the 3 banks
                foreach ($bankIds as $bankId) {
                    // Create 2 accounts per bank
                    for ($i = 0; $i < 2; $i++) {
                        // Generate random but valid-looking account number (16 digits)
                        $accountNumber = mt_rand(1000, 9999) . mt_rand(1000, 9999) . mt_rand(1000, 9999) . mt_rand(1000, 9999);

                        // Generate a random IBAN (following Egyptian format: EG + 2 check digits + 29 chars)
                        $checkDigits = sprintf("%02d", mt_rand(10, 99));
                        $bankCode = sprintf("%04d", mt_rand(1000, 9999));
                        $branchCode = sprintf("%04d", mt_rand(1000, 9999));
                        // Use a random string for the account part
                        $accountPart = '';
                        for ($j = 0; $j < 20; $j++) {
                            $accountPart .= mt_rand(0, 9);
                        }
                        $iban = "EG" . $checkDigits . $bankCode . $branchCode . $accountPart;

                        // Random status (weighted toward active)
                        $status = $statuses[array_rand($statuses)];

                        // Alternate between checking and savings accounts
                        $type = $accountTypes[$i % 2];

                        // Set balance - if it's Adham (user ID 1), set to 99999999999999, otherwise random
                        $balance = ($userId === 1) ? 99999999999999 : mt_rand(1000, 5000000);

                        $stmt->execute([
                            'bank_id' => $bankId,
                            'account_number' => $accountNumber,
                            'bank_user_id' => $userId,
                            'iban' => $iban,
                            'status' => $status,
                            'type' => $type,
                            'balance' => $balance
                        ]);

                        $accountsCreated++;
                    }
                }
            }

            echo "Bank accounts table seeded successfully with $accountsCreated accounts.\n";
            echo "User 'Adham Zineldin' (ID: 1) has all accounts set to 99999999999999 balance.\n";
        } catch (\Exception $e) {
            echo "Error seeding bank accounts table: " . $e->getMessage() . "\n";
        }
    }
}