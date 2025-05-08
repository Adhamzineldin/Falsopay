# FalsoPay Use Case Documentation

This directory contains the use case documentation for the FalsoPay payment system.

## Contents

1. [Use Case Diagram](use-case-diagram.md) - Visual representation of all system use cases and their relationships
   - [PlantUML Source](use-case-diagram.puml) - PlantUML source for the use case diagram
2. [Package Diagram](package-diagram.md) - Organization of use cases into logical packages
   - [PlantUML Source](package-diagram.puml) - PlantUML source for the package diagram
3. [Detailed Use Cases](detailed-use-cases.md) - Comprehensive descriptions of all system use cases
4. [Individual Use Case Diagrams](individual-use-cases.puml) - PlantUML source for individual use case diagrams

## Rendering PlantUML Diagrams

To render the PlantUML diagrams, you can use:
- PlantUML extension in your IDE
- [PlantUML Web Server](http://www.plantuml.com/plantuml/uml/)
- PlantUML command-line tool

## Use Case Overview

The FalsoPay system includes 40 use cases organized into the following categories:

### User Authentication
- Register
- Log In
- Delete Account
- Change PIN
- PIN For Transaction

### Account Management
- Edit Personal Info
- Change Display Name
- Change Default IPA Address
- View Your IPA Addresses
- Enable/Disable Notifications
- Block App Transactions
- Unblock App Transactions
- Set Transfer Limit

### Banking Operations
- Link Bank Account
- Verify Bank Account Details
- Delete Linked Bank Account
- Receive Confirmation

### Money Transfer
- Send Money
- Request Money
- Authorize Sending Money
- Choose Transfer Method
- Send Money via QR Code
- Scan QR Code

### Transaction Management
- Check Balance
- View Transaction History
- Filter Transaction
- Update Balance
- Handle Failed Transactions
- Authorize Real-Time Transactions

### Contacts Management
- Add Recipients to Favorites for Quick Transfer
- Delete Favorite
- Search

### Customer Support
- Contact Customer Support

### Administration
- View User Reports
- Deactivate User Account
- Manage Roles
- Set Ticket Status
- Send Notification
- Refresh Tickets
- Check System Status 