# FalsoPay White-Box Testing Report

This document details the white-box testing approach for the FalsoPay system, focusing on unit tests for key functions to ensure path coverage and code correctness.

## Testing Methodology

White-box testing examines the internal structures of the code, ensuring that all execution paths are tested. For each function, we:

1. Identify all possible execution paths
2. Design test cases to cover each path
3. Implement unit tests using PHPUnit
4. Verify expected behavior for each path

## Test Coverage Goals

- **Statement Coverage**: 90%+ of all statements executed during tests
- **Branch Coverage**: 85%+ of all branches (if/else, switch cases) executed
- **Path Coverage**: Test all independent paths through each function
- **Function Coverage**: 95%+ of all functions tested

## Function 1: AuthController::login

### Function Description
Authenticates users based on phone number and PIN.

### Code Analysis
```php
public static function login(array $data): void
{
    $userModel = new User();
    $authMiddleware = new AuthMiddleware();
    $ipaModel = new InstantPaymentAddress();

    $fields = ['phone_number', 'pin'];

    foreach ($fields as $field) {
        if (!isset($data[$field])) {
            self::json(['error' => "Missing required field: $field"], 400);
        }
    }

    $user = $userModel->getUserByPhoneNumber($data['phone_number']);

    if (!$user) {
        self::json(['error' => 'User not found'], 404);
    }
    
    if ($user['status'] === 'blocked') {
        self::json(['error' => 'Your account has been blocked. Please contact support for assistance.'], 403);
    }

    $ipa_accounts = $ipaModel->getAllByUserId($user['user_id']);
    
    if (empty($ipa_accounts)) {
        self::json(['error' => 'No IPA accounts found for this user'], 401);
    } else {
        $validPin = false;
        foreach ($ipa_accounts as $ipa_account) {
            if ($ipaModel->verifyPin($user['user_id'], $ipa_account['ipa_address'], $data['pin'])) {
                $validPin = true;
                break;
            }
        }

        if ($validPin) {
            $user_token = $authMiddleware->generateToken($user['user_id']);
            self::json(['success' => true, 'user_token' => $user_token, 'user' => $user]);
        } else {
            self::json(['error' => 'Invalid PIN'], 401);
        }
    }
}
```

### Path Analysis
1. Missing required field (phone_number or pin)
2. User not found
3. User is blocked
4. No IPA accounts found for user
5. PIN doesn't match any IPA account
6. PIN matches an IPA account

### Test Cases

| Test Case ID | Path | Input | Expected Output | Status |
|-------------|------|-------|----------------|--------|
| TC-AL-01 | Missing phone_number | `['pin' => '1234']` | Error: Missing required field | Pass |
| TC-AL-02 | Missing pin | `['phone_number' => '1234567890']` | Error: Missing required field | Pass |
| TC-AL-03 | User not found | `['phone_number' => '9999999999', 'pin' => '1234']` | Error: User not found | Pass |
| TC-AL-04 | User is blocked | `['phone_number' => '1234567890', 'pin' => '1234']` (user with status='blocked') | Error: Account blocked | Pass |
| TC-AL-05 | No IPA accounts | `['phone_number' => '1234567890', 'pin' => '1234']` (user with no IPAs) | Error: No IPA accounts found | Pass |
| TC-AL-06 | Invalid PIN | `['phone_number' => '1234567890', 'pin' => '9999']` | Error: Invalid PIN | Pass |
| TC-AL-07 | Valid PIN | `['phone_number' => '1234567890', 'pin' => '1234']` | Success with token | Pass |

## Function 2: TransactionController::sendMoney

### Function Description
Processes money transfers between users.

### Code Analysis
```php
public function sendMoney(array $data): void
{
    // Validate required fields
    $requiredFields = ['sender_id', 'receiver_id', 'amount', 'transfer_method'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field])) {
            $this->json(['error' => "Missing required field: $field"], 400);
        }
    }
    
    // Validate amount
    if (!is_numeric($data['amount']) || $data['amount'] <= 0) {
        $this->json(['error' => 'Invalid amount'], 400);
    }
    
    // Check if system allows transactions
    $systemModel = new SystemSettings();
    $settings = $systemModel->getSettings();
    if ($settings['block_transactions']) {
        $this->json(['error' => 'Transactions are currently disabled'], 503);
    }
    
    // Check sender exists
    $userModel = new User();
    $sender = $userModel->getUserById($data['sender_id']);
    if (!$sender) {
        $this->json(['error' => 'Sender not found'], 404);
    }
    
    // Check if sender is blocked
    if ($sender['status'] === 'blocked') {
        $this->json(['error' => 'Sender account is blocked'], 403);
    }
    
    // Check receiver exists
    $receiver = $userModel->getUserById($data['receiver_id']);
    if (!$receiver) {
        $this->json(['error' => 'Receiver not found'], 404);
    }
    
    // Check if receiver is blocked
    if ($receiver['status'] === 'blocked') {
        $this->json(['error' => 'Receiver account is blocked'], 403);
    }
    
    // Process based on transfer method
    switch ($data['transfer_method']) {
        case 'ipa':
            $this->processIPATransfer($data, $sender, $receiver);
            break;
        case 'bank':
            $this->processBankTransfer($data, $sender, $receiver);
            break;
        case 'phone':
            $this->processPhoneTransfer($data, $sender, $receiver);
            break;
        default:
            $this->json(['error' => 'Invalid transfer method'], 400);
    }
}
```

### Path Analysis
1. Missing required field
2. Invalid amount
3. System blocks transactions
4. Sender not found
5. Sender is blocked
6. Receiver not found
7. Receiver is blocked
8. Transfer method: IPA
9. Transfer method: Bank
10. Transfer method: Phone
11. Invalid transfer method

### Test Cases

| Test Case ID | Path | Input | Expected Output | Status |
|-------------|------|-------|----------------|--------|
| TC-SM-01 | Missing field | `['sender_id' => 1, 'receiver_id' => 2, 'amount' => 100]` | Error: Missing transfer_method | Pass |
| TC-SM-02 | Invalid amount | `['sender_id' => 1, 'receiver_id' => 2, 'amount' => -50, 'transfer_method' => 'ipa']` | Error: Invalid amount | Pass |
| TC-SM-03 | System blocks | `['sender_id' => 1, 'receiver_id' => 2, 'amount' => 100, 'transfer_method' => 'ipa']` (with block_transactions=true) | Error: Transactions disabled | Pass |
| TC-SM-04 | Sender not found | `['sender_id' => 999, 'receiver_id' => 2, 'amount' => 100, 'transfer_method' => 'ipa']` | Error: Sender not found | Pass |
| TC-SM-05 | Sender blocked | `['sender_id' => 3, 'receiver_id' => 2, 'amount' => 100, 'transfer_method' => 'ipa']` (sender with status='blocked') | Error: Sender blocked | Pass |
| TC-SM-06 | Receiver not found | `['sender_id' => 1, 'receiver_id' => 999, 'amount' => 100, 'transfer_method' => 'ipa']` | Error: Receiver not found | Pass |
| TC-SM-07 | Receiver blocked | `['sender_id' => 1, 'receiver_id' => 4, 'amount' => 100, 'transfer_method' => 'ipa']` (receiver with status='blocked') | Error: Receiver blocked | Pass |
| TC-SM-08 | IPA transfer | `['sender_id' => 1, 'receiver_id' => 2, 'amount' => 100, 'transfer_method' => 'ipa']` | Success | Pass |
| TC-SM-09 | Bank transfer | `['sender_id' => 1, 'receiver_id' => 2, 'amount' => 100, 'transfer_method' => 'bank']` | Success | Pass |
| TC-SM-10 | Phone transfer | `['sender_id' => 1, 'receiver_id' => 2, 'amount' => 100, 'transfer_method' => 'phone']` | Success | Pass |
| TC-SM-11 | Invalid method | `['sender_id' => 1, 'receiver_id' => 2, 'amount' => 100, 'transfer_method' => 'invalid']` | Error: Invalid method | Pass |

## Function 3: BankAccountController::linkAccountToService

### Function Description
Links a bank account to the FalsoPay service using card details.

### Code Analysis
```php
public static function linkAccountToService(array $data) {
    $required = ['card_number', 'phone_number', 'bank_id', 'card_pin'];
    foreach ($required as $field) {
        if (!isset($data[$field])) {
            self::json(['error' => "Missing required field: $field"], 400);
        }
    }
    
    $cardModel = new Card();
    $bankUserModel = new BankUser();
    $bankAccountModel = new BankAccount();
    
    $card = $cardModel->getByBankAndCardNumber($data['bank_id'], $data['card_number']);
    
    if (!$card) {
        self::json(['error' => 'Card not found'], 404);
    }
    
    $bankUser = $bankUserModel->getById($card['bank_user_id']);
    
    if (!$bankUser) {
        self::json(['error' => 'Bank user not found'], 404);
    }
    
    if ($bankUser['phone_number'] !== $data['phone_number']) {
        self::json(['error' => 'Phone number does not match'], 403);
    }
    
    $isCorrectPin = $cardModel->verifyPin($data['bank_id'], $data['card_number'], $data['card_pin']);
    
    if (!$isCorrectPin) {
        self::json(['error' => 'Incorrect PIN'], 403);
    }
    
    $bankAccounts = $bankAccountModel->getAllByUserAndBankId($card['bank_user_id'], $data['bank_id']);
    
    self::json($bankAccounts);
}
```

### Path Analysis
1. Missing required field
2. Card not found
3. Bank user not found
4. Phone number doesn't match
5. Incorrect PIN
6. Success - return bank accounts

### Test Cases

| Test Case ID | Path | Input | Expected Output | Status |
|-------------|------|-------|----------------|--------|
| TC-LA-01 | Missing field | `['phone_number' => '1234567890', 'bank_id' => 1, 'card_pin' => '1234']` | Error: Missing card_number | Pass |
| TC-LA-02 | Card not found | `['card_number' => '9999999999999999', 'phone_number' => '1234567890', 'bank_id' => 1, 'card_pin' => '1234']` | Error: Card not found | Pass |
| TC-LA-03 | Bank user not found | `['card_number' => '1234567890123456', 'phone_number' => '1234567890', 'bank_id' => 1, 'card_pin' => '1234']` (with invalid bank_user_id) | Error: Bank user not found | Pass |
| TC-LA-04 | Phone mismatch | `['card_number' => '1234567890123456', 'phone_number' => '9999999999', 'bank_id' => 1, 'card_pin' => '1234']` | Error: Phone number mismatch | Pass |
| TC-LA-05 | Incorrect PIN | `['card_number' => '1234567890123456', 'phone_number' => '1234567890', 'bank_id' => 1, 'card_pin' => '9999']` | Error: Incorrect PIN | Pass |
| TC-LA-06 | Success | `['card_number' => '1234567890123456', 'phone_number' => '1234567890', 'bank_id' => 1, 'card_pin' => '1234']` | Bank accounts array | Pass |

## Function 4: User::updateUser

### Function Description
Updates user information in the database.

### Code Analysis
```php
public function updateUser(int $id, array $fields): bool
{
    // Validate if the $fields array has at least one field to update
    if (empty($fields)) {
        throw new Exception("No fields provided to update.");
    }

    $set = [];
    $params = ['id' => $id];

    // Loop through the $fields and create the SET clause
    foreach ($fields as $key => $value) {
        // Check if the column exists in the database before proceeding
        if (!in_array($key, ['first_name', 'last_name', 'email', 'phone_number', 'default_account', 'role'])) {
            throw new Exception("Invalid column name: $key");
        }

        $set[] = "$key = :$key";
        $params[$key] = $value;
    }

    // Create the SQL query
    $sql = "UPDATE users SET " . implode(', ', $set) . " WHERE user_id = :id";
    
    // Prepare and execute the query
    $stmt = $this->pdo->prepare($sql);
    return $stmt->execute($params);
}
```

### Path Analysis
1. Empty fields array
2. Invalid column name
3. Valid update with one field
4. Valid update with multiple fields

### Test Cases

| Test Case ID | Path | Input | Expected Output | Status |
|-------------|------|-------|----------------|--------|
| TC-UU-01 | Empty fields | `id = 1, fields = []` | Exception: No fields provided | Pass |
| TC-UU-02 | Invalid column | `id = 1, fields = ['invalid_column' => 'value']` | Exception: Invalid column name | Pass |
| TC-UU-03 | Single field | `id = 1, fields = ['first_name' => 'John']` | true (successful update) | Pass |
| TC-UU-04 | Multiple fields | `id = 1, fields = ['first_name' => 'John', 'last_name' => 'Doe']` | true (successful update) | Pass |

## Function 5: Transaction::createTransaction

### Function Description
Creates a new transaction record in the database.

### Code Analysis
```php
public function createTransaction(array $data): int {
    // Exact fields from your schema (excluding auto-increment + default timestamp)
    $fields = [
        'sender_user_id',
        'receiver_user_id',
        'sender_name',
        'receiver_name',
        'amount',
        'sender_bank_id',
        'receiver_bank_id',
        'sender_account_number',
        'receiver_account_number',
        'sender_ipa_address',
        'receiver_ipa_address',
        'receiver_phone',
        'receiver_card',
        'receiver_iban',
        'transfer_method'
    ];

    // Prepare SQL
    $columns = implode(', ', $fields);
    $placeholders = implode(', ', array_map(fn($f) => ":$f", $fields));

    $sql = "INSERT INTO transactions ($columns) VALUES ($placeholders)";
    $stmt = $this->pdo->prepare($sql);

    // Build data array for binding
    $filteredData = array_intersect_key($data, array_flip($fields));

    // Ensure all fields exist (default to null)
    foreach ($fields as $field) {
        if (!array_key_exists($field, $filteredData)) {
            $filteredData[$field] = null;
        }
    }

    $stmt->execute($filteredData);
    return (int)$this->pdo->lastInsertId();
}
```

### Path Analysis
1. All required fields provided
2. Some fields missing (defaulted to null)

### Test Cases

| Test Case ID | Path | Input | Expected Output | Status |
|-------------|------|-------|----------------|--------|
| TC-CT-01 | All fields | Complete transaction data | Transaction ID > 0 | Pass |
| TC-CT-02 | Minimal fields | `['sender_user_id' => 1, 'receiver_user_id' => 2, 'amount' => 100, 'transfer_method' => 'ipa']` | Transaction ID > 0 | Pass |

## Function 6: InstantPaymentAddress::verifyPin

### Function Description
Verifies the PIN for an IPA address.

### Code Analysis
```php
public function verifyPin(int $userId, string $ipaAddress, string $pin): bool
{
    $sql = "SELECT pin_hash FROM instant_payment_addresses 
            WHERE user_id = :user_id AND ipa_address = :ipa_address";
    
    $stmt = $this->pdo->prepare($sql);
    $stmt->execute([
        'user_id' => $userId,
        'ipa_address' => $ipaAddress
    ]);
    
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$result) {
        return false;
    }
    
    return password_verify($pin, $result['pin_hash']);
}
```

### Path Analysis
1. IPA not found
2. PIN doesn't match
3. PIN matches

### Test Cases

| Test Case ID | Path | Input | Expected Output | Status |
|-------------|------|-------|----------------|--------|
| TC-VP-01 | IPA not found | `userId = 999, ipaAddress = 'test@ipa', pin = '1234'` | false | Pass |
| TC-VP-02 | PIN mismatch | `userId = 1, ipaAddress = 'test@ipa', pin = '9999'` | false | Pass |
| TC-VP-03 | PIN matches | `userId = 1, ipaAddress = 'test@ipa', pin = '1234'` | true | Pass |

## Test Implementation

The tests are implemented using PHPUnit and follow this structure:

```php
class UserTest extends TestCase
{
    protected $pdo;
    protected $user;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        // Create mock PDO and PDOStatement
        $this->pdo = Mockery::mock(PDO::class);
        $this->user = $this->createPartialMock(User::class, ['__construct']);
        
        // Set the mocked PDO using reflection
        $reflection = new \ReflectionClass($this->user);
        $property = $reflection->getProperty('pdo');
        $property->setAccessible(true);
        $property->setValue($this->user, $this->pdo);
    }
    
    public function testUpdateUserWithEmptyFields()
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessage("No fields provided to update.");
        
        $this->user->updateUser(1, []);
    }
    
    // Additional tests...
}
```

## Test Coverage Summary

| Function | Total Paths | Paths Tested | Coverage |
|----------|-------------|-------------|----------|
| AuthController::login | 6 | 6 | 100% |
| TransactionController::sendMoney | 11 | 11 | 100% |
| BankAccountController::linkAccountToService | 6 | 6 | 100% |
| User::updateUser | 4 | 4 | 100% |
| Transaction::createTransaction | 2 | 2 | 100% |
| InstantPaymentAddress::verifyPin | 3 | 3 | 100% |

## Conclusion

The white-box testing approach has successfully covered all execution paths in the tested functions. By designing test cases to exercise each path, we have verified that the code behaves as expected in all scenarios, including error handling and edge cases.

The unit tests provide a solid foundation for regression testing, ensuring that future changes don't break existing functionality. Regular execution of these tests as part of the CI/CD pipeline will help maintain code quality and identify issues early in the development process.
