# FalsoPay Object Diagrams

This directory contains object diagrams for the FalsoPay payment system. Object diagrams show instances of classes and their relationships at a specific point in time, illustrating the system's state before and after key operations.

## Available Diagrams

### User Registration Process
1. [User Registration - Precondition](user-registration-precondition.puml) - System state before user registration
2. [User Registration - Postcondition](user-registration-postcondition.puml) - System state after successful user registration

### Money Transfer Process
1. [Send Money - Precondition](send-money-precondition.puml) - System state before money transfer
2. [Send Money - Postcondition](send-money-postcondition.puml) - System state after successful money transfer

### Bank Account Process
1. [Link Bank Account - Precondition](link-bank-account-precondition.puml) - System state before linking bank account
2. [Link Bank Account - Postcondition](link-bank-account-postcondition.puml) - System state after successful bank account linking

### Money Request Process
1. [Request Money - Precondition](request-money-precondition.puml) - System state before money request
2. [Request Money - Postcondition](request-money-postcondition.puml) - System state after successful money request

### Support Ticket Process
1. [Support Ticket - Precondition](support-ticket-precondition.puml) - System state before creating support ticket
2. [Support Ticket - Postcondition](support-ticket-postcondition.puml) - System state after successful support ticket creation

### Security Operations Process
1. [Block Transactions - Precondition](block-transactions-precondition.puml) - System state before blocking account transactions
2. [Block Transactions - Postcondition](block-transactions-postcondition.puml) - System state after successfully blocking transactions

## Understanding Object Diagrams

Object diagrams differ from class diagrams in that they show specific instances rather than general structures. Each object is an instance of a class with specific attribute values. The diagrams in this directory illustrate:

1. **Preconditions** - The state of objects before a significant operation
2. **Postconditions** - The state of objects after the operation has completed successfully

These diagrams help visualize how the system's state changes during key operations and can be used to validate that operations produce the expected results.

## Viewing the Diagrams

These diagrams are written in PlantUML format. To view them, you can:

1. Use the [PlantUML Web Server](http://www.plantuml.com/plantuml/uml/)
2. Use a PlantUML plugin for your IDE
3. Use our HTML viewer: [object-diagram-viewer.html](object-diagram-viewer.html) 