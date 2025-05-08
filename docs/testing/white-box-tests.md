# White-Box Testing Report

This document presents a unit testing report for 6 main functions in the FalsoPay system using white-box testing methodology. For each function, we determine a set of test cases such that each path through the function is executed at least once.

## 1. `TransactionController::sendMoney()`

### Function Overview
This function handles money transfers between users, with multiple validation steps and conditions.

### Control Flow Paths
1. Missing required fields
2. System transactions blocked
3. Transfer limit exceeded
4. Invalid sender account
5. Invalid PIN
6. Invalid receiver (mobile number not found)
7. Receiver without IPA account
8. Insufficient balance
9. Successful transaction

### Test Cases

| Test Case ID | Input Parameters | Expected Output | Path Covered |
|--------------|------------------|-----------------|-------------|
| TC1 | `['sender_user_id' => 1]` | Error: Missing required field: pin | Path 1 |
| TC2 | `['amount' => 100, 'pin' => '1234', 'sender_user_id' => 1, 'sender_ipa_address' => 'user@falsopay']` with transactions_blocked=true | Error: Transactions blocked | Path 2 |
| TC3 | `['amount' => 2000, 'pin' => '1234', 'sender_user_id' => 1, 'sender_ipa_address' => 'user@falsopay']` with limit=1000 | Error: Transfer limit exceeded | Path 3 |
| TC4 | `['amount' => 100, 'pin' => '1234', 'sender_user_id' => 1, 'sender_ipa_address' => 'invalid@falsopay']` | Error: Invalid sender account | Path 4 |
| TC5 | `['amount' => 100, 'pin' => '9999', 'sender_user_id' => 1, 'sender_ipa_address' => 'user@falsopay']` | Error: Invalid PIN | Path 5 |
| TC6 | `['amount' => 100, 'pin' => '1234', 'sender_user_id' => 1, 'sender_ipa_address' => 'user@falsopay', 'transfer_method' => 'mobile', 'receiver_mobile_number' => '9999999999']` | Error: No user with that mobile number | Path 6 |
| TC7 | `['amount' => 100, 'pin' => '1234', 'sender_user_id' => 1, 'sender_ipa_address' => 'user@falsopay', 'transfer_method' => 'mobile', 'receiver_mobile_number' => '1234567890']` with user having no IPA | Error: Receiver does not have an IPA account | Path 7 |
| TC8 | `['amount' => 1000, 'pin' => '1234', 'sender_user_id' => 1, 'sender_ipa_address' => 'user@falsopay', 'transfer_method' => 'mobile', 'receiver_mobile_number' => '1234567890']` with balance=500 | Error: Insufficient balance | Path 8 |
| TC9 | `['amount' => 100, 'pin' => '1234', 'sender_user_id' => 1, 'sender_ipa_address' => 'user@falsopay', 'transfer_method' => 'mobile', 'receiver_mobile_number' => '1234567890']` with valid setup | Success: transaction_id returned | Path 9 |

## 2. `AuthController::login()`

### Function Overview
This function authenticates users based on phone number and IPA address.

### Control Flow Paths
1. Missing required fields
2. User not found
3. User blocked
4. No IPA accounts (new user)
5. Invalid IPA
6. Successful login with valid IPA

### Test Cases

| Test Case ID | Input Parameters | Expected Output | Path Covered |
|--------------|------------------|-----------------|-------------|
| TC1 | `['phone_number' => '1234567890']` | Error: Missing required field: ipa_address | Path 1 |
| TC2 | `['phone_number' => '9999999999', 'ipa_address' => 'test@falsopay']` | Error: User not found | Path 2 |
| TC3 | `['phone_number' => '1234567890', 'ipa_address' => 'test@falsopay']` with user.status='blocked' | Error: Account blocked | Path 3 |
| TC4 | `['phone_number' => '1234567890', 'ipa_address' => 'test@falsopay']` with no IPA accounts | Success: user_token and user returned | Path 4 |
| TC5 | `['phone_number' => '1234567890', 'ipa_address' => 'wrong@falsopay']` with different IPA | Error: Invalid IPA | Path 5 |
| TC6 | `['phone_number' => '1234567890', 'ipa_address' => 'test@falsopay']` with matching IPA | Success: user_token and user returned | Path 6 |

## 3. `BankAccountController::linkAccountToService()`

### Function Overview
This function links a bank account to the FalsoPay service by verifying card details.

### Control Flow Paths
1. Missing required fields
2. Card not found
3. Bank user not found
4. Phone number mismatch
5. Incorrect PIN
6. Successful linking

### Test Cases

| Test Case ID | Input Parameters | Expected Output | Path Covered |
|--------------|------------------|-----------------|-------------|
| TC1 | `['card_number' => '1234567890123456']` | Error: Missing required field: phone_number | Path 1 |
| TC2 | `['card_number' => '9999999999999999', 'phone_number' => '1234567890', 'bank_id' => 1, 'card_pin' => '1234']` | Error: Card not found | Path 2 |
| TC3 | `['card_number' => '1234567890123456', 'phone_number' => '1234567890', 'bank_id' => 1, 'card_pin' => '1234']` with no bank user | Error: Bank user not found | Path 3 |
| TC4 | `['card_number' => '1234567890123456', 'phone_number' => '9999999999', 'bank_id' => 1, 'card_pin' => '1234']` with different phone | Error: Phone number does not match | Path 4 |
| TC5 | `['card_number' => '1234567890123456', 'phone_number' => '1234567890', 'bank_id' => 1, 'card_pin' => '9999']` | Error: Incorrect PIN | Path 5 |
| TC6 | `['card_number' => '1234567890123456', 'phone_number' => '1234567890', 'bank_id' => 1, 'card_pin' => '1234']` with valid setup | Success: bank accounts returned | Path 6 |

## 4. `User::createUser()`

### Function Overview
This function creates a new user in the system.

### Control Flow Paths
1. Valid user creation without default account
2. Valid user creation with default account
3. Database error during creation

### Test Cases

| Test Case ID | Input Parameters | Expected Output | Path Covered |
|--------------|------------------|-----------------|-------------|
| TC1 | `'John', 'Doe', 'john@example.com', '1234567890', null` | New user with null default_account | Path 1 |
| TC2 | `'Jane', 'Smith', 'jane@example.com', '0987654321', 123` | New user with default_account=123 | Path 2 |
| TC3 | `'Test', 'User', 'invalid-email', '1234567890', null` (with DB error simulation) | Exception: Failed to create user | Path 3 |

## 5. `BankAccount::getBalance()`

### Function Overview
This function retrieves the balance for a specific bank account.

### Control Flow Paths
1. Account exists
2. Account does not exist

### Test Cases

| Test Case ID | Input Parameters | Expected Output | Path Covered |
|--------------|------------------|-----------------|-------------|
| TC1 | `1, '12345678'` with existing account | Float balance value | Path 1 |
| TC2 | `1, '99999999'` with non-existing account | null | Path 2 |

## 6. `Transaction::createTransaction()`

### Function Overview
This function creates a new transaction record in the database.

### Control Flow Paths
1. Valid transaction with all fields
2. Valid transaction with minimal required fields

### Test Cases

| Test Case ID | Input Parameters | Expected Output | Path Covered |
|--------------|------------------|-----------------|-------------|
| TC1 | Complete transaction data array with all fields | Transaction ID (int) | Path 1 |
| TC2 | Minimal transaction data (only required fields) | Transaction ID (int) | Path 2 |

## Test Implementation Notes

1. For simulating database errors in TC3 of `User::createUser()`, consider using a mock database connection that throws an exception.
2. For testing blocked transactions in TC2 of `TransactionController::sendMoney()`, the system settings need to be modified before the test.
3. For testing insufficient balance in TC8 of `TransactionController::sendMoney()`, ensure the test account has a known balance below the transfer amount.

## Coverage Analysis

The test cases above provide 100% path coverage for the six functions analyzed. However, it's important to note that:

1. Some paths may have multiple conditions leading to them, which might require additional test cases for complete condition coverage.
2. Error handling paths for database connection failures are not explicitly tested in all functions.
3. Some functions interact with external services (like notification services) which should be mocked for isolated unit testing.
