<?php

namespace App\database;

use Exception;
use PDO;

require_once 'Database.php';  // If both files are in the same folder

try {
    // Get the singleton instance of the Database
    $database = Database::getInstance();
    $pdo = $database->getConnection();

    // Create the tables

    $sql =  /* language=SQL */ "

    -- 1. Banks Table
    CREATE TABLE IF NOT EXISTS banks (
        bank_id INT AUTO_INCREMENT PRIMARY KEY,
        bank_name VARCHAR(255) NOT NULL,
        bank_code VARCHAR(50) NOT NULL,
        swift_code VARCHAR(50) NOT NULL
    );

    -- 2. Bank_Users Table
    CREATE TABLE IF NOT EXISTS bank_users (
        bank_user_id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone_number VARCHAR(15) NOT NULL,
        date_of_birth DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. Bank_Accounts Table
    CREATE TABLE IF NOT EXISTS bank_accounts (
        bank_id INT,
        account_number VARCHAR(30),
        bank_user_id INT,
        iban VARCHAR(34),
        status ENUM('active', 'inactive') NOT NULL,
        type VARCHAR(20),
        balance DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (bank_id, account_number),
        FOREIGN KEY (bank_id) REFERENCES banks(bank_id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (bank_user_id) REFERENCES bank_users(bank_user_id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    -- 4. Instant_Payment_Addresses Table (Ensure the account_id matches account_number type)
    CREATE TABLE IF NOT EXISTS instant_payment_addresses (
        ipa_id INT AUTO_INCREMENT PRIMARY KEY,
        bank_id INT,
        account_id VARCHAR(30),  -- This must match the type of account_number
        ipa_address VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bank_id, account_id) REFERENCES bank_accounts(bank_id, account_number) ON DELETE CASCADE ON UPDATE CASCADE
    );

    -- 5. Users Table
    CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone_number VARCHAR(15) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        Default_Account INT,
        FOREIGN KEY (Default_Account) REFERENCES instant_payment_addresses(ipa_id) ON DELETE SET NULL ON UPDATE CASCADE
    );

    -- 6. Cards Table
    CREATE TABLE IF NOT EXISTS cards (
        card_id INT AUTO_INCREMENT PRIMARY KEY,
        bank_user_id INT,
        bank_id INT,
        card_number VARCHAR(19) NOT NULL,
        expiration_date DATE NOT NULL,
        cvv VARCHAR(4) NOT NULL,
        card_type ENUM('debit', 'prepaid') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bank_user_id) REFERENCES bank_users(bank_user_id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (bank_id) REFERENCES banks(bank_id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    -- 7. Transactions Table
    CREATE TABLE IF NOT EXISTS transactions (
        transaction_id INT AUTO_INCREMENT PRIMARY KEY,
        sender_user_id INT,
        receiver_user_id INT,
        amount DECIMAL(10, 2) NOT NULL,
        transaction_type ENUM('send', 'receive') NOT NULL,
        sender_bank_id INT,
        receiver_bank_id INT,
        transaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ipa_used BOOLEAN NOT NULL DEFAULT FALSE,  -- This will store whether IPA was used or not
        ipa_id INT,  -- This will be a nullable foreign key initially
        status ENUM('pending', 'completed', 'failed') NOT NULL,
        FOREIGN KEY (sender_user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (receiver_user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (sender_bank_id) REFERENCES banks(bank_id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (receiver_bank_id) REFERENCES banks(bank_id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (ipa_id) REFERENCES instant_payment_addresses(ipa_id) ON DELETE SET NULL ON UPDATE CASCADE
    );
    ";

    // Execute the query to create the tables
    $pdo->exec($sql);
    echo "Database schema created successfully.";

} catch (Exception $e) {
    echo "Error creating database schema: " . $e->getMessage();
}
