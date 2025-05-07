<?php

namespace App\database\seeders;

use App\database\Database;

class UserSeeder {
    public static function run() {
        try {
            $database = Database::getInstance();
            $pdo = $database->getConnection();

            $users = [
                ['Adham', 'Zineldin', 'Mohalya3@gmail.com', '201157000509', 'admin'],
                ['Eyad', 'Gamal', 'eyadgamal18@gmail.com', '201099139550', 'user'],
                ['Ayman', 'AbdelAziz', 'aywork73@gmail.com', '201067107331', 'user'],
                ['Mohamed', 'Mansour', 'alhamood040@gmail.com', '201114592417', 'user'],
                ['Ahmed', 'Magdy', 'am4474646@gmail.com', '201119854524', 'user'],
                ['Mohamed', 'Ali', 'mooomali15@gmail.com', '201023707284', 'user'],
                ['Sara', 'Ibrahim', 'sara.ibrahim@gmail.com', '201345678901', 'user'],
                ['Omar', 'Khaled', 'omar.khaled@gmail.com', '201456789012', 'user'],
                ['Layla', 'Mostafa', 'layla.mostafa@gmail.com', '201567890123', 'user'],
                ['Yousef', 'Samir', 'yousef.samir@gmail.com', '201678901234', 'user'],
                ['Nour', 'Hany', 'nour.hany@gmail.com', '201789012345', 'user'],
                ['Hesham', 'Gamal', 'hesham.gamal@gmail.com', '201890123456', 'user'],
                ['Amira', 'Tamer', 'amira.tamer@gmail.com', '201901234567', 'user'],
                ['Kareem', 'Nasser', 'kareem.nasser@gmail.com', '201012345679', 'user'],
                ['Dina', 'Adel', 'dina.adel@gmail.com', '201123456780', 'user'],
                ['Ali', 'Mostafa', 'ali.mostafa@gmail.com', '201234567891', 'user'],
                ['Salma', 'Wael', 'salma.wael@gmail.com', '201345678902', 'user'],
                ['Tarek', 'Fawzy', 'tarek.fawzy@gmail.com', '201456789013', 'user'],
                ['Hoda', 'Magdy', 'hoda.magdy@gmail.com', '201567890124', 'user'],
                ['Mahmoud', 'Sherif', 'mahmoud.sherif@gmail.com', '201678901235', 'user']
            ];

            $stmt = $pdo->prepare("
                INSERT INTO users (first_name, last_name, email, phone_number, role)
                VALUES (:first_name, :last_name, :email, :phone_number, :role)
            ");

            foreach ($users as [$first_name, $last_name, $email, $phone_number, $role]) {
                $stmt->execute([
                    'first_name' => $first_name,
                    'last_name' => $last_name,
                    'email' => $email,
                    'phone_number' => $phone_number,
                    'role' => $role
                ]);
            }

            echo "Users table seeded successfully with 20 users (Adham Zineldin set as admin).\n";

        } catch (\Exception $e) {
            echo "Error seeding users table: " . $e->getMessage() . "\n";
        }
    }
}