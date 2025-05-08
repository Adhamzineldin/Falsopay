# Falsopay System: Detailed Use Case Descriptions

## User Management

### UC01: Register Account
- **Goal**: Create a new user account in the system
- **Initiator**: Unregistered User
- **Pre-condition(s)**: User has valid email and phone number
- **Post-condition(s)**: New user account created, verification process initiated
- **Main Success Scenario**:
  1. User provides personal information (name, email, phone number, password)
  2. System validates the information
  3. System creates an account with status "pending verification"
  4. System sends verification code to the user's phone number
  5. System redirects user to the verification page
- **Alternative Scenarios**:
  - Email already exists: System shows error message
  - Phone number already exists: System shows error message
  - Information validation fails: System shows specific error message
  
### UC02: Login to System
- **Goal**: Authenticate user and grant access to the system
- **Initiator**: User (registered)
- **Pre-condition(s)**: User has an account with active status
- **Post-condition(s)**: User is authenticated and granted access
- **Main Success Scenario**:
  1. User provides email/phone number and password
  2. System validates credentials
  3. System generates authentication token
  4. System grants access to the user's dashboard
- **Alternative Scenarios**:
  - Invalid credentials: System shows error message
  - Account locked: System shows locked account message
  - System in maintenance mode: System shows maintenance message
  
### UC03: Update Profile
- **Goal**: Modify user's personal information
- **Initiator**: Registered User
- **Pre-condition(s)**: User is logged in
- **Post-condition(s)**: User profile information is updated
- **Main Success Scenario**:
  1. User navigates to profile settings
  2. User modifies personal information
  3. User submits changes
  4. System validates the information
  5. System updates the user profile
  6. System confirms successful update
- **Alternative Scenarios**:
  - Information validation fails: System shows specific error message
  - Email change: System requires verification of new email
  
### UC04: Verify Phone Number
- **Goal**: Confirm ownership of phone number
- **Initiator**: User
- **Pre-condition(s)**: User has received verification code
- **Post-condition(s)**: Phone number is verified
- **Main Success Scenario**:
  1. User enters verification code
  2. System validates the code
  3. System marks phone number as verified
  4. System updates account status to "active"
- **Alternative Scenarios**:
  - Invalid code: System shows error message
  - Expired code: System offers to resend code
  
### UC05: Reset Password
- **Goal**: Restore account access when password is forgotten
- **Initiator**: User
- **Pre-condition(s)**: User has an account
- **Post-condition(s)**: User's password is reset
- **Main Success Scenario**:
  1. User requests password reset
  2. System sends reset code to user's phone number
  3. User enters reset code
  4. System validates the code
  5. User sets new password
  6. System updates password
- **Alternative Scenarios**:
  - Invalid code: System shows error message
  - Phone number not found: System shows error message
  
### UC06: Logout
- **Goal**: End user session securely
- **Initiator**: Registered User
- **Pre-condition(s)**: User is logged in
- **Post-condition(s)**: User session is terminated
- **Main Success Scenario**:
  1. User selects logout option
  2. System invalidates authentication token
  3. System redirects to login page
- **Alternative Scenarios**:
  - Session already expired: System redirects to login page

## Account Management

### UC07: Link Bank Account
- **Goal**: Connect user's bank account to the system
- **Initiator**: Registered User
- **Pre-condition(s)**: User is logged in, user has a bank account
- **Post-condition(s)**: Bank account is linked to user's profile
- **Main Success Scenario**:
  1. User selects "Link Bank Account" option
  2. User provides bank details (bank name, account number, etc.)
  3. System initiates bank verification process
  4. Bank system verifies account ownership
  5. System links bank account to user profile
- **Alternative Scenarios**:
  - Bank verification fails: System shows error message
  - Account already linked: System shows notification
  
### UC08: Set Default Account
- **Goal**: Define primary account for transactions
- **Initiator**: Registered User
- **Pre-condition(s)**: User has linked at least one bank account
- **Post-condition(s)**: Default account is set
- **Main Success Scenario**:
  1. User navigates to account settings
  2. User selects an account to set as default
  3. System updates default account setting
  4. System confirms successful update
- **Alternative Scenarios**:
  - No linked accounts: System prompts to link an account first
  
### UC09: View Account Balance
- **Goal**: Check current balance of a linked account
- **Initiator**: Registered User
- **Pre-condition(s)**: User has linked at least one bank account
- **Post-condition(s)**: Account balance is displayed
- **Main Success Scenario**:
  1. User navigates to accounts section
  2. User selects specific account
  3. System retrieves current balance from bank
  4. System displays balance and recent transactions
- **Alternative Scenarios**:
  - Connection to bank fails: System shows cached balance with warning
  - No linked accounts: System prompts to link an account
  
### UC10: Create Instant Payment Address
- **Goal**: Set up a unique address for receiving payments
- **Initiator**: Registered User
- **Pre-condition(s)**: User is logged in
- **Post-condition(s)**: Instant Payment Address (IPA) is created
- **Main Success Scenario**:
  1. User selects "Create IPA" option
  2. User enters desired IPA name
  3. User selects linked account for the IPA
  4. User creates a PIN for the IPA
  5. System validates the information
  6. System creates the IPA
- **Alternative Scenarios**:
  - IPA name already taken: System suggests alternatives
  - No linked accounts: System prompts to link an account first
  
### UC11: Manage Instant Payment Addresses
- **Goal**: View, edit, or delete existing IPAs
- **Initiator**: Registered User
- **Pre-condition(s)**: User has at least one IPA
- **Post-condition(s)**: IPAs are updated as requested
- **Main Success Scenario**:
  1. User navigates to IPA management section
  2. System displays list of user's IPAs
  3. User selects an IPA to manage
  4. User performs desired action (edit, delete, set as primary)
  5. System processes the request
  6. System confirms successful update
- **Alternative Scenarios**:
  - No IPAs found: System prompts to create an IPA
  - Action fails: System shows error message

## Payment Operations

### UC12: Send Money
- **Goal**: Transfer funds to another user or account
- **Initiator**: Registered User
- **Pre-condition(s)**: User has sufficient funds in the selected account
- **Post-condition(s)**: Money is transferred, transaction record created
- **Main Success Scenario**:
  1. User selects "Send Money" option
  2. User selects payment method (IPA, account number, phone)
  3. User enters recipient details
  4. User enters amount and optional message
  5. System validates transaction details
  6. User confirms transaction
  7. System processes the transfer
  8. System creates transaction record
  9. System notifies sender and recipient
- **Alternative Scenarios**:
  - Insufficient funds: System shows error message
  - Invalid recipient: System shows error message
  - Transfer limit exceeded: System shows error message
  - System maintenance: Transaction is declined
  
### UC13: Request Money
- **Goal**: Ask another user to send funds
- **Initiator**: Registered User
- **Pre-condition(s)**: User is logged in
- **Post-condition(s)**: Money request is created
- **Main Success Scenario**:
  1. User selects "Request Money" option
  2. User enters recipient's information
  3. User enters amount and reason for request
  4. System validates the information
  5. System creates money request
  6. System notifies the recipient
- **Alternative Scenarios**:
  - Recipient not found: System offers to send invitation
  - Request limit exceeded: System shows error message
  
### UC14: Accept/Reject Money Request
- **Goal**: Respond to a money request
- **Initiator**: Registered User (request recipient)
- **Pre-condition(s)**: User has received a money request
- **Post-condition(s)**: Request is processed as accepted or rejected
- **Main Success Scenario for Accept**:
  1. User views pending requests
  2. User selects a request to accept
  3. User confirms acceptance
  4. System initiates money transfer
  5. System updates request status to "accepted"
  6. System notifies requester
- **Main Success Scenario for Reject**:
  1. User views pending requests
  2. User selects a request to reject
  3. User confirms rejection
  4. System updates request status to "rejected"
  5. System notifies requester
- **Alternative Scenarios**:
  - Insufficient funds: System shows error message
  - Request expired: System shows notification
  
### UC15: View Transaction History
- **Goal**: Access record of past transactions
- **Initiator**: Registered User
- **Pre-condition(s)**: User is logged in
- **Post-condition(s)**: Transaction history is displayed
- **Main Success Scenario**:
  1. User navigates to transaction history section
  2. User sets optional filters (date range, type, etc.)
  3. System retrieves matching transactions
  4. System displays transactions chronologically
- **Alternative Scenarios**:
  - No transactions found: System shows empty history message
  
### UC16: Add Payment Favorite
- **Goal**: Save recipient details for future payments
- **Initiator**: Registered User
- **Pre-condition(s)**: User has completed at least one transaction
- **Post-condition(s)**: New favorite recipient is added
- **Main Success Scenario**:
  1. User selects "Add Favorite" option
  2. User enters recipient details
  3. User assigns a name to the favorite
  4. System validates information
  5. System saves the favorite
- **Alternative Scenarios**:
  - Favorite with same name exists: System offers to overwrite
  
### UC17: Pay using Saved Favorite
- **Goal**: Quickly send money to a favorite recipient
- **Initiator**: Registered User
- **Pre-condition(s)**: User has at least one saved favorite
- **Post-condition(s)**: Money is transferred to favorite recipient
- **Main Success Scenario**:
  1. User selects "Pay Favorite" option
  2. User selects a favorite from the list
  3. User enters amount and optional message
  4. User confirms transaction
  5. System processes the transfer
  6. System creates transaction record
  7. System notifies sender and recipient
- **Alternative Scenarios**:
  - Insufficient funds: System shows error message
  
### UC18: Export Transaction Records
- **Goal**: Download transaction history in a specific format
- **Initiator**: Registered User
- **Pre-condition(s)**: User has at least one transaction
- **Post-condition(s)**: Transaction data is exported in requested format
- **Main Success Scenario**:
  1. User navigates to transaction history
  2. User selects export option
  3. User chooses date range and format (PDF, CSV)
  4. System generates the export file
  5. System provides download link
- **Alternative Scenarios**:
  - No transactions in range: System shows notification
  - Export generation fails: System shows error message

## Card Management

### UC19: Add Payment Card
- **Goal**: Link a debit/credit card to user account
- **Initiator**: Registered User
- **Pre-condition(s)**: User is logged in
- **Post-condition(s)**: Card is added to user's profile
- **Main Success Scenario**:
  1. User selects "Add Card" option
  2. User enters card details
  3. System validates card information with payment processor
  4. System encrypts and stores card information
  5. System confirms card addition
- **Alternative Scenarios**:
  - Card validation fails: System shows error message
  - Card already exists: System notifies user
  
### UC20: View Cards
- **Goal**: See all linked payment cards
- **Initiator**: Registered User
- **Pre-condition(s)**: User has at least one card added
- **Post-condition(s)**: Cards are displayed
- **Main Success Scenario**:
  1. User navigates to payment methods section
  2. System displays list of linked cards with masked numbers
- **Alternative Scenarios**:
  - No cards found: System shows empty message
  
### UC21: Remove Card
- **Goal**: Delete a payment card from the account
- **Initiator**: Registered User
- **Pre-condition(s)**: User has at least one card added
- **Post-condition(s)**: Selected card is removed
- **Main Success Scenario**:
  1. User navigates to payment methods section
  2. User selects a card to remove
  3. User confirms deletion
  4. System removes the card
  5. System confirms successful removal
- **Alternative Scenarios**:
  - Card in use for recurring payments: System warns user

## Support

### UC22: Create Support Ticket
- **Goal**: Submit a support request
- **Initiator**: User
- **Pre-condition(s)**: None
- **Post-condition(s)**: Support ticket is created
- **Main Success Scenario**:
  1. User navigates to support section
  2. User selects ticket category
  3. User enters subject and description
  4. User submits the ticket
  5. System creates support ticket with "open" status
  6. System provides ticket reference number
- **Alternative Scenarios**:
  - Form validation fails: System shows error message
  
### UC23: View Support Tickets
- **Goal**: Access submitted support tickets
- **Initiator**: Registered User
- **Pre-condition(s)**: User has submitted at least one ticket
- **Post-condition(s)**: Tickets are displayed
- **Main Success Scenario**:
  1. User navigates to support section
  2. System displays list of user's tickets with status
  3. User selects a ticket to view details
  4. System displays ticket details and conversation
- **Alternative Scenarios**:
  - No tickets found: System shows empty message
  
### UC24: Reply to Support Ticket
- **Goal**: Add a response to an existing ticket
- **Initiator**: Registered User or Support Agent
- **Pre-condition(s)**: Support ticket exists
- **Post-condition(s)**: Reply is added to the ticket
- **Main Success Scenario**:
  1. User views ticket details
  2. User enters reply message
  3. User submits the reply
  4. System adds reply to the ticket
  5. System updates ticket timestamp
  6. System notifies other party
- **Alternative Scenarios**:
  - Ticket is closed: System asks if user wants to reopen
  
### UC25: Close Support Ticket
- **Goal**: Mark a support ticket as resolved
- **Initiator**: Support Agent or Registered User
- **Pre-condition(s)**: Support ticket has status "open" or "in progress"
- **Post-condition(s)**: Ticket status is changed to "closed"
- **Main Success Scenario**:
  1. User views ticket details
  2. User selects "Close Ticket" option
  3. User provides resolution summary
  4. System updates ticket status to "closed"
  5. System notifies all parties
- **Alternative Scenarios**:
  - Ticket already closed: System shows notification
  
### UC26: Assign Support Ticket
- **Goal**: Allocate ticket to specific support agent
- **Initiator**: Support Agent
- **Pre-condition(s)**: Support ticket exists with "open" status
- **Post-condition(s)**: Ticket is assigned to agent
- **Main Success Scenario**:
  1. Agent views unassigned tickets
  2. Agent selects a ticket to assign
  3. Agent assigns ticket to self or another agent
  4. System updates ticket assignment
  5. System changes status to "in progress"
  6. System notifies assigned agent
- **Alternative Scenarios**:
  - Ticket already assigned: System asks for confirmation to reassign

## System Administration

### UC27: Change System Settings
- **Goal**: Modify global system configuration
- **Initiator**: Admin
- **Pre-condition(s)**: User has admin privileges
- **Post-condition(s)**: System settings are updated
- **Main Success Scenario**:
  1. Admin navigates to system settings
  2. Admin modifies desired settings
  3. Admin submits changes
  4. System validates changes
  5. System applies new settings
  6. System logs the changes
- **Alternative Scenarios**:
  - Validation fails: System shows error message
  
### UC28: View System Logs
- **Goal**: Access system activity logs
- **Initiator**: Admin
- **Pre-condition(s)**: User has admin privileges
- **Post-condition(s)**: System logs are displayed
- **Main Success Scenario**:
  1. Admin navigates to logs section
  2. Admin sets filters (date range, log level, etc.)
  3. System retrieves matching log entries
  4. System displays logs in chronological order
- **Alternative Scenarios**:
  - No logs found: System shows empty message
  
### UC29: Manage User Accounts
- **Goal**: View, modify, or suspend user accounts
- **Initiator**: Admin
- **Pre-condition(s)**: User has admin privileges
- **Post-condition(s)**: User accounts are modified as requested
- **Main Success Scenario**:
  1. Admin navigates to user management
  2. Admin searches for specific user
  3. System displays matching users
  4. Admin selects user to manage
  5. Admin performs actions (edit details, suspend account)
  6. System processes the changes
  7. System logs the action
- **Alternative Scenarios**:
  - User not found: System shows no results message
  
### UC30: Toggle Maintenance Mode
- **Goal**: Enable or disable system maintenance mode
- **Initiator**: Admin
- **Pre-condition(s)**: User has admin privileges
- **Post-condition(s)**: Maintenance mode is toggled
- **Main Success Scenario for Enable**:
  1. Admin navigates to system settings
  2. Admin activates maintenance mode
  3. Admin sets maintenance message and duration
  4. System enters maintenance mode
  5. System shows maintenance message to users
  6. System allows only admins to log in
- **Main Success Scenario for Disable**:
  1. Admin navigates to system settings
  2. Admin deactivates maintenance mode
  3. System exits maintenance mode
  4. System restores normal operation
- **Alternative Scenarios**:
  - Critical processes running: System warns before enabling
  
### UC31: Set Transaction Limits
- **Goal**: Define maximum transaction amounts
- **Initiator**: Admin
- **Pre-condition(s)**: User has admin privileges
- **Post-condition(s)**: Transaction limits are updated
- **Main Success Scenario**:
  1. Admin navigates to transaction settings
  2. Admin sets limits for different transaction types
  3. Admin submits changes
  4. System validates and applies new limits
  5. System logs the changes
- **Alternative Scenarios**:
  - Invalid limit values: System shows error message 