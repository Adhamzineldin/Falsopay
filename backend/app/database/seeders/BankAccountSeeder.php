<?php

namespace App\database\seeders;

use App\database\Database;

class BankAccountSeeder {
    public static function run() {
        try {
            $database = Database::getInstance();
            $pdo = $database->getConnection();

            $sql = "
                INSERT INTO bank_accounts (bank_id, account_number, bank_user_id, iban, status, type, balance)
                VALUES
                    (1, '1234567890123456', 1, 'EG110000600188000012345180000', 'active', 'checking', 5000000),  -- HSBC
                    (2, '9876543210987654', 2, 'EG370234000000000123456789012', 'active', 'savings', 2500000),  -- CIB
                    (3, '4567890123456789', 3, 'EG500000100000000000007654321', 'inactive', 'checking', 1003),  -- NBE
                    (4, '7890123456789012', 1, 'EG870123000000000000654321987', 'active', 'checking', 300000),  -- Arab Bank
                    (5, '5678901234567890', 2, 'EG120001200000000000123456789', 'inactive', 'savings', 150000);  -- AAIB
            ";

            $pdo->exec($sql);
            echo "Bank accounts table seeded successfully.\n";
        } catch (\Exception $e) {
            echo "Error seeding bank accounts table: " . $e->getMessage() . "\n";
        }
    }
}