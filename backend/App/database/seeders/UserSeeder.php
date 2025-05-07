<?php

namespace App\database\seeders;

use App\database\Database;

class UserSeeder {
    public static function run() {
        try {
            $database = Database::getInstance();
            $pdo = $database->getConnection();

            $users = [
                ['Adham', 'Zineldin', 'Mohalya3@gmail.com', '201157000509', true],
                ['Eyad', 'Gamal', 'eyadgamal18@gmail.com', '201099139550', false],
                ['Ayman', 'AbdelAziz', 'aywork73@gmail.com', '201067107331', false],
                ['Mohamed', 'Mansour', 'alhamood040@gmail.com', '201114592417', false],
                ['Ahmed', 'Magdy', 'am4474646@gmail.com', '201119854524', false],
                ['Mohamed', 'Ali', 'mooomali15@gmail.com', '201023707284', false],
                ['Sara', 'Ibrahim', 'sara.ibrahim@gmail.com', '201345678901', false],
                ['Omar', 'Khaled', 'omar.khaled@gmail.com', '201456789012', false],
                ['Layla', 'Mostafa', 'layla.mostafa@gmail.com', '201567890123', false],
                ['Yousef', 'Samir', 'yousef.samir@gmail.com', '201678901234', false],
                ['Nour', 'Hany', 'nour.hany@gmail.com', '201789012345', false],
                ['Hesham', 'Gamal', 'hesham.gamal@gmail.com', '201890123456', false],
                ['Amira', 'Tamer', 'amira.tamer@gmail.com', '201901234567', false],
                ['Kareem', 'Nasser', 'kareem.nasser@gmail.com', '201012345679', false],
                ['Dina', 'Adel', 'dina.adel@gmail.com', '201123456780', false],
                ['Ali', 'Mostafa', 'ali.mostafa@gmail.com', '201234567891', false],
                ['Salma', 'Wael', 'salma.wael@gmail.com', '201345678902', false],
                ['Tarek', 'Fawzy', 'tarek.fawzy@gmail.com', '201456789013', false],
                ['Hoda', 'Magdy', 'hoda.magdy@gmail.com', '201567890124', false],
                ['Mahmoud', 'Sherif', 'mahmoud.sherif@gmail.com', '201678901235', false]
            ];

            $stmt = $pdo->prepare("
                INSERT INTO users (first_name, last_name, email, phone_number, is_admin)
                VALUES (:first_name, :last_name, :email, :phone_number, :is_admin)
            ");

            foreach ($users as [$first_name, $last_name, $email, $phone_number, $is_admin]) {
                $stmt->execute([
                    'first_name' => $first_name,
                    'last_name' => $last_name,
                    'email' => $email,
                    'phone_number' => $phone_number,
                    'is_admin' => $is_admin
                ]);
            }

            echo "Users table seeded successfully with 20 users (Adham Zineldin set as admin).\n";

        } catch (\Exception $e) {
            echo "Error seeding users table: " . $e->getMessage() . "\n";
        }
    }
}