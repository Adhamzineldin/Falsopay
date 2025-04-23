<?php
namespace App\database\seeders;

use App\database\Database;

class InstantPaymentAddressSeeder
{
    public static function run()
    {
        try {
            $database = Database::getInstance();
            $pdo = $database->getConnection();

            $entries = [
                [1, '1234567890123456', 'adham_hsbc', 1],
                [2, '9876543210987654', 'ipa_9876543210CIB', 2],
                [3, '4567890123456789', 'ipa_4567890123NBE', 3],
                [4, '7890123456789012', 'ipa_7890123456ABANK', 1],
                [5, '5678901234567890', 'ipa_5678901234AAIB', 2],
            ];

            $pin = '000000';
            $hashedPin = password_hash($pin, PASSWORD_BCRYPT);

            $stmt = $pdo->prepare("
                INSERT INTO instant_payment_addresses (bank_id, account_number, ipa_address, user_id, pin)
                VALUES (:bank_id, :account_number, :ipa_address, :user_id, :pin)
            ");

            foreach ($entries as [$bank_id, $account_number, $ipa_address, $user_id]) {
                $stmt->execute([
                    'bank_id' => $bank_id,
                    'account_number' => $account_number,
                    'ipa_address' => $ipa_address,
                    'user_id' => $user_id,
                    'pin' => $hashedPin
                ]);
            }

            echo "Instant payment addresses table seeded successfully with bcrypt-hashed PINs.\n";
        } catch (\Exception $e) {
            echo "Error seeding instant payment addresses table: " . $e->getMessage() . "\n";
        }
    }
}
