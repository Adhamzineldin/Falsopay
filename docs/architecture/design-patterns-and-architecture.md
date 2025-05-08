# FalsoPay Design Patterns and Architectural Decisions

## System Architecture Overview

FalsoPay implements a modified Model-View-Controller (MVC) architecture with additional service layers to separate concerns and promote maintainability. The system is designed as a web application with a PHP backend and React frontend.

### High-Level Architecture Diagram

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  Web Frontend   │◄────►│   API Gateway   │◄────►│  Auth Service   │
│  (React/TS)     │      │                 │      │                 │
│                 │      │                 │      └─────────────────┘
└─────────────────┘      │                 │      ┌─────────────────┐
                         │                 │      │                 │
┌─────────────────┐      │                 │      │ Transaction     │
│                 │      │                 │◄────►│ Service         │
│  Mobile App     │◄────►│                 │      │                 │
│  (Future)       │      │                 │      └─────────────────┘
│                 │      │                 │      ┌─────────────────┐
└─────────────────┘      │                 │      │                 │
                         │                 │◄────►│ Account Service │
                         │                 │      │                 │
                         └─────────────────┘      └─────────────────┘
                                 ▲                ┌─────────────────┐
                                 │                │                 │
                                 │                │ Notification    │
                                 └───────────────►│ Service         │
                                                  │                 │
                                                  └─────────────────┘
                                                          ▲
                                                          │
                                                  ┌───────┴───────┐
                                                  │               │
                                                  │  Database     │
                                                  │  (MySQL)      │
                                                  │               │
                                                  └───────────────┘
```

## Architectural Patterns

### 1. Model-View-Controller (MVC)

The FalsoPay system implements a modified MVC pattern to separate concerns and improve maintainability.

**Implementation:**
- **Models**: Represent data entities and handle database operations (e.g., User, Transaction, BankAccount)
- **Views**: Implemented as React components in the frontend
- **Controllers**: Handle HTTP requests and coordinate application logic (e.g., AuthController, TransactionController)

**Rationale:**
- Separates data, presentation, and control logic
- Promotes code organization and maintainability
- Facilitates parallel development of frontend and backend
- Supports easier testing through component isolation

**Example:**
```php
// Model
class User {
    public function getUserById($userId) {
        // Database operations to retrieve user
    }
}

// Controller
class AuthController {
    public function login(array $data) {
        // Handle login request using phone number and PIN
        // Verify PIN against stored hash
        // Generate authentication token
        // Return response
    }
}
```

### 2. Service Layer

A service layer is implemented between controllers and models to encapsulate business logic and promote reusability.

**Implementation:**
- Services handle complex business operations
- Controllers use services to perform operations
- Services interact with multiple models when needed

**Rationale:**
- Reduces controller complexity
- Promotes code reuse across controllers
- Encapsulates business rules in a single location
- Facilitates unit testing of business logic

**Example:**
```php
// Service
class TransactionService {
    public function processTransaction($senderId, $receiverId, $amount) {
        // Complex business logic for transaction processing
        // Interact with Transaction model, User model, etc.
    }
}

// Controller using service
class TransactionController {
    private $transactionService;
    
    public function __construct(TransactionService $transactionService) {
        $this->transactionService = $transactionService;
    }
    
    public function sendMoney(array $data) {
        // Use service to process transaction
        $result = $this->transactionService->processTransaction(
            $data['sender_id'],
            $data['receiver_id'],
            $data['amount']
        );
        // Return response
    }
}
```

### 3. Repository Pattern

The Repository pattern is used to abstract data access logic from the business logic.

**Implementation:**
- Repository interfaces define data access methods
- Concrete repository classes implement these interfaces
- Models use repositories for database operations

**Rationale:**
- Decouples business logic from data access details
- Simplifies unit testing through mocking
- Provides a consistent interface for data access
- Facilitates switching between different data sources

**Example:**
```php
// Repository interface
interface UserRepositoryInterface {
    public function findById($id);
    public function findByEmail($email);
    public function save(User $user);
}

// Concrete repository
class UserRepository implements UserRepositoryInterface {
    public function findById($id) {
        // Implementation
    }
    
    public function findByEmail($email) {
        // Implementation
    }
    
    public function save(User $user) {
        // Implementation
    }
}
```

### 4. RESTful API

The system exposes RESTful APIs for frontend-backend communication.

**Implementation:**
- Resources are represented as URLs
- HTTP methods define operations (GET, POST, PUT, DELETE)
- JSON format for data exchange
- Stateless communication

**Rationale:**
- Standardized approach to API design
- Scalability through stateless communication
- Cacheability of responses
- Compatibility with various clients

**Example:**
```
GET /api/users/123         // Get user with ID 123
POST /api/transactions     // Create a new transaction
PUT /api/accounts/456      // Update account with ID 456
DELETE /api/cards/789      // Delete card with ID 789
```

## Design Patterns

### 1. Singleton Pattern

The Singleton pattern is used for database connections to ensure a single instance is shared across the application.

**Implementation:**
```php
class Database {
    private static $instance = null;
    private $connection;
    
    private function __construct() {
        // Initialize database connection
        $this->connection = new PDO(/* connection details */);
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->connection;
    }
}
```

**Problem Solved:**
- Prevents multiple database connections
- Ensures consistent state of the connection
- Provides global access point to the database connection

**Impact on Design:**
- Reduces resource usage by sharing a single connection
- Simplifies connection management
- Introduces global state which needs careful handling

### 2. Factory Pattern

The Factory pattern is used for creating model instances with proper dependencies.

**Implementation:**
```php
class ModelFactory {
    public static function createUser() {
        return new User(Database::getInstance()->getConnection());
    }
    
    public static function createTransaction() {
        return new Transaction(Database::getInstance()->getConnection());
    }
    
    public static function createBankAccount() {
        return new BankAccount(Database::getInstance()->getConnection());
    }
}
```

**Problem Solved:**
- Centralizes object creation logic
- Hides complex instantiation details
- Ensures consistent object creation

**Impact on Design:**
- Reduces duplication of instantiation code
- Simplifies changes to object creation process
- Improves code maintainability

### 3. Strategy Pattern

The Strategy pattern is used for implementing different payment methods.

**Implementation:**
```php
// Strategy interface
interface TransferMethodStrategy {
    public function transfer($senderId, $receiverId, $amount);
}

// Concrete strategies
class IPATransferStrategy implements TransferMethodStrategy {
    public function transfer($senderId, $receiverId, $amount) {
        // Implementation for IPA transfer
    }
}

class BankTransferStrategy implements TransferMethodStrategy {
    public function transfer($senderId, $receiverId, $amount) {
        // Implementation for bank transfer
    }
}

// Context
class TransactionProcessor {
    private $transferStrategy;
    
    public function setTransferStrategy(TransferMethodStrategy $strategy) {
        $this->transferStrategy = $strategy;
    }
    
    public function processTransaction($senderId, $receiverId, $amount) {
        return $this->transferStrategy->transfer($senderId, $receiverId, $amount);
    }
}
```

**Problem Solved:**
- Enables runtime selection of different transfer methods
- Encapsulates transfer method implementations
- Allows adding new transfer methods without modifying existing code

**Impact on Design:**
- Increases flexibility in handling different transfer methods
- Improves code maintainability and extensibility
- Adheres to the Open/Closed Principle

### 4. Observer Pattern

The Observer pattern is used for the notification system.

**Implementation:**
```php
// Subject interface
interface NotificationSubject {
    public function attach(NotificationObserver $observer);
    public function detach(NotificationObserver $observer);
    public function notify($event, $data);
}

// Observer interface
interface NotificationObserver {
    public function update($event, $data);
}

// Concrete subject
class TransactionNotifier implements NotificationSubject {
    private $observers = [];
    
    public function attach(NotificationObserver $observer) {
        $this->observers[] = $observer;
    }
    
    public function detach(NotificationObserver $observer) {
        // Remove observer from array
    }
    
    public function notify($event, $data) {
        foreach ($this->observers as $observer) {
            $observer->update($event, $data);
        }
    }
}

// Concrete observers
class EmailNotifier implements NotificationObserver {
    public function update($event, $data) {
        // Send email notification
    }
}

class WhatsAppNotifier implements NotificationObserver {
    public function update($event, $data) {
        // Send WhatsApp notification
    }
}
```

**Problem Solved:**
- Decouples notification generation from notification delivery
- Allows adding new notification channels without modifying transaction logic
- Supports sending notifications through multiple channels

**Impact on Design:**
- Improves extensibility of the notification system
- Reduces coupling between components
- Facilitates testing of notification logic

### 5. Decorator Pattern

The Decorator pattern is used for transaction logging and validation.

**Implementation:**
```php
// Component interface
interface TransactionComponent {
    public function execute($senderId, $receiverId, $amount);
}

// Concrete component
class BasicTransaction implements TransactionComponent {
    public function execute($senderId, $receiverId, $amount) {
        // Basic transaction execution
    }
}

// Base decorator
abstract class TransactionDecorator implements TransactionComponent {
    protected $transaction;
    
    public function __construct(TransactionComponent $transaction) {
        $this->transaction = $transaction;
    }
}

// Concrete decorators
class LoggingTransactionDecorator extends TransactionDecorator {
    public function execute($senderId, $receiverId, $amount) {
        // Log transaction details
        $result = $this->transaction->execute($senderId, $receiverId, $amount);
        // Log transaction result
        return $result;
    }
}

class ValidationTransactionDecorator extends TransactionDecorator {
    public function execute($senderId, $receiverId, $amount) {
        // Validate transaction
        if ($amount <= 0) {
            throw new Exception("Invalid amount");
        }
        // Execute transaction
        return $this->transaction->execute($senderId, $receiverId, $amount);
    }
}
```

**Problem Solved:**
- Adds cross-cutting concerns to transactions without modifying core logic
- Allows combining multiple behaviors (logging, validation, etc.)
- Supports dynamic addition of behaviors

**Impact on Design:**
- Enhances flexibility in adding transaction behaviors
- Improves separation of concerns
- Adheres to the Single Responsibility Principle

## Frontend Architecture

### Component-Based Architecture

The frontend uses React's component-based architecture for building the user interface.

**Implementation:**
- Reusable UI components
- Component hierarchy for complex interfaces
- Props for component configuration
- State management for dynamic behavior

**Rationale:**
- Promotes code reuse
- Simplifies maintenance
- Improves testability
- Enhances development efficiency

**Example:**
```tsx
// Reusable button component
const Button = ({ text, onClick, variant = 'primary' }) => {
  return (
    <button 
      className={`btn btn-${variant}`} 
      onClick={onClick}
    >
      {text}
    </button>
  );
};

// Usage
const SendMoneyButton = () => {
  const handleSend = () => {
    // Handle send money action
  };
  
  return <Button text="Send Money" onClick={handleSend} variant="success" />;
};
```

### Context API for State Management

React Context API is used for global state management.

**Implementation:**
- Context providers for different state domains
- Custom hooks for consuming context
- Reducers for complex state logic

**Rationale:**
- Avoids prop drilling
- Centralizes state management
- Simplifies component communication
- Reduces component complexity

**Example:**
```tsx
// Auth context
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  const login = async (credentials) => {
    // Login logic
  };
  
  const logout = () => {
    // Logout logic
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

## Database Design

### Normalized Schema

The database follows normalization principles to reduce redundancy and improve data integrity.

**Implementation:**
- Tables for core entities (users, transactions, bank_accounts, etc.)
- Foreign keys for relationships
- Indexes for frequently queried columns
- Appropriate data types for columns

**Rationale:**
- Minimizes data redundancy
- Ensures data consistency
- Improves query performance
- Facilitates data maintenance

## Security Architecture

### Defense in Depth

The system implements multiple layers of security to protect against various threats.

**Implementation:**
- Authentication and authorization
- Input validation and sanitization
- Data encryption
- CSRF protection
- Rate limiting
- Audit logging

**Rationale:**
- Provides protection against multiple attack vectors
- Reduces impact of security breaches
- Improves overall system security posture
- Meets regulatory requirements

## Conclusion

The architectural decisions and design patterns used in FalsoPay are chosen to create a maintainable, scalable, and secure payment system. The combination of MVC architecture, service layers, and well-established design patterns provides a solid foundation for the application while allowing for future growth and adaptation to changing requirements. 