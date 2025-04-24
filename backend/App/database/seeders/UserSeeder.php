<?php

namespace App\database\seeders;

use App\database\Database;

class UserSeeder {
    public static function run() {
        try {
            $database = Database::getInstance();
            $pdo = $database->getConnection();

            $users = [
                ['Adham', 'Zineldin', 'Mohalya3@gmail.com', '201157000509'],
                ['Eyad', 'Smith', 'eyadgamal18@gmail.com', '201099139550'],
                ['Ayman', 'Abdel Aziz', 'aywork73@gmail.com', '201067107331'],
                ['Mohamed', 'Mansour', 'alhamood040@gmail.com', '201114592417'],
                ['Ahmed', 'Magdy', 'am4474646@gmail.com', '201119854524'],
                ['Fatima', 'Ali', 'fatima.ali@gmail.com', '201234567890'],
                ['Sara', 'Ibrahim', 'sara.ibrahim@gmail.com', '201345678901'],
                ['Omar', 'Khaled', 'omar.khaled@gmail.com', '201456789012'],
                ['Layla', 'Mostafa', 'layla.mostafa@gmail.com', '201567890123'],
                ['Yousef', 'Samir', 'yousef.samir@gmail.com', '201678901234'],
                ['Nour', 'Hany', 'nour.hany@gmail.com', '201789012345'],
                ['Hesham', 'Gamal', 'hesham.gamal@gmail.com', '201890123456'],
                ['Amira', 'Tamer', 'amira.tamer@gmail.com', '201901234567'],
                ['Kareem', 'Nasser', 'kareem.nasser@gmail.com', '201012345679'],
                ['Dina', 'Adel', 'dina.adel@gmail.com', '201123456780'],
                ['Ali', 'Mostafa', 'ali.mostafa@gmail.com', '201234567891'],
                ['Salma', 'Wael', 'salma.wael@gmail.com', '201345678902'],
                ['Tarek', 'Fawzy', 'tarek.fawzy@gmail.com', '201456789013'],
                ['Hoda', 'Magdy', 'hoda.magdy@gmail.com', '201567890124'],
                ['Mahmoud', 'Sherif', 'mahmoud.sherif@gmail.com', '201678901235']
            ];

            $stmt = $pdo->prepare("
                INSERT INTO users (first_name, last_name, email, phone_number)
                VALUES (:first_name, :last_name, :email, :phone_number)
            ");

            foreach ($users as [$first_name, $last_name, $email, $phone_number]) {
                $stmt->execute([
                    'first_name' => $first_name,
                    'last_name' => $last_name,
                    'email' => $email,
                    'phone_number' => $phone_number
                ]);
            }

            echo "Users table seeded successfully with 20 users.\n";

        } catch (\Exception $e) {
            echo "Error seeding users table: " . $e->getMessage() . "\n";
        }
    }
}