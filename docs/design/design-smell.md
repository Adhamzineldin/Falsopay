# Design Smell in FalsoPay System

## Definition of Design Smell

A design smell is a symptom of poor design that indicates deeper problems in the system architecture. Design smells are similar to code smells but occur at a higher level of abstraction. They represent structures in the design that suggest the violation of fundamental design principles and negatively impact design quality. Design smells often lead to technical debt, making the system harder to maintain, extend, and evolve over time.

Common categories of design smells include:

1. **Rigidity**: Difficulty in making changes to the design
2. **Fragility**: Tendency of the design to break in many places when a single change is made
3. **Immobility**: Inability to reuse components in other systems
4. **Viscosity**: Easier to implement changes in a way that preserves the design
5. **Needless Complexity**: Over-engineering or unnecessary abstraction
6. **Needless Repetition**: Repeated structures that could be unified
7. **Opacity**: Difficulty in understanding the design

## Identified Design Smell in FalsoPay: Bloated Service

### Description

In the FalsoPay system, a design smell can be identified in the `TransactionService` class, which exhibits characteristics of a "God Class" or "Bloated Service." This class handles multiple responsibilities related to transactions:

1. Transaction creation and execution
2. Balance verification
3. Transaction validation
4. Notification triggering
5. Account balance updates
6. Transaction history management
7. Money request processing

This violates the Single Responsibility Principle (SRP), one of the SOLID principles of object-oriented design. The `TransactionService` has too many responsibilities and becomes a central point of coupling in the system.

### Evidence from the Design

In the sequence diagram for UC9-SendMoney, we can see that the `TransactionService` is responsible for:

1. Preparing transactions
2. Checking balances (through AccountService)
3. Creating transaction drafts
4. Setting transfer methods
5. Executing transactions
6. Updating accounts
7. Triggering notifications

This creates a highly coupled design where changes to any transaction-related functionality might affect the entire service, making it harder to maintain and test.

### Impact

This design smell leads to several problems:

1. **Maintainability issues**: Changes to one aspect of transaction processing might affect unrelated functionality
2. **Testing difficulties**: The service becomes hard to test due to its many responsibilities
3. **Decreased cohesion**: The class lacks a focused, single purpose
4. **Increased coupling**: Many other components depend on this service
5. **Scalability challenges**: The service becomes a bottleneck in the system

## Suggested Solution

To address this design smell, we should refactor the `TransactionService` by applying the Single Responsibility Principle and splitting it into more focused services:

1. **TransactionCreationService**: Responsible for creating and preparing transactions
2. **TransactionValidationService**: Handles validation of transactions
3. **TransactionExecutionService**: Manages the execution of transactions
4. **BalanceVerificationService**: Focuses on balance checks and verification
5. **TransactionNotificationService**: Handles notification aspects of transactions
6. **MoneyRequestService**: Manages money request functionality

Additionally, we should:

1. Implement a Facade pattern if clients need a simplified interface to these services
2. Use the Mediator pattern to handle complex interactions between these services
3. Implement proper dependency injection to reduce coupling
4. Create well-defined interfaces for each service

This refactoring would lead to a more maintainable, testable, and scalable design that better follows the principles of object-oriented design.

## Benefits of the Solution

1. **Improved maintainability**: Changes to one aspect of transaction processing won't affect others
2. **Better testability**: Each service can be tested in isolation
3. **Higher cohesion**: Each class has a clear, single responsibility
4. **Reduced coupling**: Dependencies are more explicit and manageable
5. **Better scalability**: Services can be scaled independently based on load
6. **Easier to extend**: New transaction-related functionality can be added without modifying existing code 