<?php

namespace App\database;

use Exception;
use PDO;

require_once 'Database.php';  // If both files are in the same folder

try {
    // Get the singleton instance of the Database
    $database = Database::getInstance();
    $pdo = $database->getConnection();

    // Start by disabling foreign key checks to avoid circular reference issues during table creation
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");

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

    -- 3. Users Table (Without the Default_Account FK initially)
    CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone_number VARCHAR(15) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        default_account INT DEFAULT NULL  -- Add the Default_Account column here (no FK yet)
    );

    -- 4. Bank_Accounts Table
    CREATE TABLE IF NOT EXISTS bank_accounts (
        bank_id INT,
        account_number VARCHAR(30),
        bank_user_id INT,
        iban VARCHAR(34),
        status ENUM('active', 'inactive') NOT NULL,
        type VARCHAR(20),
        balance DECIMAL(20, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (bank_id, account_number),
        FOREIGN KEY (bank_id) REFERENCES banks(bank_id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (bank_user_id) REFERENCES bank_users(bank_user_id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    -- 5. Instant_Payment_Addresses Table (Without the user_id FK initially)
    CREATE TABLE IF NOT EXISTS instant_payment_addresses (
        ipa_id INT AUTO_INCREMENT PRIMARY KEY,
        bank_id INT,
        account_number VARCHAR(30),  -- This must match the type of account_number
        ipa_address VARCHAR(255) NOT NULL,
        user_id INT,  -- Foreign key for users
        pin VARCHAR(255) NOT NULL,  -- Add PIN (can be hashed or plain depending on use case)
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bank_id, account_number) REFERENCES bank_accounts(bank_id, account_number) ON DELETE CASCADE ON UPDATE CASCADE
    );

    -- 6. Cards Table
    CREATE TABLE IF NOT EXISTS cards (
        card_id INT AUTO_INCREMENT PRIMARY KEY,
        bank_user_id INT,
        bank_id INT,
        card_number VARCHAR(19) NOT NULL,
        expiration_date DATE NOT NULL,
        cvv VARCHAR(4) NOT NULL,
        pin VARCHAR(255) DEFAULT NULL , -- Hashed card PIN
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
        sender_name VARCHAR(255),  -- Added for sender's name
        receiver_name VARCHAR(255),  -- Added for receiver's name
        amount DECIMAL(10, 2) NOT NULL,
        sender_bank_id INT,
        receiver_bank_id INT,
        sender_account_number VARCHAR(30),
        receiver_account_number VARCHAR(30),
        transaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sender_ipa_address VARCHAR(255),  -- Added for sender IPA address
        receiver_ipa_address VARCHAR(255),  -- Added for receiver IPA address
        receiver_phone VARCHAR(15),  -- Added for receiver phone number
        receiver_card VARCHAR(19),  -- Added for receiver card number
        receiver_iban VARCHAR(34),  -- Added for receiver IBAN
        transfer_method ENUM('ipa', 'mobile', 'card', 'account', 'iban') NOT NULL,  -- Added for transfer method
        FOREIGN KEY (sender_user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (receiver_user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (sender_bank_id, sender_account_number) REFERENCES bank_accounts(bank_id, account_number) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (receiver_bank_id, receiver_account_number) REFERENCES bank_accounts(bank_id, account_number) ON DELETE CASCADE ON UPDATE CASCADE
    );




    ";

    // Execute the query to create the tables
    $pdo->exec($sql);

    // Now we can safely add the foreign keys that reference each other
    $pdo->exec("ALTER TABLE users 
        ADD FOREIGN KEY (Default_Account) 
        REFERENCES instant_payment_addresses(ipa_id) 
        ON DELETE SET NULL ON UPDATE CASCADE;");

    $pdo->exec("ALTER TABLE instant_payment_addresses
        ADD FOREIGN KEY (user_id) 
        REFERENCES users(user_id) 
        ON DELETE CASCADE ON UPDATE CASCADE;");

    // Re-enable foreign key checks
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");

    echo "Database schema created successfully.";

} catch (Exception $e) {
    echo "Error creating database schema: " . $e->getMessage();
}
