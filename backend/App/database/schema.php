<?php

namespace App\database;

use Exception;
use PDO;

/**
 * Database schema creation script
 *
 * This file is used both directly and by the migration script
 */

// Only instantiate the database if this file is called directly
$isDirectCall = (basename(__FILE__) == basename($_SERVER['SCRIPT_FILENAME']));

// If called directly, we need to get the database instance
if ($isDirectCall) {
    require_once 'Database.php';
    $database = Database::getInstance();
    $pdo = $database->getConnection();
} else {
    // If called from migration, use the existing PDO instance
    $pdo = $this->pdo;
}

try {
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
        default_account INT DEFAULT NULL,  -- Add the Default_Account column here (no FK yet)
        role VARCHAR(20) DEFAULT 'user'  -- Add role column with default 'user'
    );

    -- 4. Bank_Accounts Table
    CREATE TABLE IF NOT EXISTS bank_accounts (
        bank_id INT,
        account_number VARCHAR(30),
        bank_user_id INT,
        iban VARCHAR(34),
        status ENUM('active', 'inactive') NOT NULL,
        type VARCHAR(20),
        balance DECIMAL(25, 2) NOT NULL,
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
        ipa_address VARCHAR(255) NOT NULL UNIQUE,
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
        pin VARCHAR(255) DEFAULT NULL, -- Hashed card PIN
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
        amount DECIMAL(25, 2) NOT NULL,
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

    -- Favorites Table for storing user's favorite recipients
    CREATE TABLE IF NOT EXISTS favorites (
        favorite_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        recipient_identifier VARCHAR(255) NOT NULL,
        recipient_name VARCHAR(255) NOT NULL,
        method ENUM('ipa', 'mobile', 'card', 'account', 'iban') NOT NULL,
        bank_id INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (bank_id) REFERENCES banks(bank_id) ON DELETE SET NULL ON UPDATE CASCADE
    );

    -- Support Tickets Table
    CREATE TABLE IF NOT EXISTS support_tickets (
        ticket_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status ENUM('open', 'in_progress', 'closed') NOT NULL DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    -- Support Ticket Replies Table
    CREATE TABLE IF NOT EXISTS support_replies (
        reply_id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id INT NOT NULL,
        user_id INT NOT NULL,
        is_admin BOOLEAN NOT NULL DEFAULT FALSE,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES support_tickets(ticket_id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
    );
    
    -- System Settings Table
    CREATE TABLE IF NOT EXISTS system_settings (
        setting_id INT AUTO_INCREMENT PRIMARY KEY,
        transfer_limit_enabled BOOLEAN NOT NULL DEFAULT FALSE,
        transfer_limit_amount DECIMAL(25, 2) NOT NULL DEFAULT 5000.00,
        transactions_blocked BOOLEAN NOT NULL DEFAULT FALSE,
        block_message TEXT NULL,
        maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
        maintenance_message TEXT NULL,
        updated_by INT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE
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

    $pdo->exec(" CREATE INDEX idx_bank_code ON banks(bank_code);
            CREATE INDEX idx_swift_code ON banks(swift_code);
            
            -- Indexes for bank_users table
            CREATE INDEX idx_bank_user_email ON bank_users(email);
            CREATE INDEX  idx_bank_user_name ON bank_users(last_name, first_name);
            CREATE INDEX  idx_bank_user_phone ON bank_users(phone_number);
            
            -- Indexes for users table
            CREATE INDEX  idx_user_email ON users(email);
            CREATE INDEX  idx_user_name ON users(last_name, first_name);
            CREATE INDEX  idx_user_phone ON users(phone_number);
            CREATE INDEX  idx_default_account ON users(default_account);
            
            -- Indexes for bank_accounts table
            CREATE INDEX  idx_bank_account_user ON bank_accounts(bank_user_id);
            CREATE INDEX  idx_bank_account_iban ON bank_accounts(iban);
            CREATE INDEX  idx_bank_account_status ON bank_accounts(status);
            CREATE INDEX  idx_bank_account_type ON bank_accounts(type);
            
            -- Indexes for instant_payment_addresses table
            CREATE INDEX  idx_ipa_address ON instant_payment_addresses(ipa_address);
            CREATE INDEX  idx_ipa_user ON instant_payment_addresses(user_id);
            CREATE INDEX  idx_ipa_bank_account ON instant_payment_addresses(bank_id, account_number);
            
            -- Indexes for cards table
            CREATE INDEX  idx_card_bank_user ON cards(bank_user_id);
            CREATE INDEX  idx_card_bank ON cards(bank_id);
            CREATE INDEX  idx_card_number ON cards(card_number);
            CREATE INDEX  idx_card_type ON cards(card_type);
            
            -- Indexes for transactions table
            CREATE INDEX  idx_transaction_sender_user ON transactions(sender_user_id);
            CREATE INDEX  idx_transaction_receiver_user ON transactions(receiver_user_id);
            CREATE INDEX  idx_transaction_sender_account ON transactions(sender_bank_id, sender_account_number);
            CREATE INDEX  idx_transaction_receiver_account ON transactions(receiver_bank_id, receiver_account_number);
            CREATE INDEX  idx_transaction_sender_ipa ON transactions(sender_ipa_address);
            CREATE INDEX  idx_transaction_receiver_ipa ON transactions(receiver_ipa_address);
            CREATE INDEX  idx_transaction_receiver_phone ON transactions(receiver_phone);
            CREATE INDEX  idx_transaction_receiver_card ON transactions(receiver_card);
            CREATE INDEX  idx_transaction_receiver_iban ON transactions(receiver_iban);
            CREATE INDEX  idx_transaction_method ON transactions(transfer_method);
            CREATE INDEX  idx_transaction_time ON transactions(transaction_time);

            -- Indexes for favorites table
            CREATE INDEX idx_favorites_user ON favorites(user_id);
            CREATE INDEX idx_favorites_method ON favorites(method);
            CREATE INDEX idx_favorites_recipient ON favorites(recipient_identifier);
            
            -- Indexes for support tickets
            CREATE INDEX idx_ticket_user ON support_tickets(user_id);
            CREATE INDEX idx_ticket_status ON support_tickets(status);
            
            -- Indexes for support replies
            CREATE INDEX idx_reply_ticket ON support_replies(ticket_id);
            CREATE INDEX idx_reply_user ON support_replies(user_id);
            
            -- Indexes for system settings
            CREATE INDEX idx_system_settings_maintenance ON system_settings(maintenance_mode);
            CREATE INDEX idx_system_settings_transactions ON system_settings(transactions_blocked);
");

    // Re-enable foreign key checks
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");

    // Insert default system settings
    $checkSettings = $pdo->query("SELECT COUNT(*) FROM system_settings");
    $settingsCount = $checkSettings->fetchColumn();
    
    if ($settingsCount == 0) {
        $pdo->exec("INSERT INTO system_settings 
            (transfer_limit_enabled, transfer_limit_amount, transactions_blocked, maintenance_mode) 
            VALUES 
            (FALSE, 5000.00, FALSE, FALSE)"
        );
    }

    // Only show success message if called directly
    if ($isDirectCall) {
        echo "Database schema created successfully.";
    }

} catch (Exception $e) {
    $errorMsg = "Error creating database schema: " . $e->getMessage();

    // If called directly, output the error
    if ($isDirectCall) {
        echo $errorMsg;
    }

    // If called from migration, propagate the error
    if (!$isDirectCall) {
        throw new Exception($errorMsg, 0, $e);
    }
}