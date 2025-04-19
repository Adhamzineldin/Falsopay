<?php

namespace App\database\seeders;

use App\database\Database;

class TransactionSeeder {
    public static function run() {
        try {
            $database = Database::getInstance();
            $pdo = $database->getConnection();

            $sql = "
                INSERT INTO transactions (sender_user_id, receiver_user_id, amount, transaction_type, sender_bank_id, receiver_bank_id, sender_account_number, receiver_account_number, ipa_used, ipa_id, iban_used, iban)
                VALUES
                    (1, 2, 100.50, 'send', 1, 2, 1234567890123456, 9876543210987654, TRUE, 1, FALSE, NULL),
                    (2, 3, 200.75, 'receive', 2, 3, 9876543210987654, 4567890123456789, FALSE, NULL, TRUE, 'EG500000100000000000007654321'),
                    (3, 1, 300.25, 'send', 3, 1, 4567890123456789, 1234567890123456, TRUE, 2, FALSE, NULL);
            ";

            $pdo->exec($sql);
            echo "Transactions table seeded successfully.\n";
        } catch (\Exception $e) {
            echo "Error seeding transactions table: " . $e->getMessage() . "\n";
        }
    }
}
