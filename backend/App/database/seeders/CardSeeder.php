<?php

namespace App\database\seeders;

use App\database\Database;

class CardSeeder {
    public static function run() {
        try {
            $database = Database::getInstance();
            $pdo = $database->getConnection();

            // Get bank account info to link cards to users and banks
            $accountQuery = $pdo->query("SELECT bank_user_id, bank_id FROM bank_accounts");
            $accounts = $accountQuery->fetchAll(\PDO::FETCH_ASSOC);

            // Prepare statement for card insertion
            $stmt = $pdo->prepare("
                INSERT INTO cards (bank_user_id, bank_id, card_number, expiration_date, cvv, card_type, pin)
                VALUES (:bank_user_id, :bank_id, :card_number, :expiration_date, :cvv, :card_type, :pin)
            ");

            // Card types - based on the schema, only debit and prepaid are allowed
            $cardTypes = ['debit', 'prepaid'];

            // Default PIN hash (000000)
            $hashedPin = password_hash('000000', PASSWORD_BCRYPT);

            // Counter to track how many cards we've created
            $cardsCreated = 0;

            // Track unique user-bank combinations to avoid duplicates
            $userBankCombinations = [];

            // For each account, create a unique user-bank combination array
            foreach ($accounts as $account) {
                $key = $account['bank_user_id'] . '-' . $account['bank_id'];
                $userBankCombinations[$key] = [
                    'bank_user_id' => $account['bank_user_id'],
                    'bank_id' => $account['bank_id']
                ];
            }

            // Now create one card per unique user-bank combination
            foreach ($userBankCombinations as $combination) {
                // Generate a random 16-digit card number
                $cardNumber = '';
                for ($i = 0; $i < 4; $i++) {
                    $cardNumber .= sprintf("%04d", mt_rand(1000, 9999));
                }

                // Generate expiration date (1-5 years in the future)
                $years = mt_rand(1, 5);
                $expirationDate = date('Y-m-d', strtotime("+$years years"));

                // Generate 3-digit CVV
                $cvv = sprintf("%03d", mt_rand(100, 999));

                // Select random card type from allowed types only
                $cardType = $cardTypes[array_rand($cardTypes)];

                // Insert card
                $stmt->execute([
                    'bank_user_id' => $combination['bank_user_id'],
                    'bank_id' => $combination['bank_id'],
                    'card_number' => $cardNumber,
                    'expiration_date' => $expirationDate,
                    'cvv' => $cvv,
                    'card_type' => $cardType,
                    'pin' => $hashedPin,
                ]);

                $cardsCreated++;
            }

            echo "Cards table seeded successfully with $cardsCreated cards.\n";
        } catch (\Exception $e) {
            echo "Error seeding cards table: " . $e->getMessage() . "\n";
        }
    }
}