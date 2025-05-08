# Package Diagram

## PlantUML Diagram

The complete package diagram is defined in [package-diagram.puml](package-diagram.puml).

To render this diagram, you can use any PlantUML renderer or online service like [PlantUML Web Server](http://www.plantuml.com/plantuml/uml/).

The FalsoPay system use cases are organized into the following packages:

## 1. User Authentication Package
- Register
- Log In
- Delete Account
- Change PIN
- PIN For Transaction

## 2. Account Management Package
- Edit Personal Info
- Change Display Name
- Change Default IPA Address
- View Your IPA Addresses
- Enable/Disable Notifications
- Block App Transactions
- Unblock App Transactions
- Set Transfer Limit

## 3. Banking Operations Package
- Link Bank Account
- Verify Bank Account Details
- Delete Linked Bank Account
- Receive Confirmation

## 4. Money Transfer Package
- Send Money
- Request Money
- Authorize Sending Money
- Choose Transfer Method
- Send Money via QR Code
- Scan QR Code

## 5. Transaction Management Package
- Check Balance
- View Transaction History
- Filter Transaction
- Update Balance
- Handle Failed Transactions
- Authorize Real-Time Transactions

## 6. Contacts Management Package
- Add Recipients to Favorites for Quick Transfer
- Delete Favorite
- Search

## 7. Customer Support Package
- Contact Customer Support

## 8. Administration Package
- View User Reports
- Deactivate User Account
- Manage Roles
- Set Ticket Status
- Send Notification
- Refresh Tickets
- Check System Status

## Package Relationships
- User Authentication Package is used by all other packages
- Money Transfer Package depends on Transaction Management Package
- Banking Operations Package is related to Transaction Management Package
- Administration Package can access all other packages 