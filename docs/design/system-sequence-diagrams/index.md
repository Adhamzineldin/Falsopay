# FalsoPay System Sequence Diagrams

This directory contains system sequence diagrams (SSDs) for the FalsoPay payment system. System sequence diagrams show the interaction between external actors and the system as a whole, focusing on the events exchanged between them.

## Available System Sequence Diagrams

1. [User Registration](user-registration-ssd.puml) - The interaction between a new user and the system during account creation
2. [Send Money](send-money-ssd.puml) - The interaction between a user and the system when transferring money
3. [Link Bank Account](link-bank-account-ssd.puml) - The interaction between a user, the system, and banking partners when connecting a bank account
4. [Dispute Transaction](dispute-transaction-ssd.puml) - The interaction between users, support agents, and the system during a transaction dispute
5. [Request Money](request-money-ssd.puml) - The interaction between requestor, recipient, and the system during a money request
6. [Contact Customer Support](contact-customer-support-ssd.puml) - The interaction between a user, support agents, and the system during support cases

## System Sequence Diagram Structure

Each system sequence diagram follows this general structure:
1. **Actors** - External entities that interact with the system (users, support agents, etc.)
2. **System Boundary** - The system treated as a black box
3. **Messages** - Chronological exchange of events between actors and the system
4. **Alternative Paths** - Different scenarios based on conditions
5. **Optional Steps** - Actions that may or may not occur

## Rendering PlantUML Diagrams

To render these PlantUML diagrams, you can use:
- PlantUML extension in your IDE
- [PlantUML Web Server](http://www.plantuml.com/plantuml/uml/)
- PlantUML command-line tool

## Relationship to Other Diagrams

System sequence diagrams complement other diagrams in the FalsoPay documentation:
- **Use Case Diagrams** - SSDs show the details of a specific use case scenario
- **Activity Diagrams** - SSDs focus on external interactions while activity diagrams show internal workflows
- **Sequence Diagrams** - SSDs treat the system as a black box while sequence diagrams show interactions between internal components 