# Falsopay Database ERD

```mermaid
erDiagram
    User {
        int user_id PK
        string first_name
        string last_name
        string email
        string phone_number
        datetime created_at
        int default_account FK
        string role
        string status
    }
    
    Bank {
        int bank_id PK
        string bank_name
        string bank_code
        string swift_code
    }
    
    BankUser {
        int bank_user_id PK
        string first_name
        string last_name
        string email
        string phone_number
        date date_of_birth
        datetime created_at
    }
    
    BankAccount {
        int bank_account_id PK
        int bank_id FK
        string account_number
        int bank_user_id FK
        string iban
        string status
        string type
        float balance
        datetime created_at
    }
    
    InstantPaymentAddress {
        int ipa_id PK
        int bank_id FK
        string account_number FK
        string ipa_address
        int user_id FK
        string pin
        datetime created_at
    }
    
    Card {
        int card_id PK
        int bank_user_id FK
        int bank_id FK
        string card_number
        string expiration_date
        string cvv
        string pin
        string card_type
        datetime created_at
    }
    
    Transaction {
        int transaction_id PK
        int sender_user_id FK
        int receiver_user_id FK
        string sender_name
        string receiver_name
        float amount
        int sender_bank_id FK
        int receiver_bank_id FK
        string sender_account_number
        string receiver_account_number
        datetime transaction_time
        string sender_ipa_address
        string receiver_ipa_address
        string receiver_phone
        string receiver_card
        string receiver_iban
        string transfer_method
    }
    
    MoneyRequest {
        int request_id PK
        int requester_user_id FK
        int requested_user_id FK
        string requester_name
        string requested_name
        float amount
        string requester_ipa_address
        string requested_ipa_address
        string message
        string status
        int transaction_id FK
        datetime created_at
        datetime updated_at
    }
    
    Favorite {
        int favorite_id PK
        int user_id FK
        string recipient_identifier
        string recipient_name
        string method
        int bank_id FK
        datetime created_at
    }
    
    SupportTicket {
        int ticket_id PK
        int user_id FK
        string subject
        string message
        string status
        string contact_name
        string contact_email
        string contact_phone
        datetime created_at
        datetime updated_at
    }
    
    SupportReply {
        int reply_id PK
        int ticket_id FK
        int user_id FK
        bool is_admin
        string message
        datetime created_at
    }
    
    SystemSettings {
        int setting_id PK
        bool transfer_limit_enabled
        float transfer_limit_amount
        bool transactions_blocked
        string block_message
        bool maintenance_mode
        string maintenance_message
        int updated_by FK
        datetime updated_at
        datetime created_at
    }
    
    User ||--o{ InstantPaymentAddress : "has"
    User ||--o{ Favorite : "has"
    User ||--o{ SupportTicket : "creates"
    User ||--o{ SupportReply : "creates"
    User ||--o{ Transaction : "sends/receives"
    User ||--o{ MoneyRequest : "requests/receives"
    
    Bank ||--o{ BankAccount : "offers"
    Bank ||--o{ Card : "issues"
    Bank ||--o{ InstantPaymentAddress : "associates"
    
    BankUser ||--o{ BankAccount : "owns"
    BankUser ||--o{ Card : "owns"
    
    SupportTicket ||--o{ SupportReply : "has"
    
    Transaction ||--o| MoneyRequest : "fulfills"
    
    BankAccount ||--o{ InstantPaymentAddress : "linked to"
```

## Table Descriptions

### User
Stores registered users of the Falsopay application.

### Bank
Stores information about banks integrated with Falsopay.

### BankUser
Stores bank customer information linked to accounts.

### BankAccount
Stores bank accounts associated with bank users.

### InstantPaymentAddress
Stores instant payment addresses (similar to usernames for payments).

### Card
Stores payment cards issued by banks.

### Transaction
Records all money transfers within the system.

### MoneyRequest
Stores money requests between users.

### Favorite
Stores user's favorite payment recipients.

### SupportTicket
Stores customer support inquiries.

### SupportReply
Stores replies to support tickets.

### SystemSettings
Stores system-wide settings and configurations.

## Database Relationships

1. A User can have multiple InstantPaymentAddresses
2. A User can have multiple Favorites
3. A User can create multiple SupportTickets and SupportReplies
4. A User can send/receive multiple Transactions and MoneyRequests
5. A Bank can offer multiple BankAccounts and issue multiple Cards
6. A Bank can be associated with multiple InstantPaymentAddresses
7. A BankUser can own multiple BankAccounts and Cards
8. A SupportTicket can have multiple SupportReplies
9. A Transaction can fulfill a MoneyRequest (1-to-1 optional relationship)
10. A BankAccount can be linked to multiple InstantPaymentAddresses 