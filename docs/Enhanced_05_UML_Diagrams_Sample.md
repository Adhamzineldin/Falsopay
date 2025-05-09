<div class="section-divider">

# UML Diagrams

*Visual representations of the FalsoPay system architecture, components, and behaviors*

</div>

## 5.1 Class Diagrams

Class diagrams provide a structural view of the FalsoPay system, illustrating the classes, interfaces, and their relationships. These diagrams help developers understand the system's organization and architectural patterns.

### 5.1.1 Core Domain Model

The following class diagram illustrates the core domain entities in the FalsoPay system and their relationships:

![FalsoPay Core Domain Model](assets/diagrams/core-domain-model.png)

<div class="info-box">

The core domain model focuses on the essential business entities and their relationships, serving as the foundation for the system's architecture. This model follows Domain-Driven Design principles to align the software model with business concepts.

</div>

#### Key Components

| Entity | Responsibility | Relationships |
|--------|---------------|--------------|
| **User** | Represents system users with authentication credentials | Has one-to-many BankAccounts, Transactions, MoneyRequests |
| **BankAccount** | Manages bank account information and operations | Belongs to a User, associated with one Bank |
| **Transaction** | Records money movements between accounts | References sender and receiver Users and their accounts |
| **MoneyRequest** | Tracks requests for payments between users | Associated with requester and requested Users |
| **InstantPaymentAddress** | Facilitates quick transfers via aliases | Belongs to a User, used in Transactions |

### 5.1.2 Authentication Subsystem

The following class diagram details the authentication and authorization components:

![Authentication Subsystem](assets/diagrams/auth-subsystem.png)

<div class="technical-note">

The authentication subsystem implements industry-standard protocols (OAuth 2.0, JWT) while adding FalsoPay-specific security measures like real-time fraud detection and biometric verification options.

</div>

## 5.2 Sequence Diagrams

Sequence diagrams illustrate the interactions between objects over time, showing the message flow for key system operations.

### 5.2.1 User Authentication Flow

![User Authentication Sequence](assets/diagrams/auth-sequence.png)

The authentication sequence includes:
1. User initiates login with credentials
2. System validates credentials
3. Multi-factor authentication challenge (if enabled)
4. JWT token generation and delivery
5. Secure session establishment

### 5.2.2 Money Transfer Process

![Money Transfer Sequence](assets/diagrams/money-transfer-sequence.png)

<div class="best-practice">

The money transfer process implements the Saga pattern to ensure transactional integrity across multiple services. This approach guarantees that funds are never lost, even in the event of partial system failures.

</div>

## 5.3 Activity Diagrams

Activity diagrams model workflows and business processes within the FalsoPay system.

### 5.3.1 User Registration Process

![User Registration Activity](assets/diagrams/user-registration-activity.png)

The registration workflow includes:
- Initial sign-up with basic information
- Email/phone verification
- Identity verification (KYC compliance)
- Security settings configuration
- Bank account linking (optional)

### 5.3.2 Transaction Approval Workflow

![Transaction Approval Activity](assets/diagrams/transaction-approval-activity.png)

## 5.4 Object Diagrams

Object diagrams provide snapshots of the system state at specific points in time, illustrating concrete instances of classes and their relationships.

### 5.4.1 Money Transfer Object States

The following diagrams show the system state before and after a money transfer operation:

#### Pre-Transfer State

![Pre-Transfer Object State](assets/diagrams/pre-transfer-objects.png)

#### Post-Transfer State

![Post-Transfer Object State](assets/diagrams/post-transfer-objects.png)

<div class="warning-box">

These object diagrams should be carefully examined when implementing transaction-related features to ensure proper state transitions and data consistency.

</div>

## 5.5 Component Diagrams

Component diagrams show the organization and dependencies among software components.

### 5.5.1 FalsoPay System Components

![System Components](assets/diagrams/system-components.png)

The FalsoPay system is composed of the following major components:
- Frontend client applications (Web, Mobile)
- API Gateway and security infrastructure
- Core service modules (User Management, Transactions, etc.)
- Integration adaptors for external systems
- Data storage and persistence layer

### 5.5.2 Deployment Architecture

![Deployment Architecture](assets/diagrams/deployment-architecture.png)

<div class="technical-note">

The deployment architecture implements a microservices approach with containerization (Docker) and orchestration (Kubernetes) to provide scalability, resilience, and ease of deployment.

</div>

## 5.6 State Machine Diagrams

State machine diagrams model the different states of objects and the transitions between them.

### 5.6.1 Transaction States

![Transaction State Machine](assets/diagrams/transaction-states.png)

Transactions in FalsoPay progress through the following states:
1. **Initiated**: Transaction created but not yet processed
2. **Validating**: System checks for sufficient funds and security rules
3. **Processing**: Funds are being transferred
4. **Completed**: Transaction successfully finalized
5. **Failed**: Transaction could not be completed
6. **Reversed**: Transaction has been reversed due to error or dispute

### 5.6.2 User Account States

![User Account State Machine](assets/diagrams/user-account-states.png)

## 5.7 Use Case Diagrams

Use case diagrams illustrate the interactions between users (actors) and the system to achieve specific goals.

### 5.7.1 Core System Use Cases

![Core System Use Cases](assets/diagrams/core-use-cases.png)

### 5.7.2 Administrative Functions

![Administrative Use Cases](assets/diagrams/admin-use-cases.png)

<div class="best-practice">

When implementing features, refer to these use case diagrams and the corresponding detailed use case descriptions to ensure that all requirements and interactions are properly addressed.

</div> 