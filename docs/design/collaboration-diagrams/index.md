# FalsoPay Collaboration Diagrams

This directory contains collaboration diagrams for the main business processes of the FalsoPay payment system. These diagrams show the interactions between objects in the system, focusing on the relationships between objects and the messages they exchange.

## Available Diagrams

1. [User Registration](user-registration.puml) - Shows the process of a new user registering for a FalsoPay account
2. [Send Money](send-money.puml) - Illustrates the process of sending money to another user
3. [Link Bank Account](link-bank-account.puml) - Depicts the process of linking a bank account to a FalsoPay account
4. [Dispute Transaction](dispute-transaction.puml) - Shows the process of disputing a transaction
5. [Request Money](request-money.puml) - Illustrates the process of requesting money from another user
6. [Contact Customer Support](contact-customer-support.puml) - Depicts the process of contacting customer support

## Viewing the Diagrams

These diagrams are written in PlantUML format. To view them, you can:

1. Use the [PlantUML Web Server](http://www.plantuml.com/plantuml/uml/)
2. Use a PlantUML plugin for your IDE
3. Use our HTML viewer: [collaboration-viewer.html](collaboration-viewer.html)

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