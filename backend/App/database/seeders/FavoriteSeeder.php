<?php

namespace App\database\seeders;

use App\database\Database;

class FavoriteSeeder {
    public static function run() {
        try {
            $database = Database::getInstance();
            $pdo = $database->getConnection();

            // Get first 6 users with all their payment methods
            $userQuery = $pdo->query("
                SELECT 
                    u.user_id, 
                    u.first_name, 
                    u.last_name, 
                    u.email,
                    u.phone_number,
                    i.ipa_address,
                    c.card_number,
                    ba.iban,
                    ba.account_number,
                    b.bank_id,
                    bu.bank_user_id
                FROM users u
                LEFT JOIN bank_users bu ON u.email = bu.email
                LEFT JOIN instant_payment_addresses i ON u.user_id = i.user_id
                LEFT JOIN bank_accounts ba ON bu.bank_user_id = ba.bank_user_id
                LEFT JOIN banks b ON ba.bank_id = b.bank_id
                LEFT JOIN cards c ON bu.bank_user_id = c.bank_user_id
                WHERE u.user_id <= 6
                ORDER BY u.user_id ASC
            ");

            $users = [];
            while ($row = $userQuery->fetch(\PDO::FETCH_ASSOC)) {
                if (!isset($users[$row['user_id']])) {
                    $users[$row['user_id']] = [
                        'name' => $row['first_name'] . ' ' . $row['last_name'],
                        'email' => $row['email'],
                        'phone' => $row['phone_number'],
                        'methods' => [
                            'ipa' => [],
                            'mobile' => null,
                            'card' => null,
                            'iban' => null,
                            'account' => null
                        ],
                        'bank_id' => null
                    ];
                }
                
                // Store payment methods
                if ($row['ipa_address']) {
                    $users[$row['user_id']]['methods']['ipa'][] = $row['ipa_address'];
                }
                if ($row['phone_number']) {
                    $users[$row['user_id']]['methods']['mobile'] = $row['phone_number'];
                }
                if ($row['card_number']) {
                    $users[$row['user_id']]['methods']['card'] = $row['card_number'];
                }
                if ($row['iban']) {
                    $users[$row['user_id']]['methods']['iban'] = $row['iban'];
                }
                if ($row['account_number']) {
                    $users[$row['user_id']]['methods']['account'] = $row['account_number'];
                }
                if ($row['bank_id']) {
                    $users[$row['user_id']]['bank_id'] = $row['bank_id'];
                }
            }

            // Get all users for adding favorites
            $allUsersQuery = $pdo->query("SELECT user_id FROM users");
            $allUsers = $allUsersQuery->fetchAll(\PDO::FETCH_COLUMN);

            // Prepare statement for favorite insertion
            $stmt = $pdo->prepare("
                INSERT INTO favorites (
                    user_id, recipient_identifier, recipient_name, method,
                    bank_id, created_at
                )
                VALUES (
                    :user_id, :recipient_identifier, :recipient_name, :method,
                    :bank_id, :created_at
                )
            ");

            $favoriteCount = 0;
            $methods = ['ipa', 'mobile', 'card', 'iban', 'account'];

            // For each user in the system
            foreach ($allUsers as $userId) {
                // For each of the first 6 users
                foreach ($users as $favoriteUserId => $favoriteUser) {
                    // Skip if trying to add self as favorite
                    if ($userId == $favoriteUserId) {
                        continue;
                    }

                    // For each payment method
                    foreach ($methods as $method) {
                        // Skip if the favorite user doesn't have this payment method
                        if ($method === 'ipa') {
                            if (empty($favoriteUser['methods']['ipa'])) {
                                continue;
                            }
                            $identifier = $favoriteUser['methods']['ipa'][array_rand($favoriteUser['methods']['ipa'])];
                        } else {
                            if (empty($favoriteUser['methods'][$method])) {
                                continue;
                            }
                            $identifier = $favoriteUser['methods'][$method];
                        }

                        // Calculate dates
                        $createdAt = date('Y-m-d H:i:s', strtotime('-' . mt_rand(0, 30) . ' days'));

                        // Prepare favorite data
                        $favoriteData = [
                            'user_id' => $userId,
                            'recipient_identifier' => $identifier,
                            'recipient_name' => $favoriteUser['name'],
                            'method' => $method,
                            'bank_id' => $favoriteUser['bank_id'],
                            'created_at' => $createdAt
                        ];

                        // Insert favorite
                        $stmt->execute($favoriteData);
                        $favoriteCount++;
                    }
                }
            }

            echo "Favorites table seeded successfully with $favoriteCount favorites.\n";
        } catch (\Exception $e) {
            echo "Error seeding favorites table: " . $e->getMessage() . "\n";
        }
    }
} 