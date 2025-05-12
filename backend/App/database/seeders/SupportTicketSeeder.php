<?php

namespace App\database\seeders;

use App\database\Database;

class SupportTicketSeeder {
    public static function run() {
        try {
            $database = Database::getInstance();
            $pdo = $database->getConnection();

            // Get all users
            $userQuery = $pdo->query("SELECT user_id, first_name, last_name, email, phone_number FROM users");
            $users = [];
            while ($row = $userQuery->fetch(\PDO::FETCH_ASSOC)) {
                $users[$row['user_id']] = [
                    'name' => $row['first_name'] . ' ' . $row['last_name'],
                    'email' => $row['email'],
                    'phone' => $row['phone_number']
                ];
            }

            // Ticket statuses
            $statuses = ['open', 'in_progress', 'closed'];

            // Common ticket subjects
            $subjects = [
                'Cannot access my account',
                'Payment not received',
                'App not working properly',
                'Suspicious activity detected',
                'Transaction failed',
                'Need help with new feature',
                'Billing discrepancy',
                'General question about service'
            ];

            // Common ticket messages
            $messages = [
                'I am having trouble accessing my account. Please help.',
                'I sent a payment but it hasn\'t been received yet.',
                'The app keeps crashing when I try to make a payment.',
                'I noticed some unusual activity in my account.',
                'My transaction failed and I need assistance.',
                'How do I use the new feature?',
                'I was charged twice for the same transaction.',
                'I have a question about how the service works.'
            ];

            // Prepare statement for ticket insertion
            $stmt = $pdo->prepare("
                INSERT INTO support_tickets (
                    user_id, subject, message, status,
                    contact_name, contact_email, contact_phone,
                    created_at, updated_at
                )
                VALUES (
                    :user_id, :subject, :message, :status,
                    :contact_name, :contact_email, :contact_phone,
                    :created_at, :updated_at
                )
            ");

            // Generate 100 random support tickets
            $ticketCount = 0;
            $maxTickets = 100;

            for ($i = 0; $i < $maxTickets; $i++) {
                // Select random user
                $userId = array_rand($users);
                $user = $users[$userId];

                // Select random subject and message
                $subjectIndex = array_rand($subjects);
                $subject = $subjects[$subjectIndex];
                $message = $messages[$subjectIndex];

                // Random status
                $status = $statuses[array_rand($statuses)];

                // Calculate dates
                $createdAt = date('Y-m-d H:i:s', strtotime('-' . mt_rand(0, 30) . ' days'));
                $updatedAt = date('Y-m-d H:i:s', strtotime($createdAt . ' +' . mt_rand(1, 7) . ' days'));

                // Prepare ticket data
                $ticketData = [
                    'user_id' => $userId,
                    'subject' => $subject,
                    'message' => $message,
                    'status' => $status,
                    'contact_name' => $user['name'],
                    'contact_email' => $user['email'],
                    'contact_phone' => $user['phone'],
                    'created_at' => $createdAt,
                    'updated_at' => $updatedAt
                ];

                // Insert ticket
                $stmt->execute($ticketData);
                $ticketCount++;
            }

            echo "Support tickets table seeded successfully with $ticketCount tickets.\n";
        } catch (\Exception $e) {
            echo "Error seeding support tickets table: " . $e->getMessage() . "\n";
        }
    }
} 