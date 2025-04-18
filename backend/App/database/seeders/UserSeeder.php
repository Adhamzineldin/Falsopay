<?php

namespace App\database\seeders;

use App\database\Database;

class UserSeeder {
    public static function run() {
        try {
            $database = Database::getInstance();
            $pdo = $database->getConnection();

            $sql = "
                INSERT INTO users (first_name, last_name, email, phone_number, Default_Account)
                VALUES
                    ('Adham', 'Zineldin', 'Mohalya3@gmail.com', '01157000509', 1),
                    ('Eyad', 'Smith', 'eyadgamal18@gmail.com', '01099139550', 2),
                    ('David', 'Davis', 'david.davis@example.com', '01011223344', 3);
            ";

            $pdo->exec($sql);
            echo "Users table seeded successfully.\n";
        } catch (\Exception $e) {
            echo "Error seeding users table: " . $e->getMessage() . "\n";
        }
    }
}
