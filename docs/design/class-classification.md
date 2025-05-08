# Class Classification in FalsoPay System

## Introduction to Class Structuring Criteria

In software engineering, classes can be categorized based on their roles and responsibilities within the application. This classification helps in understanding the system structure and ensuring proper separation of concerns. The main categories are:

1. **Entity Classes**: Represent business objects and data that the system manages
2. **Boundary Classes**: Handle interaction between the system and external actors
3. **Control Classes**: Coordinate and control the flow of activities
4. **Application Logic Classes**: Implement business rules and application-specific logic

## Classification of FalsoPay Classes

### Entity Classes

Entity classes represent persistent business objects that typically correspond to database tables. They contain data and basic operations on that data.

1. **User**: Represents a registered user in the system
2. **BankUser**: Represents a bank customer
3. **Bank**: Represents a financial institution
4. **BankAccount**: Represents a bank account linked to a user
5. **Card**: Represents a payment card
6. **InstantPaymentAddress**: Represents a payment address for quick transfers
7. **Transaction**: Represents a money transfer between accounts
8. **MoneyRequest**: Represents a request for payment
9. **Favorite**: Represents a saved recipient
10. **SupportTicket**: Represents a customer inquiry
11. **SupportReply**: Represents a response to a support ticket
12. **SystemSettings**: Represents system configuration parameters

### Boundary Classes

Boundary classes handle the interaction between the system and external actors (users, other systems). They can be further categorized into UI classes and system interfaces.

#### UI Boundary Classes
1. **MobileApp**: Mobile application interface
2. **WebApp**: Web application interface
3. **AdminDashboard**: Administrative interface
4. **LoginScreen**: User authentication interface
5. **RegistrationScreen**: User registration interface
6. **TransactionScreen**: Interface for performing transactions
7. **AccountManagementScreen**: Interface for managing accounts
8. **SupportScreen**: Interface for customer support

#### System Interface Boundary Classes
1. **APIGateway**: Entry point for API requests
2. **RESTController**: Handles REST API requests
3. **BankAPI**: Interface to external banking systems
4. **NotificationSender**: Interface for sending notifications
5. **EmailNotification**: Handles email communications
6. **SMSNotification**: Handles SMS communications
7. **PushNotification**: Handles push notifications

### Control Classes

Control classes coordinate activities and control the flow of operations. They implement use cases and orchestrate interactions between entities.

1. **UserService**: Controls user-related operations
2. **AuthService**: Controls authentication and authorization
3. **JWTAuthService**: Implements JWT-based authentication
4. **BankService**: Controls bank-related operations
5. **BankAccountService**: Controls bank account operations
6. **TransactionService**: Controls transaction processing
7. **PaymentProcessingController**: Controls payment flows
8. **MoneyRequestController**: Controls money request operations
9. **SupportTicketController**: Controls support ticket handling
10. **NotificationController**: Controls notification dispatch
11. **SystemSettingsController**: Controls system settings

### Application Logic Classes

Application logic classes implement business rules and application-specific logic. They can be further categorized into service, utility, and factory classes.

#### Service Classes
1. **TransactionValidationService**: Validates transactions
2. **SecurityService**: Implements security measures
3. **BalanceCalculationService**: Calculates account balances
4. **FeeCalculationService**: Calculates transaction fees
5. **ReportingService**: Generates reports
6. **AnalyticsService**: Analyzes system data

#### Utility Classes
1. **Money**: Value object representing monetary amounts
2. **Logger**: Handles system logging
3. **DateTimeUtil**: Utilities for date and time operations
4. **ValidationUtil**: Utilities for data validation
5. **EncryptionUtil**: Utilities for encryption/decryption
6. **FormatUtil**: Utilities for data formatting

#### Factory Classes
1. **TransactionFactory**: Creates transaction objects
2. **NotificationFactory**: Creates notification objects
3. **UserFactory**: Creates user objects

### Repository Classes

Repository classes handle data access and persistence. They bridge between the domain model and data storage.

1. **UserRepository**: Manages user data persistence
2. **BankRepository**: Manages bank data persistence
3. **BankAccountRepository**: Manages bank account data persistence
4. **TransactionRepository**: Manages transaction data persistence
5. **SupportTicketRepository**: Manages support ticket data persistence
6. **SystemSettingsRepository**: Manages system settings persistence

## Enumeration Classes

Enumeration classes define fixed sets of values.

1. **UserRole**: Defines user roles (USER, ADMIN, AGENT)
2. **UserStatus**: Defines user statuses (ACTIVE, INACTIVE, SUSPENDED)
3. **AccountStatus**: Defines account statuses (ACTIVE, INACTIVE, SUSPENDED, CLOSED)
4. **AccountType**: Defines account types (CHECKING, SAVINGS, CREDIT, LOAN)
5. **PaymentMethod**: Defines payment methods (IPA, ACCOUNT, CARD, PHONE, IBAN)
6. **TicketStatus**: Defines ticket statuses (OPEN, IN_PROGRESS, RESOLVED, CLOSED)

## Summary

This classification helps in understanding the structure and responsibilities of classes in the FalsoPay system. It ensures proper separation of concerns and provides a clear organization of the system's components. The classification follows standard object-oriented design principles and patterns, making the system more maintainable and extensible.
