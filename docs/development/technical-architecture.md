# FalsoPay Technical Architecture

## System Overview

FalsoPay is a digital payment platform that enables users to send and receive money through various transfer methods. The system consists of a PHP backend API and a React frontend application, connected through RESTful API endpoints.

## Architecture Diagram

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

## Technology Stack

### Backend
- **Language**: PHP 8.0+
- **Database**: MySQL/MariaDB
- **Architecture**: Modified MVC pattern
- **Authentication**: Token-based (JWT)
- **API**: RESTful endpoints

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router

### Infrastructure
- **Web Server**: Nginx
- **Deployment**: Docker containers
- **Version Control**: Git
- **CI/CD**: GitHub Actions

## System Components

### Backend Services

#### Authentication Service
Handles user registration, login, and session management.

**Key Features:**
- User registration and verification
- Login with phone number and IPA
- Token generation and validation
- Password reset functionality
- Role-based access control

#### Transaction Service
Manages money transfers between users.

**Key Features:**
- Transaction creation and execution
- Balance verification
- Transaction history tracking
- Transfer method handling
- Transaction notifications

#### Account Service
Manages user accounts and bank connections.

**Key Features:**
- Bank account linking
- Balance management
- Account verification
- IPA (Instant Payment Address) management
- User profile management

#### Notification Service
Handles all system notifications.

**Key Features:**
- Email notifications
- WhatsApp messages
- In-app notifications
- Real-time updates via WebSockets

### Frontend Components

#### Authentication Module
Handles user authentication flows.

**Key Features:**
- Login screen
- Registration flow
- Password reset
- Session management

#### Dashboard Module
Main user interface after login.

**Key Features:**
- Account overview
- Recent transactions
- Quick actions
- Notifications

#### Transaction Module
Interface for sending and receiving money.

**Key Features:**
- Send money form
- Transfer method selection
- Transaction confirmation
- Receipt generation

#### Account Management Module
Interface for managing user profile and accounts.

**Key Features:**
- Profile settings
- Bank account management
- Security settings
- Notification preferences

## Data Flow

### User Registration Flow
1. User enters registration details in frontend
2. Frontend validates input and sends to backend
3. Backend validates data and checks for existing accounts
4. If valid, user record is created in database
5. Verification code is sent via email/SMS
6. User enters verification code
7. Account is activated upon successful verification

### Authentication Flow
1. User enters phone number and IPA address
2. Backend validates credentials
3. If valid, authentication token is generated
4. Token is returned to frontend
5. Frontend stores token for subsequent requests
6. Token is included in Authorization header for API calls

### Transaction Flow
1. User initiates money transfer in frontend
2. User selects recipient and transfer method
3. Frontend sends transaction request to backend
4. Backend validates sender's balance and recipient details
5. If valid, transaction is recorded in database
6. Sender's balance is debited
7. Recipient's balance is credited
8. Notification is sent to both parties
9. Transaction confirmation is displayed to user

### Bank Account Linking Flow
1. User enters bank card details
2. Backend validates card information with bank
3. Micro-deposits are initiated to verify account ownership
4. User confirms deposit amounts
5. Bank account is linked to user's profile
6. Account can now be used for transactions

## Database Schema

### Core Tables

#### users
Stores user account information.
- `user_id` (PK)
- `first_name`, `last_name`
- `email`, `phone_number`
- `default_account`
- `role`, `status`

#### transactions
Records all money transfers.
- `transaction_id` (PK)
- `sender_user_id`, `receiver_user_id` (FK to users)
- `amount`
- `transfer_method`
- `transaction_time`
- `status`

#### bank_accounts
Stores linked bank accounts.
- `bank_id`, `account_number` (Composite PK)
- `bank_user_id`
- `iban`
- `status`, `type`
- `balance`

#### instant_payment_addresses
Manages IPA addresses for quick payments.
- `ipa_id` (PK)
- `user_id` (FK to users)
- `ipa_address`
- `bank_id`, `account_number` (FK to bank_accounts)
- `pin_hash`

## API Endpoints

The system exposes RESTful API endpoints for frontend-backend communication:

### Authentication
- `POST /api/register`: Register a new user
- `POST /api/login`: Authenticate a user
- `POST /api/verify`: Verify email/phone
- `POST /api/password-reset`: Request password reset

### Transactions
- `POST /api/transactions/prepare`: Prepare a transaction
- `POST /api/transactions/method`: Set transfer method
- `POST /api/transactions/execute`: Execute a transaction
- `GET /api/transactions`: Get all transactions
- `GET /api/transactions/user/{id}`: Get user transactions

### Bank Accounts
- `POST /api/banking/link`: Link a bank account
- `POST /api/banking/verify`: Verify a bank account
- `GET /api/accounts/balance`: Get account balance

## Security Measures

### Authentication Security
- Secure password hashing with bcrypt
- JWT tokens with expiration
- HTTPS for all communications
- Rate limiting for login attempts
- Two-factor authentication for sensitive operations

### Transaction Security
- PIN verification for transactions
- Transfer limits
- Fraud detection algorithms
- Transaction monitoring
- Real-time notifications

### Data Security
- Encrypted sensitive data in database
- Input validation and sanitization
- Protection against SQL injection
- CSRF protection
- XSS prevention

## Scalability Considerations

### Horizontal Scaling
- Stateless API design allows multiple backend instances
- Database read replicas for scaling read operations
- Load balancing across multiple servers

### Performance Optimization
- Database query optimization
- Caching frequently accessed data
- Asynchronous processing for notifications
- Optimized frontend bundle size

### High Availability
- Redundant database servers
- Failover mechanisms
- Regular backups
- Monitoring and alerting

## Development Workflow

### Version Control
- Git for source code management
- Feature branch workflow
- Pull request reviews
- Semantic versioning

### Continuous Integration/Deployment
- Automated testing on commit
- Build pipeline for frontend and backend
- Automated deployment to staging
- Manual promotion to production

### Testing Strategy
- Unit tests for core business logic
- Integration tests for API endpoints
- End-to-end tests for critical user flows
- Performance testing for high-load scenarios

## Monitoring and Logging

### Application Monitoring
- Error tracking and reporting
- Performance metrics collection
- User activity monitoring
- Transaction monitoring

### Infrastructure Monitoring
- Server health monitoring
- Database performance tracking
- Network traffic analysis
- Resource utilization metrics

### Logging
- Structured logging format
- Centralized log collection
- Log retention policies
- Audit logs for sensitive operations

## Deployment Architecture

### Development Environment
- Local development setup with Docker
- Development database with sample data
- Mock external services

### Staging Environment
- Cloud-based deployment
- Replica of production configuration
- Integration with test versions of external services

### Production Environment
- Load-balanced web servers
- Database cluster with replication
- CDN for static assets
- Automated backups

## Future Enhancements

### Planned Features
- Mobile application (iOS/Android)
- International payments
- Recurring payments
- Bill splitting functionality
- Merchant payment processing

### Technical Improvements
- Microservices architecture
- Event-driven design for better scalability
- GraphQL API for optimized data fetching
- Machine learning for fraud detection
- Blockchain integration for selected transactions 