<?php

namespace App\database\seeders;

use App\database\Database;

class MoneyRequestSeeder {
    public static function run() {
        try {
            $database = Database::getInstance();
            $pdo = $database->getConnection();

            // Get all users with their IPAs
            $userQuery = $pdo->query("
                SELECT u.user_id, u.first_name, u.last_name, u.email, i.ipa_address
                FROM users u
                LEFT JOIN instant_payment_addresses i ON u.user_id = i.user_id
            ");
            $users = [];
            while ($row = $userQuery->fetch(\PDO::FETCH_ASSOC)) {
                if (!isset($users[$row['user_id']])) {
                    $users[$row['user_id']] = [
                        'name' => $row['first_name'] . ' ' . $row['last_name'],
                        'email' => $row['email'],
                        'ipas' => []
                    ];
                }
                if ($row['ipa_address']) {
                    $users[$row['user_id']]['ipas'][] = $row['ipa_address'];
                }
            }

            // Request statuses
            $statuses = ['pending', 'accepted', 'declined', 'expired'];
            
            // Request messages
            $messages = [
                'Rent payment',
                'Utility bills',
                'Grocery shopping',
                'Dinner bill',
                'Movie tickets',
                'Concert tickets',
                'Birthday gift',
                'Travel expenses',
                'Emergency fund',
                'Medical expenses'
            ];

            // Prepare statement for money request insertion
            $stmt = $pdo->prepare("
                INSERT INTO money_requests (
                    requester_user_id, requested_user_id, requester_name, requested_name,
                    amount, requester_ipa_address, requested_ipa_address, message,
                    status, created_at, updated_at
                )
                VALUES (
                    :requester_user_id, :requested_user_id, :requester_name, :requested_name,
                    :amount, :requester_ipa_address, :requested_ipa_address, :message,
                    :status, :created_at, :updated_at
                )
            ");

            // Generate 50 random money requests
            $requestCount = 0;
            $maxRequests = 50;

            for ($i = 0; $i < $maxRequests; $i++) {
                // Select random requester and requestee (different users)
                $requesterId = array_rand($users);
                $requestedId = $requesterId;
                while ($requestedId == $requesterId) {
                    $requestedId = array_rand($users);
                }

                // Skip if either user has no IPAs
                if (empty($users[$requesterId]['ipas']) || empty($users[$requestedId]['ipas'])) {
                    continue;
                }

                // Random amount between 10 and 1,000
                $amount = mt_rand(1000, 100000) / 100;

                // Random status
                $status = $statuses[array_rand($statuses)];

                // Random message
                $message = $messages[array_rand($messages)];

                // Calculate dates
                $createdAt = date('Y-m-d H:i:s', strtotime('-' . mt_rand(0, 30) . ' days'));
                $updatedAt = date('Y-m-d H:i:s', strtotime($createdAt . ' +' . mt_rand(1, 7) . ' days'));

                // Select random IPAs for both users
                $requesterIpa = $users[$requesterId]['ipas'][array_rand($users[$requesterId]['ipas'])];
                $requestedIpa = $users[$requestedId]['ipas'][array_rand($users[$requestedId]['ipas'])];

                // Prepare request data
                $requestData = [
                    'requester_user_id' => $requesterId,
                    'requested_user_id' => $requestedId,
                    'requester_name' => $users[$requesterId]['name'],
                    'requested_name' => $users[$requestedId]['name'],
                    'amount' => $amount,
                    'requester_ipa_address' => $requesterIpa,
                    'requested_ipa_address' => $requestedIpa,
                    'message' => $message,
                    'status' => $status,
                    'created_at' => $createdAt,
                    'updated_at' => $updatedAt
                ];

                // Insert money request
                $stmt->execute($requestData);
                $requestCount++;
            }

            echo "Money requests table seeded successfully with $requestCount requests.\n";
        } catch (\Exception $e) {
            echo "Error seeding money requests table: " . $e->getMessage() . "\n";
        }
    }
} 