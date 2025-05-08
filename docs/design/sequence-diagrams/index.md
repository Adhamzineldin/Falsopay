# FalsoPay Sequence Diagrams

This directory contains sequence diagrams for the FalsoPay system use cases. Each diagram illustrates the interactions between actors, the application, and various system components for a specific use case.

## Available Sequence Diagrams

1. [UC-1: Register](UC1-Register.puml) - User registration process
2. [UC-2: Log In](UC2-LogIn.puml) - User authentication process
3. [UC-3: Check Balance](UC3-CheckBalance.puml) - Balance inquiry process
4. [UC-4: Edit Personal Info](UC4-EditPersonalInfo.puml) - Updating user profile information
5. [UC-5: Link Bank Account](UC5-LinkBankAccount.puml) - Process for linking a bank account
6. [UC-6: Receive Confirmation](UC6-ReceiveConfirmation.puml) - Providing confirmation of completed actions
7. [UC-7: Verify Bank Account Details](UC7-VerifyBankAccountDetails.puml) - Validating bank account information
8. [UC-8: Authorize Sending Money](UC8-AuthorizeSendingMoney.puml) - Authorization for money transfers
9. [UC-9: Send Money](UC9-SendMoney.puml) - Money transfer process
10. [UC-10: Choose Transfer Method](UC10-ChooseTransferMethod.puml) - Selecting payment method
11. [UC-11: View Transaction History](UC11-ViewTransactionHistory.puml) - Viewing past transactions
12. [UC-12: Request Money](UC12-RequestMoney.puml) - Requesting money from another user
13. [UC-13/14: Add/Delete Favorites](UC13-14-AddDeleteFavorites.puml) - Managing favorite recipients
14. [UC-15: Change Display Name](UC15-ChangeDisplayName.puml) - Updating display name
15. [UC-16: Change PIN](UC16-ChangePin.puml) - Changing security PIN
16. [UC-17: Change Default IPA Address](UC17-ChangeDefaultIPA.puml) - Updating default payment address
17. [UC-18: Delete Linked Bank Account](UC18-DeleteLinkedBankAccount.puml) - Removing a bank account link
18. [UC-19: Enable/Disable Notifications](UC19-EnableDisableNotifications.puml) - Managing notification settings
19. [UC-20: Filter Transaction](UC20-FilterTransaction.puml) - Filtering transaction history
20. [UC-21: View Your IPA Addresses](UC21-ViewIPAAddresses.puml) - Viewing payment addresses
21. [UC-22: Delete Account](UC22-DeleteAccount.puml) - Permanently removing user account
22. [UC-23: PIN For Transaction](UC23-PINForTransaction.puml) - Verifying identity for transactions
23. [UC-24: Contact Customer Support](UC24-ContactCustomerSupport.puml) - Connecting with customer support
24. [UC-25: Search](UC25-Search.puml) - Finding specific information within the app
25. [UC-26: Send Money via QR Code](UC26-SendMoneyViaQRCode.puml) - Transferring money using QR code
26. [UC-27: Scan QR Code](UC27-ScanQRCode.puml) - Reading payment information from QR code
27. [UC-28: Handle Failed Transactions](UC28-HandleFailedTransactions.puml) - Processing and resolving failed transactions
28. [UC-29: Block App Transactions](UC29-BlockAppTransactions.puml) - Temporarily preventing account transactions
29. [UC-30: Unblock App Transactions](UC30-UnblockAppTransactions.puml) - Re-enabling account transactions
30. [UC-31: Update Balance](UC31-UpdateBalance.puml) - Refreshing account balance after transactions
31. [UC-32: Authorize Real-Time Transactions](UC32-AuthorizeRealTimeTransactions.puml) - Processing transactions in real-time
32. [UC-33: View User Reports](UC33-ViewUserReports.puml) - Viewing user activity reports (admin)
33. [UC-34: Set Transfer Limit](UC34-SetTransferLimit.puml) - Configuring maximum transaction amount
34. [UC-35: Check System Status](UC35-CheckSystemStatus.puml) - Viewing system operational status (admin)
35. [UC-36: Deactivate User Account](UC36-DeactivateUserAccount.puml) - Admin process for deactivating a user account
36. [UC-37: Manage Roles](UC37-ManageRoles.puml) - Assigning or modifying user roles (admin)
37. [UC-38: Set Ticket Status](UC38-SetTicketStatus.puml) - Updating status of support tickets (admin)
38. [UC-39: Send Notification](UC39-SendNotification.puml) - Sending system notifications to users (admin)
39. [UC-40: Refresh Tickets](UC40-RefreshTickets.puml) - Updating support ticket queue (admin)

## Rendering PlantUML Diagrams

To render these PlantUML diagrams, you can use:
- PlantUML extension in your IDE
- [PlantUML Web Server](http://www.plantuml.com/plantuml/uml/)
- PlantUML command-line tool

## Sequence Diagram Structure

Each sequence diagram follows this general structure:
1. **Actors** - Users or external systems that initiate actions
2. **Participants** - System components that process the actions
3. **Messages** - Interactions between actors and participants
4. **Alternative Flows** - Different paths based on conditions
5. **Activations** - Showing when components are actively processing

## Common Components in Diagrams

The following components appear in multiple sequence diagrams:

- **FalsoPay App/Dashboard** - The user interface
- **API Gateway** - Entry point for all API requests
- **User Service** - Handles user management
- **Transaction Service** - Processes financial transactions
- **Account Service** - Manages account information
- **Notification Service** - Sends notifications to users
- **Security Service** - Handles authentication and authorization
- **Database** - Persistent data storage
- **External Services** - Third-party integrations

## Architectural Patterns Illustrated

These sequence diagrams demonstrate several architectural patterns used in FalsoPay:

1. **API Gateway Pattern** - All client requests go through a central gateway
2. **Microservices Architecture** - Functionality is divided into specialized services
3. **Event-Driven Architecture** - Services communicate through events (e.g., notifications)
4. **Circuit Breaker Pattern** - Handling failures in external service calls

For a complete explanation of the architectural patterns used in FalsoPay, see the [Architectural Patterns](../architectural-patterns.md) document. 