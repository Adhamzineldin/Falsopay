<?php

require_once __DIR__ . '/vendor/autoload.php';
use App\database\Database;

// Connect to the database
try {
    $dbConnection = Database::getInstance()->getConnection();
    echo "Connected to database. Dropping performance indexes...\n";

    // Dropping indexes for banks table
    $dbConnection->exec("DROP INDEX IF EXISTS idx_bank_code ON banks;");
    $dbConnection->exec("DROP INDEX IF EXISTS idx_swift_code ON banks;");
    
    // Dropping indexes for bank_users table
    $dbConnection->exec("DROP INDEX IF EXISTS idx_bank_user_email ON bank_users;");
    $dbConnection->exec("DROP INDEX IF EXISTS idx_bank_user_name ON bank_users;");
    $dbConnection->exec("DROP INDEX IF EXISTS idx_bank_user_phone ON bank_users;");
    
    // Dropping indexes for users table
    $dbConnection->exec("DROP INDEX IF EXISTS idx_user_email ON users;");
    $dbConnection->exec("DROP INDEX IF EXISTS idx_user_name ON users;");
    $dbConnection->exec("DROP INDEX IF EXISTS idx_user_phone ON users;");
    $dbConnection->exec("DROP INDEX IF EXISTS idx_default_account ON users;");
    
    // Dropping indexes for bank_accounts table
    $dbConnection->exec("DROP INDEX IF EXISTS idx_bank_account_user ON bank_accounts;");
    $dbConnection->exec("DROP INDEX IF EXISTS idx_bank_account_iban ON bank_accounts;");
    $dbConnection->exec("DROP INDEX IF EXISTS idx_bank_account_status ON bank_accounts;");
    $dbConnection->exec("DROP INDEX IF EXISTS idx_bank_account_type ON bank_accounts;");
    
    // Dropping indexes for instant_payment_addresses table
    $dbConnection->exec("DROP INDEX IF EXISTS idx_ipa_address ON instant_payment_addresses;");
    $dbConnection->exec("DROP INDEX IF EXISTS idx_ipa_user ON instant_payment_addresses;");
    $dbConnection->exec("DROP INDEX IF EXISTS idx_ipa_bank_account ON instant_payment_addresses;");
    
    // Dropping indexes for cards table
    $dbConnection->exec("DROP INDEX IF EXISTS idx_card_bank_user ON cards;");
    $dbConnection->exec("DROP INDEX IF EXISTS idx_card_bank ON cards;");
    $dbConnection->exec("DROP INDEX IF EXISTS idx_card_number ON cards;");
    $dbConnection->exec("DROP INDEX IF EXISTS idx_card_type ON cards;");
    
    // Dropping indexes for transactions table
    $dbConnection->exec("DROP INDEX IF EXISTS idx_transaction_sender_user ON transactions;");
    $dbConnection->exec("DROP INDEX IF EXISTS idx_transaction_receiver_user ON transactions;");
    $dbConnection->exec("DROP INDEX IF EXISTS idx_transaction_sender_account ON transactions;");
    $dbConnection->exec("DROP INDEX IF EXISTS idx_transaction_receiver_account ON transactions;");
    $dbConnection->exec("DROP INDEX IF EXISTS idx_transaction_sender_ipa ON transactions;");
    $dbConnection->exec("DROP INDEX IF EXISTS idx_transaction_receiver_ipa ON transactions;");
    $dbConnection->exec("DROP INDEX IF EXISTS idx_transaction_receiver_phone ON transactions;");
    $dbConnection->exec("DROP INDEX IF EXISTS idx_transaction_receiver_card ON transactions;");
    $dbConnection->exec("DROP INDEX IF EXISTS idx_transaction_receiver_iban ON transactions;");
    $dbConnection->exec("DROP INDEX IF EXISTS idx_transaction_method ON transactions;");
    $dbConnection->exec("DROP INDEX IF EXISTS idx_transaction_time ON transactions;");

    // Dropping indexes for favorites table
    $dbConnection->exec("DROP INDEX IF EXISTS idx_favorites_user ON favorites;");
    $dbConnection->exec("DROP INDEX IF EXISTS idx_favorites_method ON favorites;");
    $dbConnection->exec("DROP INDEX IF EXISTS idx_favorites_recipient ON favorites;");
    
    // Dropping indexes for support tickets
    $dbConnection->exec("DROP INDEX IF EXISTS idx_ticket_user ON support_tickets;");
    $dbConnection->exec("DROP INDEX IF EXISTS idx_ticket_status ON support_tickets;");
    
    // Dropping indexes for support replies
    $dbConnection->exec("DROP INDEX IF EXISTS idx_reply_ticket ON support_replies;");
    $dbConnection->exec("DROP INDEX IF EXISTS idx_reply_user ON support_replies;");

    echo "All performance indexes dropped successfully.\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
} 