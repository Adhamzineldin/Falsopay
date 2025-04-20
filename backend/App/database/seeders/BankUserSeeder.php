<?php

namespace App\database\seeders;

use App\database\Database;


class BankUserSeeder {
    public static function run() {
        try {
            $database = Database::getInstance();
            $pdo = $database->getConnection();

            $sql = "
                INSERT INTO bank_users (first_name, last_name, email, phone_number, date_of_birth)
                VALUES
                    ('Adham', 'Zineldin', 'Mohalya3@gmail.com', '201157000509', '2006-01-25'),
                    ('Eyad', 'Smith', 'eyadgamal18@gmail.com', '201099139550', '2006-01-26'),
                    ('Alex', 'Johnson', 'alex.johnson@example.com', '201011223344', '1982-03-15');
            ";

            $pdo->exec($sql);
            echo "Bank users table seeded successfully.\n";
        } catch (\Exception $e) {
            echo "Error seeding bank users table: " . $e->getMessage() . "\n";
        }
    }
}
