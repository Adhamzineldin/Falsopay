<?php

namespace App\database\seeders;

use App\database\Database;

class CardSeeder {
    public static function run() {
        try {
            $database = Database::getInstance();
            $pdo = $database->getConnection();

            $entries = [
                [1, 1, '1234567812345678', '2025-12-01', '123', 'debit'],
                [2, 6, '8765432187654321', '2026-01-01', '456', 'prepaid'],
                [3, 3, '1122334411223344', '2024-06-01', '789', 'debit'],
            ];

            $hashedPin = password_hash('000000', PASSWORD_BCRYPT);

            $stmt = $pdo->prepare("
                INSERT INTO cards (bank_user_id, bank_id, card_number, expiration_date, cvv, card_type, pin)
                VALUES (:bank_user_id, :bank_id, :card_number, :expiration_date, :cvv, :card_type, :pin)
            ");

            foreach ($entries as [$bank_user_id, $bank_id, $card_number, $expiration_date, $cvv, $card_type]) {
                $stmt->execute([
                    'bank_user_id' => $bank_user_id,
                    'bank_id' => $bank_id,
                    'card_number' => $card_number,
                    'expiration_date' => $expiration_date,
                    'cvv' => $cvv,
                    'card_type' => $card_type,
                    'pin' => $hashedPin,
                ]);
            }

            echo "Cards table seeded successfully with hashed PINs.\n";
        } catch (\Exception $e) {
            echo "Error seeding cards table: " . $e->getMessage() . "\n";
        }
    }
}
