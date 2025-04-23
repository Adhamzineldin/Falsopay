<?php

namespace App\database\seeders;

use App\database\Database;

class TransactionSeeder {
    public static function run() {
        try {
            $database = Database::getInstance();
            $pdo = $database->getConnection();

            $sql = "
                INSERT INTO transactions (
                    sender_user_id,
                    receiver_user_id,
                    sender_name,
                    receiver_name,
                    amount,
                    sender_bank_id,
                    receiver_bank_id,
                    sender_account_number,
                    receiver_account_number,
                    transfer_method,
                    sender_ipa_address,
                    receiver_ipa_address,
                    receiver_phone,
                    receiver_card,
                    receiver_iban,
                    pin
                )
                VALUES
                    (
                        1, 2, 'Adham Zineldin', 'Eyad Smith', 100.50, 1, 2, '1234567890123456', '9876543210987654',
                        'ipa', 'alice@ipa.com', 'bob@ipa.com', NULL, NULL, NULL, NULL
                    ),
                    (
                        2, 3, 'Eyad Smith', 'Ayman Abdelaziz', 200.75, 2, 3, '9876543210987654', '4567890123456789',
                        'iban', NULL, NULL, NULL, NULL, 'EG500000100000000000007654321', NULL
                    ),
                    (
                        3, 1, 'Eyad Smith', 'Adham Zineldin', 300.25, 3, 1, '4567890123456789', '1234567890123456',
                        'card', NULL, NULL, NULL, '4111111111111111', NULL, NULL
                    );
            ";

            $pdo->exec($sql);
            echo "Transactions table seeded successfully.\n";
        } catch (\Exception $e) {
            echo "Error seeding transactions table: " . $e->getMessage() . "\n";
        }
    }
}
