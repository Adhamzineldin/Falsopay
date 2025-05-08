# Falsopay Database Schema

## User Table
```sql
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    default_account INT NULL,
    role ENUM('user', 'admin', 'agent') NOT NULL DEFAULT 'user',
    status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
    FOREIGN KEY (default_account) REFERENCES bank_accounts(bank_account_id) ON DELETE SET NULL
);
```

## Bank Table
```sql
CREATE TABLE banks (
    bank_id INT AUTO_INCREMENT PRIMARY KEY,
    bank_name VARCHAR(100) NOT NULL,
    bank_code VARCHAR(20) NOT NULL UNIQUE,
    swift_code VARCHAR(11) NOT NULL UNIQUE
);
```

## BankUser Table
```sql
CREATE TABLE bank_users (
    bank_user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## BankAccount Table
```sql
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
```

## InstantPaymentAddress Table
```sql
CREATE TABLE instant_payment_addresses (
    ipa_id INT AUTO_INCREMENT PRIMARY KEY,
    bank_id INT NULL,
    account_number VARCHAR(30) NULL,
    ipa_address VARCHAR(50) NOT NULL UNIQUE,
    user_id INT NULL,
    pin CHAR(6) NOT NULL, -- Encrypted PIN
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bank_id) REFERENCES banks(bank_id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (bank_id, account_number) REFERENCES bank_accounts(bank_id, account_number) 
        ON DELETE SET NULL
);
```

## Card Table
```sql
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
```

## Transaction Table
```sql
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
```

## MoneyRequest Table
```sql
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
```

## Favorite Table
```sql
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
```

## SupportTicket Table
```sql
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
```

## SupportReply Table
```sql
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
```

## SystemSettings Table
```sql
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
``` 