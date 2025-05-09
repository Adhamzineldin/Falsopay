# FalsoPay Collaboration Diagrams

This directory contains collaboration diagrams for key use cases in the FalsoPay system. Collaboration diagrams show the interactions between objects in the system, focusing on the relationships between objects rather than the sequence of interactions.

## Available Diagrams

1. **[UC1-Register](UC1-Register.puml)** - User registration process including validation and verification
2. **[UC2-LogIn](UC2-LogIn.puml)** - User login process with phone verification and IPA validation
3. **[UC3-CheckBalance](UC3-CheckBalance.puml)** - Process for checking account balance
4. **[UC5-LinkBankAccount](UC5-LinkBankAccount.puml)** - Process for linking a bank account to FalsoPay
5. **[UC9-SendMoney](UC9-SendMoney.puml)** - Process for sending money to another user
6. **[UC12-RequestMoney](UC12-RequestMoney.puml)** - Process for requesting money from another user

## Diagram Structure

Each collaboration diagram includes:

1. **Participants** - Objects involved in the use case
2. **Relationships** - Connections between objects
3. **Messages** - Numbered messages showing the flow of communication
4. **Alternative Paths** - Different paths through the system based on conditions

## Viewing the Diagrams

These diagrams are created using PlantUML. To view them:

1. Use a PlantUML compatible viewer or IDE plugin
2. Use the online PlantUML server: http://www.plantuml.com/plantuml/
3. Generate images using the PlantUML command-line tool

## Diagram Layout

The diagrams are designed to minimize line intersections for better readability. Objects are positioned strategically, and hidden relationships are used to control layout.

## Diagram Conventions

- **Actors** represent external entities that interact with the system
- **Classes/Rectangles** represent components or services within the system
- **Arrows** represent messages or method calls between objects
- **Notes** provide additional context or alternative flows

Each diagram follows the communication diagram notation where objects are connected by links, and messages are shown as arrows along these links.

## Understanding Collaboration Diagrams

Collaboration diagrams (also known as communication diagrams in UML 2.x) show:

1. **Objects/Components** - Represented as boxes or symbols
2. **Relationships** - Shown as lines connecting the objects
3. **Messages** - Depicted as labeled arrows along these relationships, with sequence numbers to indicate the order

Unlike sequence diagrams that emphasize time ordering with vertical positioning, collaboration diagrams focus on the structural organization of objects that participate in the interaction.

## Features of These Diagrams

- **Numbered Messages**: Each message is numbered to show the sequence of interactions
- **Alternative Flows**: Notes are used to indicate alternative paths through the system
- **Complete System View**: All major components involved in each process are represented
- **API Endpoints**: RESTful API endpoints are included to show the exact interfaces

## Related Diagrams

- [Activity Diagrams](../activity-diagrams/) - Show the workflow of the processes
- [Sequence Diagrams](../sequence-diagrams/) - Show the time-ordered interactions between components
- [System Sequence Diagrams](../system-sequence-diagrams/) - Show interactions between actors and the system as a black box 