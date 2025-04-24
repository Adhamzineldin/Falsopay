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

            // Fetch all bank accounts WITH ACCOUNT TYPE to create IPAs for them
            $accountQuery = $pdo->query("SELECT bank_id, account_number, bank_user_id, type FROM bank_accounts");
            $accounts = $accountQuery->fetchAll(\PDO::FETCH_ASSOC);

            // Get user details for creating username-based IPA addresses
            $userQuery = $pdo->query("SELECT bank_user_id, first_name, last_name FROM bank_users");
            $bankUsers = [];
            while ($row = $userQuery->fetch(\PDO::FETCH_ASSOC)) {
                $bankUsers[$row['bank_user_id']] = [
                    'first_name' => strtolower($row['first_name']),
                    'last_name' => strtolower($row['last_name'])
                ];
            }

            // Get user_id mapping to bank_user_id
            $userMappingQuery = $pdo->query("SELECT user_id, email FROM users");
            $userMapping = [];
            $bankUserMappingQuery = $pdo->query("SELECT bank_user_id, email FROM bank_users");
            $bankUserMapping = [];

            while ($row = $userMappingQuery->fetch(\PDO::FETCH_ASSOC)) {
                $userMapping[$row['email']] = $row['user_id'];
            }

            while ($row = $bankUserMappingQuery->fetch(\PDO::FETCH_ASSOC)) {
                $bankUserMapping[$row['email']] = $row['bank_user_id'];
            }

            // Create mapping from bank_user_id to user_id
            $bankUserToUser = [];
            foreach ($bankUserMapping as $email => $bankUserId) {
                if (isset($userMapping[$email])) {
                    $bankUserToUser[$bankUserId] = $userMapping[$email];
                }
            }

            // Default PIN (000000) - hashed
            $hashedPin = password_hash('000000', PASSWORD_BCRYPT);

            // Bank codes for IPA naming
            $bankCodes = [
                1 => 'hsbc',
                2 => 'cib',
                3 => 'nbe',
                4 => 'ab',
                5 => 'aaib',
                6 => 'prepaid',
                7 => 'qnb',
                8 => 'fawry',
                9 => 'bm',
                10 => 'bdc'
            ];

            // Account type mapping - adjust based on your actual types in the database
            $accountTypeMapping = [
                'savings' => 'savings',
                'current' => 'current',
                'checking' => 'checking',
                'business' => 'biz',
                'personal' => 'personal',
                'credit' => 'credit',
                'loan' => 'loan',
                // Add more mappings as needed
                // Default for any unknown type
                'default' => 'account'
            ];

            $stmt = $pdo->prepare("
                INSERT INTO instant_payment_addresses (bank_id, account_number, ipa_address, user_id, pin)
                VALUES (:bank_id, :account_number, :ipa_address, :user_id, :pin)
            ");

            $ipaCount = 0;

            foreach ($accounts as $account) {
                $bankUserId = $account['bank_user_id'];
                $bankId = $account['bank_id'];
                $accountType = strtolower($account['type'] ?? 'default');

                // Skip if we don't have bank code mapping or user mapping
                if (!isset($bankCodes[$bankId]) || !isset($bankUsers[$bankUserId]) || !isset($bankUserToUser[$bankUserId])) {
                    continue;
                }

                $userId = $bankUserToUser[$bankUserId];

                // Get the mapped account type or use default
                $typeCode = isset($accountTypeMapping[$accountType]) ? $accountTypeMapping[$accountType] : $accountTypeMapping['default'];

                // Create IPA address with format: firstname_bankcode_accounttype
                $ipaAddress = $bankUsers[$bankUserId]['first_name'] . '_' . $bankCodes[$bankId] . '_' . $typeCode;

                $stmt->execute([
                    'bank_id' => $bankId,
                    'account_number' => $account['account_number'],
                    'ipa_address' => $ipaAddress,
                    'user_id' => $userId,
                    'pin' => $hashedPin
                ]);

                $ipaCount++;
            }

            echo "Instant payment addresses table seeded successfully with $ipaCount addresses.\n";
        } catch (\Exception $e) {
            echo "Error seeding instant payment addresses table: " . $e->getMessage() . "\n";
        }
    }
}