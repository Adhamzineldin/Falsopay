# Use Case Diagram

## PlantUML Diagram

The complete use case diagram is defined in [use-case-diagram.puml](use-case-diagram.puml).

To render this diagram, you can use any PlantUML renderer or online service like [PlantUML Web Server](http://www.plantuml.com/plantuml/uml/).

## System Actors

1. **Regular User** - Standard application user
2. **Admin** - System administrator with elevated privileges
3. **System** - Automated processes within the application

## Use Case Diagram Description

The diagram represents the FalsoPay payment system with the following relationships:

### Regular User Use Cases:
- Register
- Log In (includes Check Balance)
- Check Balance
- Edit Personal Info
- Link Bank Account (includes Receive Confirmation, Verify Bank Account Details)
- Authorize Sending Money (includes Send Money)
- Send Money (includes Choose Transfer Method, PIN For Transaction)
- View Transaction History (includes Filter Transaction)
- Request Money
- Add Recipients to Favorites for Quick Transfer (extends Delete Favorite)
- Change Display Name
- Change PIN
- Change Default IPA Address
- Delete Linked Bank Account
- Enable/Disable Notifications
- View Your IPA Addresses
- Delete Account
- Contact Customer Support
- Search
- Send Money via QR Code (includes Scan QR Code, Send Money)
- Block App Transactions
- Unblock App Transactions
- Set Transfer Limit

### Admin Use Cases:
- View User Reports
- Deactivate User Account
- Manage Roles
- Set Ticket Status
- Send Notification
- Refresh Tickets
- Check System Status

### System Use Cases:
- Handle Failed Transactions
- Update Balance
- Authorize Real-Time Transactions

## Relationships
- Regular Users can perform all user-related operations
- Admins have access to administrative functions
- The System handles automated processes
- Various inclusion and extension relationships exist between use cases as specified in the detailed use case descriptions 