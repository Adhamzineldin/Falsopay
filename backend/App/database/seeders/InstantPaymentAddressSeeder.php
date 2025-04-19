<?php

namespace App\database\seeders;

use App\database\Database;

class InstantPaymentAddressSeeder {
    public static function run() {
        try {
            $database = Database::getInstance();
            $pdo = $database->getConnection();

            $sql = "
                INSERT INTO instant_payment_addresses (bank_id, account_id, ipa_address, user_id)
                VALUES
                    (1, '1234567890123456', 'ipa_1234567890HSBC', 1),  -- HSBC, user_id 1
                    (2, '9876543210987654', 'ipa_9876543210CIB', 2),  -- CIB, user_id 2
                    (3, '4567890123456789', 'ipa_4567890123NBE', 3),  -- NBE, user_id 3
                    (4, '7890123456789012', 'ipa_7890123456ABANK', 1),  -- Arab Bank, user_id 4
                    (5, '5678901234567890', 'ipa_5678901234AAIB', 2);  -- AAIB, user_id 5
            ";

            $pdo->exec($sql);
            echo "Instant payment addresses table seeded successfully.\n";
        } catch (\Exception $e) {
            echo "Error seeding instant payment addresses table: " . $e->getMessage() . "\n";
        }
    }
}
