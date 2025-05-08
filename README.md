# Falsopay Database Design

This repository contains the database design for the Falsopay financial application. The database is designed to support a modern financial payment system with features like instant payments, card management, bank accounts, money requests, favorites, and customer support.

## Available Documentation

1. **Entity-Relationship Diagram (ERD)** - [falsopay_erd.md](docs/design/database/ERD/falsopay_erd.md)
   * Visual representation of all entities and their relationships
   * Includes detailed entity attributes

2. **Table Schema** - [falsopay_table_schema.md](docs/design/database/ERD/falsopay_table_schema.md)
   * Complete SQL CREATE statements for all tables
   * Includes data types, constraints, and foreign key relationships

3. **Database Diagram** - [falsopay_db_diagram.puml](docs/design/database/ERD/falsopay_db_diagram.puml)
   * PlantUML diagram showing the database structure
   * Can be rendered using PlantUML tools or online services

## Key Database Entities

### Core Financial Entities
* **Users** - Application users who can send/receive payments
* **Banks** - Financial institutions supported by the system
* **BankUsers** - Bank customers with account relationships
* **BankAccounts** - Accounts at banks tied to users
* **InstantPaymentAddresses** - Unique payment addresses for quick transfers
* **Cards** - Payment cards linked to bank accounts

### Transaction Entities
* **Transactions** - Records of all financial transfers
* **MoneyRequests** - Requests for payments between users
* **Favorites** - Saved payment recipients for quick access

### Support System
* **SupportTickets** - Customer support inquiries
* **SupportReplies** - Responses to support tickets
* **SystemSettings** - Global application settings

## Database Design Principles

The database follows these key design principles:

1. **Normalized Structure** - Properly normalized to reduce redundancy
2. **Flexibility** - Supports various payment methods (IPA, account, card, phone, IBAN)
3. **Auditability** - Maintains comprehensive transaction records
4. **Scalability** - Can grow to support additional features
5. **Security** - Designed with security considerations (e.g., pins and sensitive data stored securely)

## Viewing the Diagrams

The ERD is available in Mermaid format and can be viewed in compatible Markdown viewers.

The PlantUML diagram can be rendered using:
* Online PlantUML tools like [PlantUML Server](http://www.plantuml.com/plantuml/uml/)
* PlantUML plugins for various IDEs
* PlantUML command-line tools

## Implementation Notes

The database design is implemented in MySQL/MariaDB with:
* InnoDB storage engine for foreign key support
* UTF-8mb4 character set and collation
* Appropriate indexes on frequently queried columns 