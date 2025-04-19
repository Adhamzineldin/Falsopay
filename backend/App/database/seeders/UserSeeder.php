<?php

namespace App\database\seeders;

use App\database\Database;

class UserSeeder {
    public static function run() {
        try {
            $database = Database::getInstance();
            $pdo = $database->getConnection();

            // Step 1: Insert users WITHOUT Default_Account
            $sql = "
                INSERT INTO users (first_name, last_name, email, phone_number)
                VALUES
                    ('Adham', 'Zineldin', 'Mohalya3@gmail.com', '01157000509'),
                    ('Eyad', 'Smith', 'eyadgamal18@gmail.com', '01099139550'),
                    ('David', 'Davis', 'david.davis@example.com', '01011223344');
            ";
            $pdo->exec($sql);
            echo "Users table initially seeded without Default_Account.\n";
            

        } catch (\Exception $e) {
            echo "Error seeding users table: " . $e->getMessage() . "\n";
        }
    }
}
