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

            // Remove comments or handle them differently if needed
            $sql = "
            INSERT INTO instant_payment_addresses (bank_id, account_number, ipa_address, user_id, pin)
            VALUES
            (1, '1234567890123456', 'ipa_1234567890HSBC', 1, '\$2a\$12\$D0F8IfvY6Uwx9ylGPZ93P.Z4v/lsAxtDuyljP7RX.bLlAaH5d5YTu'),
            (2, '9876543210987654', 'ipa_9876543210CIB', 2, '\$2a\$12\$D0F8IfvY6Uwx9ylGPZ93P.Z4v/lsAxtDuyljP7RX.bLlAaH5d5YTu'),
            (3, '4567890123456789', 'ipa_4567890123NBE', 3, '\$2a\$12\$D0F8IfvY6Uwx9ylGPZ93P.Z4v/lsAxtDuyljP7RX.bLlAaH5d5YTu'),
            (4, '7890123456789012', 'ipa_7890123456ABANK', 1, '\$2a\$12\$D0F8IfvY6Uwx9ylGPZ93P.Z4v/lsAxtDuyljP7RX.bLlAaH5d5YTu'),
            (5, '5678901234567890', 'ipa_5678901234AAIB', 2, '\$2a\$12\$D0F8IfvY6Uwx9ylGPZ93P.Z4v/lsAxtDuyljP7RX.bLlAaH5d5YTu');
            ";

            $pdo->exec($sql);
            echo "Instant payment addresses table seeded successfully with the provided PIN hashes.\n";
        } catch (\Exception $e) {
            echo "Error seeding instant payment addresses table: " . $e->getMessage() . "\n";
        }
    }
}
