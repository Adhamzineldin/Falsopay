# FalsoPay Database Design Documentation

## Overview

This document describes the database design for the FalsoPay payment system. The database is designed to support all core functionalities of the application, including user management, transaction processing, bank account integration, and security features.

## Database Management System

- **DBMS**: MySQL/MariaDB 5.7+
- **Character Set**: UTF-8
- **Collation**: utf8mb4_unicode_ci (to support all Unicode characters including emojis)

## Entity Relationship Diagram (ERD)

```
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│     users     │       │ transactions  │       │ bank_accounts │
├───────────────┤       ├───────────────┤       ├───────────────┤
│ PK user_id    │       │ PK transaction_id     │ PK bank_id    │
│    first_name │       │ FK sender_user_id     │ PK account_number
│    last_name  │       │ FK receiver_user_id   │ FK bank_user_id│
│    email      │       │    amount      │       │    iban       │
│    phone_number       │    transfer_method    │    status      │
│    default_account    │    transaction_time   │    type        │
│    role       │       │    sender_name │       │    balance     │
│    status     │       │    receiver_name       └───────┬───────┘
└───────┬───────┘       │    sender_bank_id             │
        │               │    receiver_bank_id           │
        │               │    sender_account_number      │
┌───────┴───────┐       │    receiver_account_number    │
│instant_payment_addresses    sender_ipa_address      │
├───────────────┤       │    receiver_ipa_address    │
│ PK ipa_id     │       │    receiver_phone │       │
│ FK user_id    │       │    receiver_card  │       │
│    ipa_address│       │    receiver_iban  │       │
│ FK bank_id    │       └───────────────────┘       │
│ FK account_number                                 │
│    pin_hash   │                                   │
└───────────────┘                                   │
        │                                           │
        │               ┌───────────────┐           │
        └───────────────┤     cards     ├───────────┘
                        ├───────────────┤
                        │ PK card_id    │
                        │ FK bank_id    │
                        │    card_number│
                        │ FK bank_user_id
                        │    pin_hash   │
                        │    expiry_date│
                        │    status     │
                        └───────────────┘
```

## Table Definitions

### users

Stores information about system users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the user |
| first_name | VARCHAR(50) | NOT NULL | User's first name |
| last_name | VARCHAR(50) | NOT NULL | User's last name |
| email | VARCHAR(100) | UNIQUE, NOT NULL | User's email address |
| phone_number | VARCHAR(20) | UNIQUE, NOT NULL | User's phone number |
| default_account | INT | NULL | Default IPA account ID |
| role | ENUM('user', 'admin', 'support') | NOT NULL, DEFAULT 'user' | User's role in the system |
| status | ENUM('active', 'blocked', 'pending') | NOT NULL, DEFAULT 'active' | User's account status |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | When the user was created |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | When the user was last updated |

**Indexes:**
- PRIMARY KEY (user_id)
- UNIQUE INDEX (email)
- UNIQUE INDEX (phone_number)
- INDEX (role)
- INDEX (status)

### transactions

Records all money transfers between users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| transaction_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the transaction |
| sender_user_id | INT | FOREIGN KEY, NOT NULL | User ID of the sender |
| receiver_user_id | INT | FOREIGN KEY, NOT NULL | User ID of the receiver |
| sender_name | VARCHAR(100) | NOT NULL | Name of the sender |
| receiver_name | VARCHAR(100) | NOT NULL | Name of the receiver |
| amount | DECIMAL(10,2) | NOT NULL | Transaction amount |
| sender_bank_id | INT | NULL | Bank ID of sender |
| receiver_bank_id | INT | NULL | Bank ID of receiver |
| sender_account_number | VARCHAR(50) | NULL | Account number of sender |
| receiver_account_number | VARCHAR(50) | NULL | Account number of receiver |
| sender_ipa_address | VARCHAR(100) | NULL | IPA address of sender |
| receiver_ipa_address | VARCHAR(100) | NULL | IPA address of receiver |
| receiver_phone | VARCHAR(20) | NULL | Phone number of receiver (for phone transfers) |
| receiver_card | VARCHAR(20) | NULL | Card number of receiver (for card transfers) |
| receiver_iban | VARCHAR(50) | NULL | IBAN of receiver (for IBAN transfers) |
| transfer_method | ENUM('ipa', 'bank', 'phone', 'card', 'iban') | NOT NULL | Method used for the transfer |
| transaction_time | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | When the transaction occurred |
| status | ENUM('pending', 'completed', 'failed', 'cancelled') | NOT NULL, DEFAULT 'completed' | Status of the transaction |

**Indexes:**
- PRIMARY KEY (transaction_id)
- FOREIGN KEY (sender_user_id) REFERENCES users(user_id)
- FOREIGN KEY (receiver_user_id) REFERENCES users(user_id)
- INDEX (sender_user_id)
- INDEX (receiver_user_id)
- INDEX (transaction_time)
- INDEX (status)
- INDEX (transfer_method)

### bank_accounts

Stores information about bank accounts linked to the system.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| bank_id | INT | PRIMARY KEY (composite) | Bank identifier |
| account_number | VARCHAR(50) | PRIMARY KEY (composite) | Account number within the bank |
| bank_user_id | INT | NOT NULL | User ID in the bank's system |
| iban | VARCHAR(50) | UNIQUE | International Bank Account Number |
| status | ENUM('active', 'inactive', 'blocked') | NOT NULL, DEFAULT 'active' | Status of the bank account |
| type | ENUM('checking', 'savings', 'credit') | NOT NULL | Type of bank account |
| balance | DECIMAL(12,2) | NOT NULL, DEFAULT 0.00 | Current balance |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | When the account was added |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | When the account was last updated |

**Indexes:**
- PRIMARY KEY (bank_id, account_number)
- UNIQUE INDEX (iban)
- INDEX (bank_user_id)
- INDEX (status)

### instant_payment_addresses

Manages IPA (Instant Payment Address) accounts for quick payments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| ipa_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the IPA |
| user_id | INT | FOREIGN KEY, NOT NULL | User who owns this IPA |
| ipa_address | VARCHAR(100) | UNIQUE, NOT NULL | The IPA address (e.g., username@falsopay) |
| bank_id | INT | FOREIGN KEY (composite), NULL | Associated bank ID |
| account_number | VARCHAR(50) | FOREIGN KEY (composite), NULL | Associated account number |
| pin_hash | VARCHAR(255) | NOT NULL | Hashed PIN for transaction verification |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | When the IPA was created |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | When the IPA was last updated |

**Indexes:**
- PRIMARY KEY (ipa_id)
- FOREIGN KEY (user_id) REFERENCES users(user_id)
- FOREIGN KEY (bank_id, account_number) REFERENCES bank_accounts(bank_id, account_number)
- UNIQUE INDEX (ipa_address)
- INDEX (user_id)

### cards

Stores information about payment cards linked to bank accounts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| card_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the card |
| bank_id | INT | FOREIGN KEY (composite), NOT NULL | Associated bank ID |
| card_number | VARCHAR(20) | NOT NULL | Card number (stored securely) |
| bank_user_id | INT | NOT NULL | User ID in the bank's system |
| pin_hash | VARCHAR(255) | NOT NULL | Hashed PIN for the card |
| expiry_date | DATE | NOT NULL | Card expiration date |
| status | ENUM('active', 'inactive', 'blocked') | NOT NULL, DEFAULT 'active' | Status of the card |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | When the card was added |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | When the card was last updated |

**Indexes:**
- PRIMARY KEY (card_id)
- UNIQUE INDEX (bank_id, card_number)
- INDEX (bank_user_id)
- INDEX (status)

### bank_users

Stores information about users in the banking system.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| bank_user_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the bank user |
| first_name | VARCHAR(50) | NOT NULL | User's first name in the bank |
| last_name | VARCHAR(50) | NOT NULL | User's last name in the bank |
| phone_number | VARCHAR(20) | UNIQUE, NOT NULL | User's phone number |
| email | VARCHAR(100) | UNIQUE, NULL | User's email address |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | When the bank user was created |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | When the bank user was last updated |

**Indexes:**
- PRIMARY KEY (bank_user_id)
- UNIQUE INDEX (phone_number)
- UNIQUE INDEX (email)

### banks

Stores information about banks integrated with the system.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| bank_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the bank |
| name | VARCHAR(100) | NOT NULL | Bank name |
| code | VARCHAR(20) | UNIQUE, NOT NULL | Bank code |
| status | ENUM('active', 'inactive') | NOT NULL, DEFAULT 'active' | Status of the bank integration |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | When the bank was added |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | When the bank was last updated |

**Indexes:**
- PRIMARY KEY (bank_id)
- UNIQUE INDEX (code)

### money_requests

Stores money request information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| request_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the request |
| requester_user_id | INT | FOREIGN KEY, NOT NULL | User ID of the requester |
| requested_user_id | INT | FOREIGN KEY, NOT NULL | User ID of the requested person |
| amount | DECIMAL(10,2) | NOT NULL | Requested amount |
| description | VARCHAR(255) | NULL | Description of the request |
| status | ENUM('pending', 'approved', 'rejected', 'cancelled') | NOT NULL, DEFAULT 'pending' | Status of the request |
| transaction_id | INT | FOREIGN KEY, NULL | Associated transaction ID if approved |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | When the request was created |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | When the request was last updated |

**Indexes:**
- PRIMARY KEY (request_id)
- FOREIGN KEY (requester_user_id) REFERENCES users(user_id)
- FOREIGN KEY (requested_user_id) REFERENCES users(user_id)
- FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id)
- INDEX (requester_user_id)
- INDEX (requested_user_id)
- INDEX (status)

### favorites

Stores favorite recipients for quick transfers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| favorite_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the favorite |
| user_id | INT | FOREIGN KEY, NOT NULL | User who created the favorite |
| recipient_user_id | INT | FOREIGN KEY, NULL | Recipient user ID (if a system user) |
| recipient_name | VARCHAR(100) | NOT NULL | Name of the recipient |
| recipient_type | ENUM('user', 'phone', 'ipa', 'bank') | NOT NULL | Type of recipient |
| recipient_value | VARCHAR(100) | NOT NULL | Value based on type (phone, IPA, account) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | When the favorite was created |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | When the favorite was last updated |

**Indexes:**
- PRIMARY KEY (favorite_id)
- FOREIGN KEY (user_id) REFERENCES users(user_id)
- FOREIGN KEY (recipient_user_id) REFERENCES users(user_id)
- INDEX (user_id)
- INDEX (recipient_type)

### system_settings

Stores system-wide configuration settings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| setting_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the setting |
| setting_key | VARCHAR(50) | UNIQUE, NOT NULL | Setting key name |
| setting_value | TEXT | NOT NULL | Setting value |
| description | VARCHAR(255) | NULL | Description of the setting |
| updated_by | INT | FOREIGN KEY, NOT NULL | User who last updated the setting |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | When the setting was created |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | When the setting was last updated |

**Indexes:**
- PRIMARY KEY (setting_id)
- UNIQUE INDEX (setting_key)
- FOREIGN KEY (updated_by) REFERENCES users(user_id)

### support_tickets

Stores customer support tickets.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| ticket_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the ticket |
| user_id | INT | FOREIGN KEY, NOT NULL | User who created the ticket |
| subject | VARCHAR(100) | NOT NULL | Ticket subject |
| description | TEXT | NOT NULL | Ticket description |
| status | ENUM('open', 'in_progress', 'resolved', 'closed') | NOT NULL, DEFAULT 'open' | Status of the ticket |
| priority | ENUM('low', 'medium', 'high', 'critical') | NOT NULL, DEFAULT 'medium' | Ticket priority |
| assigned_to | INT | FOREIGN KEY, NULL | Support agent assigned to the ticket |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | When the ticket was created |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | When the ticket was last updated |

**Indexes:**
- PRIMARY KEY (ticket_id)
- FOREIGN KEY (user_id) REFERENCES users(user_id)
- FOREIGN KEY (assigned_to) REFERENCES users(user_id)
- INDEX (status)
- INDEX (priority)
- INDEX (assigned_to)

## Data Relationships

1. **User to Transactions**: One-to-many relationship. A user can have multiple transactions as either sender or receiver.

2. **User to IPAs**: One-to-many relationship. A user can have multiple IPA addresses.

3. **IPA to Bank Account**: Many-to-one relationship. Multiple IPAs can be linked to the same bank account.

4. **Bank Account to Cards**: One-to-many relationship. A bank account can have multiple cards associated with it.

5. **User to Money Requests**: One-to-many relationship. A user can create multiple money requests and receive multiple requests from others.

6. **User to Favorites**: One-to-many relationship. A user can have multiple favorite recipients.

## Data Integrity Constraints

1. **Referential Integrity**: Foreign key constraints ensure that relationships between tables are maintained.

2. **Entity Integrity**: Primary key constraints ensure that each record is uniquely identifiable.

3. **Domain Integrity**: Data types, NOT NULL constraints, and ENUM values ensure that data conforms to expected formats and ranges.

4. **Business Rules**:
   - A transaction must have both sender and receiver
   - Money requests can only be approved if the requested user exists
   - Bank accounts must have valid bank IDs
   - PIN values are stored as secure hashes, never in plain text

## Indexing Strategy

1. **Primary Keys**: All tables have primary keys for efficient record retrieval.

2. **Foreign Keys**: Indexed to optimize join operations.

3. **Frequently Queried Columns**: Columns used in WHERE clauses, such as status fields, are indexed.

4. **Unique Constraints**: Columns with unique constraints are indexed to enforce uniqueness efficiently.

5. **Composite Indexes**: Used for queries that filter on multiple columns simultaneously.

## Security Considerations

1. **Sensitive Data**: PIN numbers, card numbers, and other sensitive data are stored using secure hashing algorithms.

2. **Access Control**: Database access is restricted based on role-based permissions.

3. **Encryption**: Data in transit is encrypted using TLS/SSL.

4. **Audit Logging**: Changes to critical data are logged for security auditing.

5. **Data Isolation**: Production data is isolated from development and testing environments.

## Performance Considerations

1. **Query Optimization**: Queries are optimized to use indexes effectively.

2. **Normalization**: The database is normalized to reduce redundancy while maintaining performance.

3. **Connection Pooling**: Used to manage database connections efficiently.

4. **Sharding Strategy**: For future growth, the transactions table can be sharded by date ranges.

5. **Archiving Strategy**: Historical transaction data can be archived to maintain performance of active data queries.

## Backup and Recovery

1. **Backup Schedule**: Full backups daily, incremental backups hourly.

2. **Retention Policy**: Backups are retained for 90 days.

3. **Recovery Testing**: Regular testing of backup restoration procedures.

4. **Point-in-Time Recovery**: Transaction logs enable recovery to any point in time within the retention period.

## Conclusion

The FalsoPay database design provides a robust foundation for the payment system, supporting all required functionality while maintaining data integrity, security, and performance. The design allows for future expansion and scaling as the user base and transaction volume grow. 