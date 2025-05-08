# Black-Box Testing Report

This document presents a system-testing report for 6 main functions in the FalsoPay system using black-box testing methodology. For each function, we determine a set of test cases focusing on boundary testing to examine behavior at the extreme ends or boundaries between partitions of input values.

## 1. `TransactionController::sendMoney()`

### Function Purpose
Enables users to send money to other users through various transfer methods.

### Boundary Values
- Amount: 0, 0.01, maximum transfer limit, maximum transfer limit + 0.01
- PIN: Empty, valid PIN, invalid PIN
- Transfer methods: All supported methods vs unsupported method

### Test Cases

| Test Case ID | Test Description | Input | Expected Output | Category |
|--------------|------------------|-------|-----------------|----------|
| ST1 | Zero amount transfer | amount=0 | Error: Invalid amount | Boundary |
| ST2 | Minimum valid amount | amount=0.01 | Success | Boundary |
| ST3 | Maximum transfer limit | amount=transfer_limit | Success | Boundary |
| ST4 | Exceeding transfer limit | amount=transfer_limit+0.01 | Error: Exceeds limit | Boundary |
| ST5 | Empty PIN | pin="" | Error: Missing required field | Boundary |
| ST6 | Invalid transfer method | transfer_method="invalid" | Error: Invalid receiver details | Boundary |
| ST7 | Maximum possible amount | amount=999999999.99 | Success (if within limits) | Extreme |

### Test Environment Setup
- Configure system with a known transfer limit (e.g., 10000)
- Create test sender account with sufficient balance
- Create test recipient account
- Set up test data for each transfer method (mobile, IPA, IBAN, card)

## 2. `AuthController::login()`

### Function Purpose
Authenticates users and provides access tokens.

### Boundary Values
- Phone number: Empty, invalid format, valid format
- IPA address: Empty, invalid format, valid format but non-existent, valid and existing

### Test Cases

| Test Case ID | Test Description | Input | Expected Output | Category |
|--------------|------------------|-------|-----------------|----------|
| ST1 | Empty phone number | phone_number="" | Error: Missing required field | Boundary |
| ST2 | Invalid phone format | phone_number="abc" | Error: User not found | Boundary |
| ST3 | Empty IPA address | ipa_address="" | Error: Missing required field | Boundary |
| ST4 | Very long IPA address | ipa_address=string of 256 chars | Error: Invalid IPA | Boundary |
| ST5 | Special characters in IPA | ipa_address="test!@#$%" | Error: Invalid IPA | Boundary |
| ST6 | Valid credentials | Valid phone and IPA | Success: user_token returned | Normal |

### Test Environment Setup
- Create test users with known phone numbers and IPA addresses
- Create a blocked user account for testing the blocked state
- Set up test data with and without IPA accounts

## 3. `BankAccountController::linkAccountToService()`

### Function Purpose
Links a bank account to the FalsoPay service using card details.

### Boundary Values
- Card number: Empty, too short, too long, valid format
- PIN: Empty, too short, too long, valid format

### Test Cases

| Test Case ID | Test Description | Input | Expected Output | Category |
|--------------|------------------|-------|-----------------|----------|
| ST1 | Empty card number | card_number="" | Error: Missing required field | Boundary |
| ST2 | Card number too short | card_number="123" | Error: Card not found | Boundary |
| ST3 | Card number too long | card_number=25 digits | Error: Card not found | Boundary |
| ST4 | Empty PIN | card_pin="" | Error: Missing required field | Boundary |
| ST5 | PIN too short | card_pin="1" | Error: Incorrect PIN | Boundary |
| ST6 | PIN too long | card_pin="12345" | Error: Incorrect PIN | Boundary |
| ST7 | Valid card details | Valid card number and PIN | Success: bank accounts returned | Normal |

### Test Environment Setup
- Create test bank accounts with known card numbers and PINs
- Set up test data with various card types and statuses

## 4. `User::createUser()`

### Function Purpose
Creates a new user in the system.

### Boundary Values
- Name fields: Empty, very long strings
- Email: Empty, invalid format, valid format
- Phone number: Empty, invalid format, valid format

### Test Cases

| Test Case ID | Test Description | Input | Expected Output | Category |
|--------------|------------------|-------|-----------------|----------|
| ST1 | Empty first name | first_name="" | Error: Missing required field | Boundary |
| ST2 | Very long first name | first_name=256 chars | Success but potential truncation | Boundary |
| ST3 | Empty email | email="" | Error: Missing required field | Boundary |
| ST4 | Invalid email format | email="notanemail" | Error: Invalid data | Boundary |
| ST5 | Empty phone number | phone_number="" | Error: Missing required field | Boundary |
| ST6 | Invalid phone format | phone_number="abc" | Error: Invalid data | Boundary |
| ST7 | Valid user data | All fields valid | Success: user created | Normal |
| ST8 | Duplicate email | email=existing_email | Error: Email already in use | Boundary |
| ST9 | Duplicate phone | phone=existing_phone | Error: Phone already in use | Boundary |

### Test Environment Setup
- Clear test user data before each test
- Create some users with known emails and phone numbers for duplicate testing

## 5. `BankAccount::addBalance()`

### Function Purpose
Adds funds to a bank account balance.

### Boundary Values
- Amount: Negative, zero, very large positive
- Account: Existing, non-existing

### Test Cases

| Test Case ID | Test Description | Input | Expected Output | Category |
|--------------|------------------|-------|-----------------|----------|
| ST1 | Negative amount | amount=-100 | Error or unexpected behavior | Boundary |
| ST2 | Zero amount | amount=0 | Success but no change | Boundary |
| ST3 | Very large amount | amount=999999999.99 | Success | Boundary |
| ST4 | Non-existent account | Invalid bank_id/account_number | Error: Account not found | Boundary |
| ST5 | Valid moderate amount | amount=100 | Success: Balance updated | Normal |
| ST6 | Amount with many decimal places | amount=100.12345 | Success with rounded amount | Boundary |

### Test Environment Setup
- Create test bank accounts with known initial balances
- Set up database to track balance changes

## 6. `Transaction::getAllByUserId()`

### Function Purpose
Retrieves all transactions associated with a specific user.

### Boundary Values
- User ID: Non-existent, user with no transactions, user with many transactions

### Test Cases

| Test Case ID | Test Description | Input | Expected Output | Category |
|--------------|------------------|-------|-----------------|----------|
| ST1 | Non-existent user ID | user_id=99999 | Empty array | Boundary |
| ST2 | User with no transactions | user_id with no transactions | Empty array | Boundary |
| ST3 | User with many transactions | user_id with 1000+ transactions | Large array of transactions | Boundary |
| ST4 | User with some transactions | user_id with few transactions | Array of transactions | Normal |
| ST5 | Invalid user ID format | user_id="abc" | Error: Invalid user ID | Boundary |
| ST6 | Negative user ID | user_id=-1 | Error or empty array | Boundary |

### Test Environment Setup
- Create test users with varying numbers of transactions
- Create a user with a large number of transactions to test performance

## Test Execution Notes

1. **Environment Preparation**:
   - Tests should be run in an isolated environment to prevent affecting production data
   - Database should be reset to a known state before each test suite execution

2. **Test Data Management**:
   - Create scripts to generate test data for different scenarios
   - Consider using database snapshots for quick reset between tests

3. **Performance Considerations**:
   - For boundary tests involving large data sets (e.g., ST3 for `Transaction::getAllByUserId()`), monitor system performance
   - Set appropriate timeouts for tests that might take longer to execute

4. **Security Testing**:
   - For functions handling sensitive data (like PIN verification), ensure tests don't expose security vulnerabilities
   - Test for SQL injection in input fields

5. **Test Reporting**:
   - Document any unexpected behaviors or edge cases discovered during testing
   - Track test execution times for performance-sensitive functions

## Expected Results Documentation

For each test case:
1. Record actual system response
2. Compare with expected output
3. Document any discrepancies
4. For failures, provide detailed error information and steps to reproduce

This approach ensures thorough testing of input boundaries and edge cases, helping identify potential issues before they affect users in production.
