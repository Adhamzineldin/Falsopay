# Detailed Use Case Descriptions

## UC-1: Register

**Goal:** Allow a new user to create an account in the FalsoPay system  
**Initiator:** Potential User  
**Pre-condition(s):** User has valid email and phone number  
**Post-condition(s):** User account is created and user is logged in  

**Main Success Scenario:**
1. User provides personal information (name, email, phone)
2. User creates a secure password
3. User accepts terms and conditions
4. System validates the information
5. System creates the account
6. System sends verification email/SMS
7. User verifies email/phone
8. System confirms registration

**Alternative Scenarios:**
- Email/phone already registered: System notifies user and suggests login
- Validation fails: System indicates errors and asks for corrections

## UC-2: Log In

**Goal:** Authenticate a registered user into the system  
**Initiator:** Registered User  
**Pre-condition(s):** User has a registered account  
**Post-condition(s):** User is authenticated and granted access to the system  

**Main Success Scenario:**
1. User enters email/phone and password
2. System validates credentials
3. System grants access to the user account
4. System includes Check Balance use case

**Alternative Scenarios:**
- Invalid credentials: System shows error message and allows retry
- Forgotten password: System offers password recovery option

## UC-3: Check Balance

**Goal:** Display current account balance to the user  
**Initiator:** Registered User  
**Pre-condition(s):** User is logged in  
**Post-condition(s):** Current balance is displayed  

**Main Success Scenario:**
1. System retrieves user's current balance
2. System displays the balance to the user

**Alternative Scenarios:**
- Connection error: System shows error message and retry option

## UC-4: Edit Personal Info

**Goal:** Allow user to update their personal information  
**Initiator:** Registered User  
**Pre-condition(s):** User is logged in  
**Post-condition(s):** User information is updated  

**Main Success Scenario:**
1. User selects edit profile option
2. System displays current information
3. User modifies desired fields
4. User submits changes
5. System validates and saves changes

**Alternative Scenarios:**
- Validation fails: System indicates errors and asks for corrections

## UC-5: Link Bank Account

**Goal:** Connect user's bank account to FalsoPay  
**Initiator:** Registered User  
**Pre-condition(s):** User is logged in and has a valid bank account  
**Post-condition(s):** Bank account is linked to FalsoPay account  

**Main Success Scenario:**
1. User selects option to link bank account
2. User enters bank account details
3. System validates the information
4. System includes Verify Bank Account Details use case
5. System includes Receive Confirmation use case

**Alternative Scenarios:**
- Invalid bank details: System shows error and requests correction
- Bank verification fails: System notifies user of failure reason

## UC-6: Receive Confirmation

**Goal:** Provide confirmation of completed action to user  
**Initiator:** System  
**Pre-condition(s):** An action requiring confirmation has been completed  
**Post-condition(s):** User is notified of successful action  

**Main Success Scenario:**
1. System generates confirmation message
2. System displays confirmation to user
3. System stores confirmation record

**Alternative Scenarios:**
- Delivery failure: System retries or stores for later delivery

## UC-7: Verify Bank Account Details

**Goal:** Validate that provided bank account details are accurate and belong to the user  
**Initiator:** System  
**Pre-condition(s):** User has provided bank account information  
**Post-condition(s):** Bank account is verified as valid and belonging to the user  

**Main Success Scenario:**
1. System sends verification request to banking partner
2. Banking partner validates account ownership
3. System receives positive verification
4. System marks account as verified

**Alternative Scenarios:**
- Verification fails: System notifies user and requests alternative method
- Timeout: System notifies user and offers retry option

## UC-8: Authorize Sending Money

**Goal:** Securely authorize a money transfer  
**Initiator:** Registered User  
**Pre-condition(s):** User is logged in and has sufficient balance  
**Post-condition(s):** Money transfer is authorized  

**Main Success Scenario:**
1. User confirms transfer details
2. System validates the transaction
3. User provides authorization (PIN/biometric)
4. System includes Send Money use case

**Alternative Scenarios:**
- Insufficient funds: System notifies user and cancels transaction
- Authorization fails: System allows retry or cancellation

## UC-9: Send Money

**Goal:** Transfer money from user's account to recipient  
**Initiator:** Registered User  
**Pre-condition(s):** User is logged in, has sufficient balance, and transaction is authorized  
**Post-condition(s):** Money is transferred to recipient  

**Main Success Scenario:**
1. System includes Choose Transfer Method use case
2. System includes PIN For Transaction use case
3. System processes the transfer
4. System updates both user and recipient balances
5. System records the transaction
6. System sends confirmation to both parties

**Alternative Scenarios:**
- Transfer fails: System notifies user and reverses any partial transactions
- Recipient not found: System notifies user and cancels transaction

## UC-10: Choose Transfer Method

**Goal:** Select method for transferring money  
**Initiator:** Registered User  
**Pre-condition(s):** User is in process of sending money  
**Post-condition(s):** Transfer method is selected  

**Main Success Scenario:**
1. System presents available transfer methods
2. User selects desired method
3. System configures transfer according to selected method

**Alternative Scenarios:**
- Selected method unavailable: System suggests alternatives

## UC-11: View Transaction History

**Goal:** Display list of past transactions to user  
**Initiator:** Registered User  
**Pre-condition(s):** User is logged in  
**Post-condition(s):** Transaction history is displayed  

**Main Success Scenario:**
1. User requests transaction history
2. System retrieves transaction records
3. System displays transactions chronologically
4. System includes Filter Transaction use case option

**Alternative Scenarios:**
- No transactions: System displays empty history message
- Retrieval error: System shows error and retry option

## UC-12: Request Money

**Goal:** Send money request to another user  
**Initiator:** Registered User  
**Pre-condition(s):** User is logged in and recipient exists  
**Post-condition(s):** Money request is sent to recipient  

**Main Success Scenario:**
1. User selects request money option
2. User selects/enters recipient
3. User enters amount and reason
4. System validates request
5. System sends request to recipient
6. System confirms request sent

**Alternative Scenarios:**
- Recipient not found: System notifies user
- Invalid amount: System asks for correction

## UC-13: Add Recipients to Favorites for Quick Transfer

**Goal:** Save frequently used recipients for easier access  
**Initiator:** Registered User  
**Pre-condition(s):** User is logged in and has completed at least one transfer  
**Post-condition(s):** Recipient is added to favorites list  

**Main Success Scenario:**
1. User selects option to add recipient to favorites
2. User selects recipient from contacts or history
3. User optionally assigns nickname
4. System saves recipient to favorites list

**Alternative Scenarios:**
- Recipient already in favorites: System notifies user
- This use case can extend to Delete Favorite

## UC-14: Delete Favorite

**Goal:** Remove recipient from favorites list  
**Initiator:** Registered User  
**Pre-condition(s):** User is logged in and has favorites saved  
**Post-condition(s):** Selected recipient is removed from favorites  

**Main Success Scenario:**
1. User accesses favorites list
2. User selects recipient to remove
3. User confirms deletion
4. System removes recipient from favorites

**Alternative Scenarios:**
- Deletion error: System shows error and retry option

## UC-15: Change Display Name

**Goal:** Update the display name shown to other users  
**Initiator:** Registered User  
**Pre-condition(s):** User is logged in  
**Post-condition(s):** Display name is updated  

**Main Success Scenario:**
1. User accesses profile settings
2. User enters new display name
3. System validates name
4. System updates display name

**Alternative Scenarios:**
- Invalid name: System shows requirements and asks for correction

## UC-16: Change PIN

**Goal:** Update security PIN for transactions  
**Initiator:** Registered User  
**Pre-condition(s):** User is logged in  
**Post-condition(s):** PIN is updated  

**Main Success Scenario:**
1. User selects change PIN option
2. User enters current PIN
3. User enters and confirms new PIN
4. System validates and updates PIN

**Alternative Scenarios:**
- Current PIN incorrect: System shows error and allows retry
- New PIN doesn't meet requirements: System shows requirements

## UC-17: Change Default IPA Address

**Goal:** Update default Instant Payment Address  
**Initiator:** Registered User  
**Pre-condition(s):** User is logged in  
**Post-condition(s):** Default IPA address is updated  

**Main Success Scenario:**
1. User accesses IPA settings
2. User selects new default IPA from available addresses
3. System updates default IPA

**Alternative Scenarios:**
- No alternative IPAs available: System suggests creating new IPA

## UC-18: Delete Linked Bank Account

**Goal:** Remove connection between bank account and FalsoPay  
**Initiator:** Registered User  
**Pre-condition(s):** User is logged in and has linked bank account  
**Post-condition(s):** Bank account is unlinked  

**Main Success Scenario:**
1. User selects bank account management
2. User selects account to unlink
3. User confirms deletion
4. System removes bank account link

**Alternative Scenarios:**
- Deletion would leave no payment method: System warns user

## UC-19: Enable/Disable Notifications

**Goal:** Control which notifications user receives  
**Initiator:** Registered User  
**Pre-condition(s):** User is logged in  
**Post-condition(s):** Notification settings are updated  

**Main Success Scenario:**
1. User accesses notification settings
2. User toggles desired notification types
3. System saves preferences

**Alternative Scenarios:**
- Some notifications cannot be disabled: System indicates mandatory notifications

## UC-20: Filter Transaction

**Goal:** Filter transaction history by various criteria  
**Initiator:** Registered User  
**Pre-condition(s):** User is viewing transaction history  
**Post-condition(s):** Filtered transactions are displayed  

**Main Success Scenario:**
1. User selects filter option
2. User sets filter criteria (date, amount, type, etc.)
3. System applies filters
4. System displays filtered results

**Alternative Scenarios:**
- No matching transactions: System displays empty result message

## UC-21: View Your IPA Addresses

**Goal:** Display all Instant Payment Addresses associated with account  
**Initiator:** Registered User  
**Pre-condition(s):** User is logged in  
**Post-condition(s):** IPA addresses are displayed  

**Main Success Scenario:**
1. User accesses IPA settings
2. System retrieves IPA addresses
3. System displays all IPAs with status indicators

**Alternative Scenarios:**
- No IPAs found: System suggests creating an IPA

## UC-22: Delete Account

**Goal:** Permanently remove user account from system  
**Initiator:** Registered User  
**Pre-condition(s):** User is logged in  
**Post-condition(s):** Account is marked for deletion or immediately deleted  

**Main Success Scenario:**
1. User selects account deletion option
2. System requests confirmation
3. User confirms deletion
4. System validates no pending transactions
5. System initiates account deletion process
6. System confirms deletion request

**Alternative Scenarios:**
- Pending transactions exist: System notifies user to resolve first
- User has balance: System prompts to withdraw funds first

## UC-23: PIN For Transaction

**Goal:** Verify user identity for secure transaction  
**Initiator:** System  
**Pre-condition(s):** User is attempting a transaction requiring PIN  
**Post-condition(s):** User is authenticated for transaction  

**Main Success Scenario:**
1. System requests PIN entry
2. User enters PIN
3. System validates PIN
4. System authorizes transaction to proceed

**Alternative Scenarios:**
- Incorrect PIN: System allows retry with limit
- Too many failed attempts: System temporarily locks transaction capability

## UC-24: Contact Customer Support

**Goal:** Connect user with customer support  
**Initiator:** Registered User  
**Pre-condition(s):** User is logged in  
**Post-condition(s):** Support ticket is created  

**Main Success Scenario:**
1. User selects contact support option
2. User selects issue category
3. User describes issue
4. System creates support ticket
5. System confirms ticket creation with reference number

**Alternative Scenarios:**
- System offers FAQ solutions before ticket creation
- Critical issues are flagged for priority handling

## UC-25: Search

**Goal:** Find specific information within the app  
**Initiator:** Registered User  
**Pre-condition(s):** User is logged in  
**Post-condition(s):** Search results are displayed  

**Main Success Scenario:**
1. User enters search term
2. System searches across transactions, contacts, and settings
3. System displays categorized results

**Alternative Scenarios:**
- No results found: System suggests alternative search terms

## UC-26: Send Money via QR Code

**Goal:** Transfer money using QR code  
**Initiator:** Registered User  
**Pre-condition(s):** User is logged in and has sufficient balance  
**Post-condition(s):** Money is transferred to recipient  

**Main Success Scenario:**
1. User selects send via QR option
2. System includes Scan QR Code use case
3. System retrieves recipient information
4. System includes Send Money use case

**Alternative Scenarios:**
- Invalid QR code: System shows error message
- QR code expired: System notifies user

## UC-27: Scan QR Code

**Goal:** Read payment information from QR code  
**Initiator:** Registered User  
**Pre-condition(s):** User is in process requiring QR scan  
**Post-condition(s):** QR code information is captured  

**Main Success Scenario:**
1. System activates device camera
2. User positions QR code in scan area
3. System reads and decodes QR data
4. System validates QR format
5. System extracts payment information

**Alternative Scenarios:**
- Camera permission denied: System requests permission
- Unreadable code: System suggests trying again

## UC-28: Handle Failed Transactions

**Goal:** Process and resolve failed transactions  
**Initiator:** System  
**Pre-condition(s):** A transaction has failed  
**Post-condition(s):** Transaction is properly resolved  

**Main Success Scenario:**
1. System detects transaction failure
2. System logs failure details
3. System reverses any partial transactions
4. System notifies affected users
5. System creates recovery record

**Alternative Scenarios:**
- Critical failure: System alerts administrators
- Recovery not possible: System creates support ticket

## UC-29: Block App Transactions

**Goal:** Temporarily prevent transactions from account  
**Initiator:** Registered User  
**Pre-condition(s):** User is logged in  
**Post-condition(s):** Account transactions are blocked  

**Main Success Scenario:**
1. User selects security settings
2. User activates transaction block
3. User confirms action
4. System blocks all transactions
5. System confirms block status

**Alternative Scenarios:**
- Pending transactions exist: System warns user before blocking

## UC-30: Unblock App Transactions

**Goal:** Re-enable transactions for account  
**Initiator:** Registered User  
**Pre-condition(s):** User is logged in and transactions are blocked  
**Post-condition(s):** Account transactions are enabled  

**Main Success Scenario:**
1. User selects security settings
2. User deactivates transaction block
3. User confirms action
4. System verifies user identity
5. System enables transactions
6. System confirms unblocked status

**Alternative Scenarios:**
- Identity verification fails: System maintains block and suggests support

## UC-31: Update Balance

**Goal:** Refresh account balance after transactions  
**Initiator:** System  
**Pre-condition(s):** A transaction affecting balance has occurred  
**Post-condition(s):** Account balance is updated  

**Main Success Scenario:**
1. System calculates new balance
2. System updates balance in database
3. System updates balance in user interface if active

**Alternative Scenarios:**
- Update conflict: System resolves using transaction logs

## UC-32: Authorize Real-Time Transactions

**Goal:** Process transactions in real-time  
**Initiator:** System  
**Pre-condition(s):** A transaction request is received  
**Post-condition(s):** Transaction is authorized or declined  

**Main Success Scenario:**
1. System validates transaction details
2. System checks for sufficient funds
3. System verifies transaction limits
4. System authorizes transaction
5. System records authorization

**Alternative Scenarios:**
- Suspicious activity detected: System flags for review
- System temporarily unavailable: Transaction queued for processing

## UC-33: View User Reports

**Goal:** Allow administrators to view user activity reports  
**Initiator:** Admin  
**Pre-condition(s):** Admin is logged in  
**Post-condition(s):** User reports are displayed  

**Main Success Scenario:**
1. Admin selects reporting section
2. Admin sets report parameters
3. System generates report
4. System displays report data

**Alternative Scenarios:**
- No data for selected parameters: System suggests alternative parameters

## UC-34: Set Transfer Limit

**Goal:** Configure maximum transaction amount  
**Initiator:** Registered User  
**Pre-condition(s):** User is logged in  
**Post-condition(s):** Transfer limit is updated  

**Main Success Scenario:**
1. User accesses security settings
2. User selects transfer limit option
3. User enters new limit
4. System validates limit against policy
5. System updates transfer limit

**Alternative Scenarios:**
- Limit exceeds system maximum: System suggests maximum allowed value

## UC-35: Check System Status

**Goal:** View current system operational status  
**Initiator:** Admin  
**Pre-condition(s):** Admin is logged in  
**Post-condition(s):** System status is displayed  

**Main Success Scenario:**
1. Admin accesses system dashboard
2. System retrieves status of all components
3. System displays status overview
4. Admin can drill down into specific components

**Alternative Scenarios:**
- System components unreachable: System displays last known status with timestamp

## UC-36: Deactivate User Account

**Goal:** Temporarily disable a user account  
**Initiator:** Admin  
**Pre-condition(s):** Admin is logged in and target account exists  
**Post-condition(s):** User account is deactivated  

**Main Success Scenario:**
1. Admin searches for user account
2. Admin selects account
3. Admin chooses deactivate option
4. Admin provides reason
5. System deactivates account
6. System logs action with reason

**Alternative Scenarios:**
- Account has pending transactions: System warns admin

## UC-37: Manage Roles

**Goal:** Assign or modify user roles  
**Initiator:** Admin  
**Pre-condition(s):** Admin is logged in  
**Post-condition(s):** User roles are updated  

**Main Success Scenario:**
1. Admin accesses role management
2. Admin selects user
3. Admin modifies role assignments
4. System validates role changes
5. System updates user roles
6. System logs changes

**Alternative Scenarios:**
- Invalid role combination: System prevents incompatible roles

## UC-38: Set Ticket Status

**Goal:** Update status of support tickets  
**Initiator:** Admin  
**Pre-condition(s):** Admin is logged in and ticket exists  
**Post-condition(s):** Ticket status is updated  

**Main Success Scenario:**
1. Admin views ticket details
2. Admin selects new status
3. Admin adds status note
4. System updates ticket status
5. System notifies user of status change

**Alternative Scenarios:**
- Status change requires approval: System flags for supervisor review

## UC-39: Send Notification

**Goal:** Send system notification to users  
**Initiator:** Admin  
**Pre-condition(s):** Admin is logged in  
**Post-condition(s):** Notification is sent to target users  

**Main Success Scenario:**
1. Admin creates notification
2. Admin selects target audience
3. Admin sets notification priority
4. System validates notification
5. System sends notification
6. System confirms delivery status

**Alternative Scenarios:**
- Some users unreachable: System provides delivery report

## UC-40: Refresh Tickets

**Goal:** Update support ticket queue with latest information  
**Initiator:** Admin  
**Pre-condition(s):** Admin is viewing ticket dashboard  
**Post-condition(s):** Ticket information is refreshed  

**Main Success Scenario:**
1. Admin requests ticket refresh
2. System retrieves latest ticket data
3. System updates ticket display
4. System indicates refresh time

**Alternative Scenarios:**
- Connection error: System shows error and retry option 