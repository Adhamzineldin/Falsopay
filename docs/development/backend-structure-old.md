# FalsoPay Backend Structure

This document explains the folder structure of the **FalsoPay Backend** application and provides details on the purpose and functionality of each directory and file.

## Project Structure


```plaintext
/falsopay-backend
│
├── app/                              # Core application logic
│   ├── Console/                      # Custom Artisan commands
│   │   └── CustomServe.php           # Custom command for running the Laravel server with specific parameters
│   │
│   ├── Exceptions/                   # Exception handling classes
│   │   └── Handler.php               # Global exception handler for uncaught exceptions
│   │
│   ├── Http/                         # HTTP layer: controllers, middleware, requests
│   │   ├── Controllers/              # Controllers that handle API requests
│   │   │   ├── AuthController.php        # Handles user registration, login, and authentication
│   │   │   ├── BankController.php        # Manages bank account operations (onboarding, updates)
│   │   │   ├── DebitCardController.php   # Manages debit card verification and updates
│   │   │   ├── PrepaidCardController.php # Manages prepaid card operations (onboarding, checks)
│   │   │   ├── TransactionController.php # Handles transactions (send/receive money)
│   │   │   └── BalanceController.php     # Retrieves balance and mini-statement information
│   │   │
│   │   ├── Middleware/                # Middleware for request interception (e.g., authentication)
│   │   │   └── Authenticate.php      # Ensures user is authenticated via JWT
│   │   │
│   │   ├── Requests/                  # Form request validation classes
│   │   │   └── RegisterRequest.php   # Validates user registration form data
│   │   │
│   │   └── Kernel.php                 # Registers global HTTP middleware and route middleware
│   │
│   ├── Models/                       # Eloquent models representing entities in the database
│   │   ├── User.php                  # Represents users in the database, including linked mobile number
│   │   ├── BankAccount.php           # Represents bank accounts associated with users
│   │   ├── DebitCard.php             # Represents debit card details for bank accounts
│   │   ├── PrepaidCard.php           # Represents prepaid card details
│   │   ├── Transaction.php           # Represents financial transactions (send/receive)
│   │   └── Balance.php               # Represents account balance and mini-statements
│   │
│   ├── Services/                     # Business logic services (optional)
│   │   ├── BankAccountService.php    # Business logic for linking and managing bank accounts
│   │   ├── DebitCardService.php      # Logic for handling debit card actions (e.g., validation)
│   │   ├── PrepaidCardService.php    # Logic for onboarding and managing prepaid cards
│   │   ├── TransactionService.php    # Core logic for transaction processing
│   │   └── BalanceService.php        # Logic for balance inquiries and generating mini-statements
│
├── bootstrap/                        # Application bootstrapping (starts the framework)
│   ├── app.php                       # Bootstrap file that configures the application environment
│   └── cache/                         # Compiled files and cache for the application
│       └── services.php              # Cached services and configurations
│
├── config/                           # Configuration files
│   ├── app.php                       # Basic application configuration (e.g., name, timezone)
│   ├── auth.php                      # Authentication configuration (e.g., JWT settings)
│   ├── database.php                  # Database connection configuration (e.g., MySQL, PostgreSQL)
│   ├── services.php                  # External services configuration (e.g., payment gateways)
│   └── payment-gateway.php           # Configuration for integrating third-party payment gateways
│
├── database/                         # Database-related files: migrations, seeders, factories
│   ├── migrations/                   # Migrations for creating and updating tables
│   │   ├── 2025_01_01_create_users_table.php  # Migration for creating the users table
│   │   ├── 2025_01_01_create_bank_accounts_table.php # Migration for creating bank_accounts table
│   │   ├── 2025_01_01_create_debit_cards_table.php   # Migration for creating debit_cards table
│   │   ├── 2025_01_01_create_prepaid_cards_table.php # Migration for creating prepaid_cards table
│   │   ├── 2025_01_01_create_transactions_table.php   # Migration for creating transactions table
│   │   └── 2025_01_01_create_balances_table.php      # Migration for creating balances table
│   │
│   ├── seeders/                      # Seeder classes for populating test data
│   │   ├── UserSeeder.php            # Seeder for creating test users
│   │   ├── BankAccountSeeder.php     # Seeder for creating test bank accounts
│   │   └── TransactionSeeder.php     # Seeder for populating test transaction records
│   │
│   └── factories/                    # Factories for model testing and database seeding
│       └── UserFactory.php           # Factory for generating test user data
│
├── public/                           # Public-facing files (front-end assets, entry points)
│   ├── index.php                     # Main entry point for the Laravel application
│   ├── .htaccess                     # Apache-specific configuration for URL rewriting
│   └── build/                        # Compiled React assets (if React is bundled with Laravel)
│
├── routes/                           # API and web routes
│   └── api.php                       # All the API routes for FalsoPay (e.g., user registration, transactions)
│
├── storage/                          # File storage, cache, and logs
│   ├── app/                          # Application files (uploads, etc.)
│   ├── framework/                    # Framework-related files (sessions, cache)
│   └── logs/                         # Application log files
│
├── tests/                            # Unit and feature tests for FalsoPay
│   ├── Feature/                      # Feature tests that cover full HTTP request/response cycles
│   │   ├── AuthTest.php              # Tests for user registration and login
│   │   ├── BankAccountTest.php       # Tests for bank account-related API endpoints
│   │   ├── DebitCardTest.php         # Tests for debit card-related API endpoints
│   │   ├── PrepaidCardTest.php       # Tests for prepaid card-related API endpoints
│   │   ├── TransactionTest.php       # Tests for transaction-related API endpoints
│   │   └── BalanceTest.php           # Tests for balance inquiry and mini-statement API
│   │
│   └── Unit/                         # Unit tests for isolated services and logic
│       ├── BankAccountServiceTest.php  # Tests for the BankAccountService business logic
│       ├── DebitCardServiceTest.php    # Tests for the DebitCardService business logic
│       ├── PrepaidCardServiceTest.php  # Tests for PrepaidCardService business logic
│       ├── TransactionServiceTest.php  # Tests for TransactionService business logic
│       └── BalanceServiceTest.php      # Tests for BalanceService business logic
│
├── .env                              # Environment file for sensitive configurations (e.g., database, JWT secret)
├── .gitignore                        # Git ignore rules (excludes vendor, .env, node_modules, etc.)
├── composer.json                     # Composer dependencies and project settings
├── composer.lock                     # Composer lock file to ensure consistent package versions
├── package.json                      # Node.js dependencies (for React frontend integration)
├── package-lock.json                 # Node.js package lock file
├── artisan                           # The main Laravel Artisan CLI entry point
├── vite.config.js                    # Vite configuration for React frontend (if bundled together)
└── phpunit.xml                       # PHPUnit configuration for running tests


```


# Explanation of Directories and Files

## `app/`
Contains the core application logic of your Laravel backend.

### **`Console/`**
This directory contains custom Artisan commands used to interact with Laravel's CLI.

- **`CustomServe.php`**: A custom Artisan command, for example, to run a development server with specific options or configurations.

### **`Exceptions/`**
Handles the exceptions thrown throughout the application.

- **`Handler.php`**: The main exception handler that manages uncaught exceptions. It determines how errors are rendered and can send responses back to the user.

### **`Http/`**
Contains the HTTP layer of the application, including controllers, middleware, and requests.

- **`Controllers/`**: API controllers responsible for processing HTTP requests and returning appropriate responses.
  - `AuthController.php`: Handles user registration, login, and authentication.
  - `BankController.php`: Manages onboarding and handling of users' bank accounts.
  - `DebitCardController.php`: Handles verification and management of debit cards linked to bank accounts.
  - `PrepaidCardController.php`: Manages onboarding and handling of prepaid cards.
  - `TransactionController.php`: Manages the sending and receiving of money transactions.
  - `BalanceController.php`: Handles balance inquiries and fetching mini-statements.

- **`Middleware/`**: Contains middleware classes that intercept and modify requests before reaching the controller.
  - `Authenticate.php`: Ensures that the user is authenticated, typically using JWT tokens or other authentication mechanisms.

- **`Requests/`**: Custom request classes used for validation.
  - `RegisterRequest.php`: Validates the user registration form data.

- **`Kernel.php`**: This file registers all global middleware and route-specific middleware for the application.

### **`Models/`**
Eloquent models representing the application's data entities and handling database interactions.

- `User.php`: Represents user data, including personal information and linked mobile numbers.
- `BankAccount.php`: Represents a user's linked bank accounts.
- `DebitCard.php`: Represents debit card details and the linkage to bank accounts.
- `PrepaidCard.php`: Represents prepaid cards that users can onboard to their accounts.
- `Transaction.php`: Stores records of financial transactions such as sending or receiving money.
- `Balance.php`: Represents account balances and stores mini-statement information.

### **`Services/`**
Contains business logic that encapsulates complex operations, keeping controllers slim and maintainable.

- `BankAccountService.php`: Logic for linking and managing bank accounts.
- `DebitCardService.php`: Logic for managing debit cards, including verification and processing.
- `PrepaidCardService.php`: Logic for onboarding and managing prepaid cards.
- `TransactionService.php`: Core business logic for handling transactions, including validation and transaction creation.
- `BalanceService.php`: Handles balance inquiries and generating mini-statements.

---

## `config/`
Contains configuration files for various services used by the application.

- **`app.php`**: Contains general application settings such as timezone, locale, and environment variables.
- **`auth.php`**: Authentication settings, including JWT or Sanctum configurations.
- **`database.php`**: Database connection settings such as connection type, host, username, and password.
- **`services.php`**: Configuration for external services like payment gateways or bank APIs.
- **`payment-gateway.php`**: Configuration specific to third-party payment gateway integrations (if applicable).

---

## `database/`
Contains files related to the database structure, including migrations, seeders, and factories.

### **`migrations/`**
Migration files that define the schema for the application's database tables.

- `YYYY_MM_DD_create_users_table.php`: Migration that defines the schema for the users table.
- `YYYY_MM_DD_create_bank_accounts_table.php`: Migration that defines the schema for bank accounts.
- `YYYY_MM_DD_create_debit_cards_table.php`: Migration that defines the schema for debit cards.
- `YYYY_MM_DD_create_prepaid_cards_table.php`: Migration for creating the prepaid cards table.
- `YYYY_MM_DD_create_transactions_table.php`: Migration for creating the transactions table.
- `YYYY_MM_DD_create_balances_table.php`: Migration for creating the balances table.

### **`seeders/`**
Seeder files are used to populate the database with test data.

- `UserSeeder.php`: Seeds the database with test user data.
- `BankAccountSeeder.php`: Seeds the database with test bank account data.

### **`factories/`**
Factories are used to generate test data for models.

- `UserFactory.php`: A factory to create test user data.
- `BankAccountFactory.php`: A factory for generating test bank account records.

---

## `public/`
Contains publicly accessible files such as images, JavaScript, and CSS, and the main entry point to the application.

- **`index.php`**: The main entry point for all web requests in Laravel, and is used to route requests through the framework.
- **`.htaccess`**: Apache server configuration file used for URL rewriting.
- **`build/`**: If you are bundling a frontend (e.g., React with Vite), this directory contains the compiled assets.

---

## `routes/`
Contains the route definitions for your application.

- **`api.php`**: All the API routes for FalsoPay. Each route maps to a controller method that handles specific business logic.

---

## `storage/`
Contains files for logs, caches, and other temporary files used by the application.

- **`logs/`**: Stores application logs for debugging and auditing purposes.
- **`framework/`**: Stores compiled files, cache, and session files generated by Laravel.

---

## `tests/`
Contains unit and feature tests to ensure that the application behaves as expected.

### **`Feature/`**
Tests for full HTTP request/response cycles.

- `AuthTest.php`: Tests for user registration, login, and authentication.
- `BankAccountTest.php`: Tests for bank account-related API endpoints.
- `DebitCardTest.php`: Tests for debit card-related API endpoints.
- `PrepaidCardTest.php`: Tests for prepaid card-related API endpoints.
- `TransactionTest.php`: Tests for transaction-related API endpoints.
- `BalanceTest.php`: Tests for balance and mini-statement-related API endpoints.

### **`Unit/`**
Tests for isolated methods and business logic within services.

- `BankAccountServiceTest.php`: Unit tests for the BankAccountService.
- `DebitCardServiceTest.php`: Unit tests for the DebitCardService.
- `PrepaidCardServiceTest.php`: Unit tests for the PrepaidCardService.
- `TransactionServiceTest.php`: Unit tests for the TransactionService.
- `BalanceServiceTest.php`: Unit tests for the BalanceService.

---

## `.env`
Contains environment-specific configurations such as database credentials, API keys, and other sensitive information.

---

## `.gitignore`
Defines which files and directories Git should ignore. Typically, files like `vendor/`, `.env`, and `node_modules/` are ignored to avoid committing sensitive or unnecessary files.

---

## `composer.json` and `composer.lock`
- **`composer.json`**: Lists the dependencies for the PHP project, including Laravel and other third-party libraries.
- **`composer.lock`**: A lock file that ensures the exact versions of packages used in the project are consistent across different environments.

---

## `artisan`
Laravel's command-line interface (CLI) tool. It provides several helpful commands for tasks like running migrations, serving the application, and more. For example, `php artisan migrate` to apply migrations or `php artisan serve` to start the local development server.

---
