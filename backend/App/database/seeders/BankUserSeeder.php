<?php

namespace App\database\seeders;

use App\database\Database;


class BankUserSeeder {
    public static function run() {
        try {
            $database = Database::getInstance();
            $pdo = $database->getConnection();

            $users = [
                ['Adham', 'Zineldin', 'Mohalya3@gmail.com', '201157000509', '2006-01-25'],
                ['Eyad', 'Gamal', 'eyadgamal18@gmail.com', '201099139550', '2006-01-26'],
                ['Ayman', 'AbdelAziz', 'aywork73@gmail.com', '201067107331', '2005-03-15'],
                ['Mohamed', 'Mansour', 'alhamood040@gmail.com', '201114592417', '1990-05-12'],
                ['Ahmed', 'Magdy', 'am4474646@gmail.com', '201119854524', '1985-08-23'],
                ['Mohamed', 'Ali', 'mooomali15@gmail.com', '201023707284', '1992-12-05'],
                ['Sara', 'Ibrahim', 'sara.ibrahim@gmail.com', '201345678901', '1988-03-17'],
                ['Omar', 'Khaled', 'omar.khaled@gmail.com', '201456789012', '1995-07-09'],
                ['Layla', 'Mostafa', 'layla.mostafa@gmail.com', '201567890123', '1993-04-28'],
                ['Yousef', 'Samir', 'yousef.samir@gmail.com', '201678901234', '1987-11-14'],
                ['Nour', 'Hany', 'nour.hany@gmail.com', '201789012345', '1991-02-19'],
                ['Hesham', 'Gamal', 'hesham.gamal@gmail.com', '201890123456', '1986-09-07'],
                ['Amira', 'Tamer', 'amira.tamer@gmail.com', '201901234567', '1994-06-30'],
                ['Kareem', 'Nasser', 'kareem.nasser@gmail.com', '201012345679', '1989-10-22'],
                ['Dina', 'Adel', 'dina.adel@gmail.com', '201123456780', '1996-01-08'],
                ['Ali', 'Mostafa', 'ali.mostafa@gmail.com', '201234567891', '1984-12-11'],
                ['Salma', 'Wael', 'salma.wael@gmail.com', '201345678902', '1990-07-25'],
                ['Tarek', 'Fawzy', 'tarek.fawzy@gmail.com', '201456789013', '1993-03-04'],
                ['Hoda', 'Magdy', 'hoda.magdy@gmail.com', '201567890124', '1988-08-16'],
                ['Mahmoud', 'Sherif', 'mahmoud.sherif@gmail.com', '201678901235', '1997-05-20']
            ];

            $stmt = $pdo->prepare("
                INSERT INTO bank_users (first_name, last_name, email, phone_number, date_of_birth)
                VALUES (:first_name, :last_name, :email, :phone_number, :date_of_birth)
            ");

            foreach ($users as [$first_name, $last_name, $email, $phone_number, $date_of_birth]) {
                $stmt->execute([
                    'first_name' => $first_name,
                    'last_name' => $last_name,
                    'email' => $email,
                    'phone_number' => $phone_number,
                    'date_of_birth' => $date_of_birth
                ]);
            }

            echo "Bank users table seeded successfully with 20 users.\n";
        } catch (\Exception $e) {
            echo "Error seeding bank users table: " . $e->getMessage() . "\n";
        }
    }
}