-- FalsoPay Database Schema
-- This file contains the SQL statements to create the database tables for the FalsoPay payment system

-- User Table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    default_account INT NULL,
    role ENUM('user', 'admin', 'agent') NOT NULL DEFAULT 'user',
    status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active'
);

-- Bank Table
CREATE TABLE banks (
    bank_id INT AUTO_INCREMENT PRIMARY KEY,
    bank_name VARCHAR(100) NOT NULL,
    bank_code VARCHAR(20) NOT NULL UNIQUE,
    swift_code VARCHAR(11) NOT NULL UNIQUE
);

-- BankUser Table
CREATE TABLE bank_users (
    bank_user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- BankAccount Table
CREATE TABLE bank_accounts (
    bank_account_id INT AUTO_INCREMENT PRIMARY KEY,
    bank_id INT NOT NULL,
    account_number VARCHAR(30) NOT NULL,
    bank_user_id INT NOT NULL,
    iban VARCHAR(34) NOT NULL,
    status ENUM('active', 'inactive', 'suspended', 'closed') NOT NULL DEFAULT 'active',
    type ENUM('checking', 'savings', 'credit', 'loan') NOT NULL,
    balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bank_id) REFERENCES banks(bank_id),
    FOREIGN KEY (bank_user_id) REFERENCES bank_users(bank_user_id),
    UNIQUE (bank_id, account_number)
);

-- Add foreign key to users table after bank_accounts is created
ALTER TABLE users
ADD CONSTRAINT fk_default_account FOREIGN KEY (default_account) REFERENCES bank_accounts(bank_account_id) ON DELETE SET NULL;

-- InstantPaymentAddress Table
CREATE TABLE instant_payment_addresses (
    ipa_id INT AUTO_INCREMENT PRIMARY KEY,
    bank_id INT NULL,
    account_number VARCHAR(30) NULL,
    ipa_address VARCHAR(50) NOT NULL UNIQUE,
    user_id INT NULL,
    pin CHAR(6) NOT NULL, -- Encrypted PIN
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bank_id) REFERENCES banks(bank_id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Add composite foreign key for bank_id and account_number
ALTER TABLE instant_payment_addresses
ADD CONSTRAINT fk_bank_account FOREIGN KEY (bank_id, account_number) 
REFERENCES bank_accounts(bank_id, account_number) ON DELETE SET NULL;

-- Card Table
CREATE TABLE cards (
    card_id INT AUTO_INCREMENT PRIMARY KEY,
    bank_user_id INT NOT NULL,
    bank_id INT NOT NULL,
    card_number VARCHAR(19) NOT NULL UNIQUE,
    expiration_date VARCHAR(7) NOT NULL, -- MM/YYYY
    cvv CHAR(3) NOT NULL, -- Encrypted
    pin CHAR(4) NULL, -- Encrypted
    card_type ENUM('debit', 'credit') NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bank_user_id) REFERENCES bank_users(bank_user_id),
    FOREIGN KEY (bank_id) REFERENCES banks(bank_id)
);

-- Transaction Table
CREATE TABLE transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_user_id INT NULL,
    receiver_user_id INT NULL,
    sender_name VARCHAR(100) NULL,
    receiver_name VARCHAR(100) NULL,
    amount DECIMAL(15,2) NOT NULL,
    sender_bank_id INT NULL,
    receiver_bank_id INT NULL,
    sender_account_number VARCHAR(30) NULL,
    receiver_account_number VARCHAR(30) NULL,
    transaction_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sender_ipa_address VARCHAR(50) NULL,
    receiver_ipa_address VARCHAR(50) NULL,
    receiver_phone VARCHAR(20) NULL,
    receiver_card VARCHAR(19) NULL,
    receiver_iban VARCHAR(34) NULL,
    transfer_method ENUM('ipa', 'account', 'card', 'phone', 'iban') NOT NULL,
    FOREIGN KEY (sender_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (receiver_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (sender_bank_id) REFERENCES banks(bank_id) ON DELETE SET NULL,
    FOREIGN KEY (receiver_bank_id) REFERENCES banks(bank_id) ON DELETE SET NULL
);

-- MoneyRequest Table
CREATE TABLE money_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    requester_user_id INT NOT NULL,
    requested_user_id INT NOT NULL,
    requester_name VARCHAR(100) NOT NULL,
    requested_name VARCHAR(100) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    requester_ipa_address VARCHAR(50) NOT NULL,
    requested_ipa_address VARCHAR(50) NOT NULL,
    message TEXT NULL,
    status ENUM('pending', 'accepted', 'rejected', 'expired', 'cancelled') NOT NULL DEFAULT 'pending',
    transaction_id INT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_user_id) REFERENCES users(user_id),
    FOREIGN KEY (requested_user_id) REFERENCES users(user_id),
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id) ON DELETE SET NULL
);

-- Favorite Table
CREATE TABLE favorites (
    favorite_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    recipient_identifier VARCHAR(100) NOT NULL,
    recipient_name VARCHAR(100) NOT NULL,
    method ENUM('ipa', 'account', 'card', 'phone', 'iban') NOT NULL,
    bank_id INT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (bank_id) REFERENCES banks(bank_id) ON DELETE SET NULL,
    UNIQUE (user_id, recipient_identifier, method)
);

-- SupportTicket Table
CREATE TABLE support_tickets (
    ticket_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    subject VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('open', 'in_progress', 'resolved', 'closed') NOT NULL DEFAULT 'open',
    contact_name VARCHAR(100) NULL,
    contact_email VARCHAR(100) NULL,
    contact_phone VARCHAR(20) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- SupportReply Table
CREATE TABLE support_replies (
    reply_id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    user_id INT NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT 0,
    message TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(ticket_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- SystemSettings Table
CREATE TABLE system_settings (
    setting_id INT AUTO_INCREMENT PRIMARY KEY,
    transfer_limit_enabled BOOLEAN NOT NULL DEFAULT 0,
    transfer_limit_amount DECIMAL(15,2) NOT NULL DEFAULT 5000.00,
    transactions_blocked BOOLEAN NOT NULL DEFAULT 0,
    block_message TEXT NULL,
    maintenance_mode BOOLEAN NOT NULL DEFAULT 0,
    maintenance_message TEXT NULL,
    updated_by INT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Create indexes for performance optimization
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_phone ON users(phone_number);
CREATE INDEX idx_ipa_address ON instant_payment_addresses(ipa_address);
CREATE INDEX idx_ipa_user ON instant_payment_addresses(user_id);
CREATE INDEX idx_transaction_sender ON transactions(sender_user_id);
CREATE INDEX idx_transaction_receiver ON transactions(receiver_user_id);
CREATE INDEX idx_transaction_time ON transactions(transaction_time);
CREATE INDEX idx_money_request_requester ON money_requests(requester_user_id);
CREATE INDEX idx_money_request_requested ON money_requests(requested_user_id);
CREATE INDEX idx_money_request_status ON money_requests(status);
CREATE INDEX idx_support_ticket_user ON support_tickets(user_id);
CREATE INDEX idx_support_ticket_status ON support_tickets(status);
CREATE INDEX idx_support_ticket_created ON support_tickets(created_at); 