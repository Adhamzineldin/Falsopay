<?php

namespace App\database\seeders;

use App\database\Database;

class DefaultIpaAccountSeeder {
    public static function run() {
        try {
            $database = Database::getInstance();
            $pdo = $database->getConnection();

            // First, get all users
            $userQuery = $pdo->query("SELECT user_id FROM users");
            $users = $userQuery->fetchAll(\PDO::FETCH_COLUMN);

            // Prepare the update statement for users
            $updateStmt = $pdo->prepare("
                UPDATE users 
                SET default_account = :default_account 
                WHERE user_id = :user_id
            ");

            $defaultAccountsSet = 0;

            // For each user, find their first IPA account
            foreach ($users as $userId) {
                // Get the first IPA account for this user
                $ipaQuery = $pdo->prepare("
                    SELECT ipa_id 
                    FROM instant_payment_addresses 
                    WHERE user_id = :user_id 
                    ORDER BY ipa_id ASC 
                    LIMIT 1
                ");

                $ipaQuery->execute(['user_id' => $userId]);
                $ipaId = $ipaQuery->fetchColumn();

                // If user has an IPA, set it as default
                if ($ipaId) {
                    $updateStmt->execute([
                        'default_account' => $ipaId,
                        'user_id' => $userId
                    ]);
                    $defaultAccountsSet++;
                }
            }

            echo "Default IPA accounts set for $defaultAccountsSet users.\n";
        } catch (\Exception $e) {
            echo "Error setting default IPA accounts: " . $e->getMessage() . "\n";
        }
    }
}