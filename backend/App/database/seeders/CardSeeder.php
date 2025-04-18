<?php

namespace App\database\seeders;

use App\database\Database;

class CardSeeder {
    public static function run() {
        try {
            $database = Database::getInstance();
            $pdo = $database->getConnection();

            $sql = "
                INSERT INTO cards (bank_user_id, bank_id, card_number, expiration_date, cvv, card_type)
                VALUES
                    (1, 1, '1234567812345678', '2025-12-01', '123', 'debit'),
                    (2, 2, '8765432187654321', '2026-01-01', '456', 'prepaid'),
                    (3, 3, '1122334411223344', '2024-06-01', '789', 'debit');
            ";

            $pdo->exec($sql);
            echo "Cards table seeded successfully.\n";
        } catch (\Exception $e) {
            echo "Error seeding cards table: " . $e->getMessage() . "\n";
        }
    }
}
