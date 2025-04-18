<?php

namespace App\database\seeders;

use App\database\Database;

class InstantPaymentAddressSeeder {
    public static function run() {
        try {
            $database = Database::getInstance();
            $pdo = $database->getConnection();

            $sql = "
                INSERT INTO instant_payment_addresses (bank_id, account_id, ipa_address)
                VALUES
                    (1, '1234567890123456', 'ipa_1234567890HSBC'),  -- HSBC
                    (2, '9876543210987654', 'ipa_9876543210CIB'),  -- CIB
                    (3, '4567890123456789', 'ipa_4567890123NBE'),  -- NBE
                    (4, '7890123456789012', 'ipa_7890123456ABANK'),  -- Arab Bank
                    (5, '5678901234567890', 'ipa_5678901234AAIB');  -- AAIB
            ";

            $pdo->exec($sql);
            echo "Instant payment addresses table seeded successfully.\n";
        } catch (\Exception $e) {
            echo "Error seeding instant payment addresses table: " . $e->getMessage() . "\n";
        }
    }
}