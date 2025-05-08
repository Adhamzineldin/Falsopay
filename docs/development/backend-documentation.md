# FalsoPay Backend Documentation

## System Overview

FalsoPay is a digital payment system that allows users to send and receive money through various transfer methods. The backend is built using PHP with a modular architecture that separates concerns into controllers, models, and services.

## Architecture

The backend follows a modified MVC (Model-View-Controller) architecture:

- **Models**: Represent data entities and handle database interactions
- **Controllers**: Process HTTP requests and coordinate business logic
- **Services**: Provide specialized functionality like notifications and external API interactions

## Directory Structure

```
backend/
├── App/
│   ├── controllers/     # Request handlers
│   ├── models/          # Data models and database operations
│   │   └── interfaces/  # Interfaces for models
│   │   └── dto/         # Data Transfer Objects
│   ├── services/        # Business logic services
│   ├── middleware/      # Request processing middleware
│   ├── routes/          # API route definitions
│   ├── config/          # Configuration files
│   └── database/        # Database connection and management
├── vendor/              # Dependencies (Composer packages)
├── public/              # Public-facing assets and entry point
├── test/                # Unit and integration tests
├── logs/                # Application logs
├── composer.json        # Dependency definitions
└── server.php           # Server entry point
```

## Core Components

### Controllers

Controllers handle HTTP requests and coordinate the application's response. Key controllers include:

#### AuthController

Handles user authentication and account management.

**Main Methods:**
- `login()`: Authenticates users based on phone number and IPA address
- `createUser()`: Registers new users in the system
- `deleteAccount()`: Removes user accounts and associated data

#### TransactionController

Manages money transfers between users.

**Main Methods:**
- `sendMoney()`: Core function for transferring funds between accounts
- `getTransactionsByUserId()`: Retrieves transaction history for a user
- `createTransaction()`: Creates transaction records in the database

#### BankAccountController

Manages bank account operations.

**Main Methods:**
- `linkAccountToService()`: Links bank accounts to FalsoPay using card details
- `getBalance()`: Retrieves account balance
- `addBalance()`: Adds funds to an account
- `subtractBalance()`: Removes funds from an account

### Models

Models represent data entities and handle database operations.

#### User

Represents a FalsoPay user account.

**Key Properties:**
- `user_id`: Unique identifier
- `first_name`, `last_name`: User's name
- `email`, `phone_number`: Contact information
- `default_account`: Default IPA account ID
- `role`: User role (user/admin)
- `status`: Account status (active/blocked)

**Main Methods:**
- `createUser()`: Creates a new user record
- `getUserById()`, `getUserByPhoneNumber()`, `getUserByEmail()`: Retrieve user data
- `updateUser()`: Updates user information
- `deleteUser()`: Removes a user from the system

#### Transaction

Represents a money transfer between accounts.

**Key Properties:**
- `transaction_id`: Unique identifier
- `sender_user_id`, `receiver_user_id`: User IDs involved
- `amount`: Transaction amount
- `transfer_method`: Method used (mobile, IPA, IBAN, card)
- `transaction_time`: Timestamp of the transaction

**Main Methods:**
- `createTransaction()`: Records a new transaction
- `getAll()`: Retrieves all transactions
- `getAllByUserId()`: Gets transactions for a specific user

#### BankAccount

Represents a bank account linked to the system.

**Key Properties:**
- `bank_id`, `account_number`: Composite primary key
- `bank_user_id`: Bank's user identifier
- `iban`: International Bank Account Number
- `status`: Account status
- `type`: Account type
- `balance`: Current balance

**Main Methods:**
- `create()`: Creates a new bank account record
- `getByCompositeKey()`, `getByIban()`: Retrieve account data
- `addBalance()`, `subtractBalance()`: Modify account balance
- `getBalance()`: Get current balance

### Services

Services implement business logic and integrate with external systems.

#### EmailService

Handles email notifications.

**Main Methods:**
- `sendVerificationCode()`: Sends verification codes for account setup
- `sendTransactionNotification()`: Notifies users about transactions

#### WhatsAppAPI

Integrates with WhatsApp for notifications.

**Main Methods:**
- `sendMessage()`: Sends WhatsApp messages to users

#### SocketService

Manages real-time communication.

**Main Methods:**
- `sendTransactionStatus()`: Broadcasts transaction status updates

## Database Schema

The system uses a relational database with the following key tables:

### users
- `user_id` (PK)
- `first_name`
- `last_name`
- `email`
- `phone_number`
- `default_account`
- `role`
- `status`

### transactions
- `transaction_id` (PK)
- `sender_user_id` (FK)
- `receiver_user_id` (FK)
- `amount`
- `sender_bank_id`, `receiver_bank_id`
- `sender_account_number`, `receiver_account_number`
- `transfer_method`
- `transaction_time`
- `sender_ipa_address`, `receiver_ipa_address`
- `sender_name`, `receiver_name`

### bank_accounts
- `bank_id`, `account_number` (Composite PK)
- `bank_user_id`
- `iban`
- `status`
- `type`
- `balance`

### instant_payment_addresses
- `ipa_id` (PK)
- `user_id` (FK)
- `ipa_address`
- `bank_id`, `account_number` (FK to bank_accounts)
- `pin_hash`

## API Endpoints

### Authentication
- `POST /api/register`: Create a new user account
- `POST /api/login`: Authenticate a user
- `POST /api/verify`: Verify a user's email/phone
- `POST /api/password-reset`: Request password reset

### Transactions
- `POST /api/transactions/prepare`: Prepare a transaction
- `POST /api/transactions/method`: Set transaction transfer method
- `POST /api/transactions/execute`: Execute a prepared transaction
- `GET /api/transactions`: Get all transactions
- `GET /api/transactions/user/{id}`: Get transactions for a user

### Bank Accounts
- `POST /api/banking/link`: Link a bank account
- `POST /api/banking/verify`: Verify a bank account
- `GET /api/accounts/balance`: Get account balance
- `POST /api/accounts/balance/add`: Add funds to an account
- `POST /api/accounts/balance/subtract`: Remove funds from an account

### Security
- `POST /api/security/verify-pin`: Verify user PIN

## Error Handling

The system uses HTTP status codes and JSON error responses:

- `200 OK`: Successful operation
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Authentication failed
- `403 Forbidden`: Permission denied
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate email)
- `500 Internal Server Error`: Server-side error

Error responses follow this format:
```json
{
  "error": "Error message description",
  "code": "ERROR_CODE"
}
```

## Security Features

- PIN verification for transactions
- Token-based authentication
- Role-based access control
- Transfer limits
- System-wide transaction blocking capability
- Account status monitoring

## Performance Considerations

- Database indexes on frequently queried fields
- Connection pooling for database access
- Caching for frequently accessed data
- Asynchronous processing for notifications

## Deployment Requirements

- PHP 8.0+
- MySQL/MariaDB 5.7+
- Composer for dependency management
- Web server with mod_rewrite support (Apache/Nginx)
- SSL certificate for secure communications 