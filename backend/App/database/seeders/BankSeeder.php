<?php

namespace App\database\seeders;

use App\database\Database;

class BankSeeder {
    public static function run() {
        try {
            $database = Database::getInstance();
            $pdo = $database->getConnection();

            $sql = "
                INSERT INTO banks (bank_name, bank_code, swift_code)
                VALUES
                    ('HSBC', 'HSBC001', 'HSBCGB2L'),
                    ('CIB', 'CIB001', 'CIBEGECA'),
                    ('NBE', 'NBE001', 'NBEGEGCX'),
                    ('Arab Bank', 'AB001', 'ARABEGCXXX'),
                    ('AAIB', 'AAIB001', 'AAIBEGCXXX');
            ";

            $pdo->exec($sql);
            echo "Banks table seeded successfully.\n";
        } catch (\Exception $e) {
            echo "Error seeding banks table: " . $e->getMessage() . "\n";
        }
    }
}
