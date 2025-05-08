# Falsopay Class Diagrams

This document describes the three versions of the class diagram for the Falsopay financial application, showing the progression from initial design to final implementation with design patterns.

## 1. Initial Class Diagram

The initial class diagram ([falsopay_class_diagram_initial.puml](falsopay_class_diagram_initial.puml)) provides a basic structure for the Falsopay application based on requirements and use cases. It includes:

- Basic entities like User, Bank, BankAccount, Card, etc.
- Simple attributes for each class
- Core operations needed for each entity
- Fundamental relationships between entities

This diagram serves as a starting point, focusing on identifying the main components of the system without implementation details.

Key elements:
- User management classes (User)
- Banking classes (Bank, BankUser, BankAccount)
- Payment method classes (InstantPaymentAddress, Card)
- Transaction classes (Transaction, MoneyRequest)
- Support system classes (SupportTicket, SupportReply)
- System management (SystemSettings)

## 2. Intermediate Class Diagram

The intermediate class diagram ([falsopay_class_diagram_intermediate.puml](falsopay_class_diagram_intermediate.puml)) expands on the initial design, adding:

- More detailed attributes for each class
- Comprehensive methods reflecting interactions
- Additional support classes for authentication and validation
- Data access and utility services
- Extended relationships between classes

This diagram reflects the interactions identified through sequence and communication diagrams, showing how objects collaborate to fulfill use cases.

Key additions:
- Auth class for authentication and security
- Transaction validation classes
- Notification services
- Database and logging services
- Detailed relationships and data flows

## 3. Final Class Diagram with Design Patterns

The final class diagram ([falsopay_class_diagram_final.puml](falsopay_class_diagram_final.puml)) represents a complete design, incorporating:

- Organized package structure
- Well-defined inheritance hierarchies
- Comprehensive design patterns
- Advanced relationship types
- Type safety through enumerations
- Clear separation of concerns

### Design Patterns Implemented

1. **Creational Patterns:**
   - **Singleton Pattern**: Used for SystemSettings, Database, and Logger classes to ensure a single instance
   - **Factory Method Pattern**: TransactionFactory creates different types of transactions
   
2. **Structural Patterns:**
   - **Facade Pattern**: AuthService and TransactionService simplify complex subsystems
   - **Decorator Pattern**: AuthMiddleware adds responsibilities to AuthService
   - **Repository Pattern**: All data access is abstracted through repository interfaces
   
3. **Behavioral Patterns:**
   - **Observer Pattern**: NotificationService with observers (EmailNotifier, SMSNotifier, PushNotifier)
   - **Strategy Pattern**: Different TransactionValidator implementations
   - **Chain of Responsibility**: TransactionValidatorChain processes multiple validation steps
   - **Template Method**: AbstractTransaction defines a skeleton with validate() and process() steps

### Object-Oriented Features

1. **Inheritance & Polymorphism:**
   - Person abstract class with User and BankUser subclasses
   - AbstractTransaction with concrete implementations
   
2. **Composition & Aggregation:**
   - Components compose larger structures (SupportTicket contains SupportReplies)
   - Services aggregate repositories and other services
   
3. **Association Types:**
   - Standard associations (User has InstantPaymentAddresses)
   - Qualified associations (User has default BankAccount)
   - Association classes (UserBankAccount)
   - Self-associations (User refers other Users)

### Service-Oriented Architecture

The final design follows a service-oriented approach with:
- Clear separation between entities, repositories, and services
- Domain-driven package organization
- Dependency injection through constructor parameters
- Interface-based abstractions for flexibility

## Rendering Instructions

These PlantUML diagrams can be rendered using:
1. PlantUML extensions in IDEs like VSCode, IntelliJ IDEA
2. Online tools like [PlantUML Server](http://www.plantuml.com/plantuml/uml)
3. Command-line PlantUML tools 