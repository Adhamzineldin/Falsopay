<?php

namespace App\database\seeders;

use App\database\Database;

class TransactionSeeder {
    public static function run() {
        try {
            $database = Database::getInstance();
            $pdo = $database->getConnection();

            $sql = "
                INSERT INTO transactions (sender_user_id, receiver_user_id, amount, transaction_type, sender_bank_id, receiver_bank_id, ipa_used, ipa_id, status)
                VALUES
                    (1, 2, 100.50, 'send', 1, 2, TRUE, 1, 'completed'),
                    (2, 3, 200.75, 'receive', 2, 3, FALSE, NULL, 'pending'),
                    (3, 1, 300.25, 'send', 3, 1, TRUE, 2, 'failed');
            ";

            $pdo->exec($sql);
            echo "Transactions table seeded successfully.\n";
        } catch (\Exception $e) {
            echo "Error seeding transactions table: " . $e->getMessage() . "\n";
        }
    }
}
