# Software Quality Factors Analysis

## Non-Independent Software Quality Factors

In the FalsoPay system, several pairs of software quality factors demonstrate interdependencies:

### 1. Security and Usability

These quality factors show a clear trade-off relationship in our system:

- In the authentication flow (`AuthController.php`), there's a tradeoff between security (requiring IPA verification) and usability (ease of login).
- Enhancing security with PIN verification for transactions (`TransactionController.php`) adds friction to the user experience.
- Two-factor authentication improves security but requires additional steps from users.

**Example from code:**
```php
// From AuthController::login()
if (empty($ipa_accounts)) {
    $user_token = $authMiddleware->generateToken($user['user_id']);
    self::json(['success' => true, 'user_token' => $user_token, 'user' => $user]);
} else {
    $ipaExists = false;
    foreach ($ipa_accounts as $ipa_account) {
        // Compare IPA addresses in lowercase
        if (strtolower($ipa_account['ipa_address']) === strtolower($data['ipa_address'])) {
            $ipaExists = true;
            break;
        }
    }

    if ($ipaExists) {
        $user_token = $authMiddleware->generateToken($user['user_id']);
        self::json(['success' => true, 'user_token' => $user_token, 'user' => $user]);
    } else {
        self::json(['error' => 'Invalid IPA'], 401);
    }
}
```

### 2. Performance and Reliability

These quality factors demonstrate interdependence in transaction processing:

- The transaction processing system (`TransactionController.php`) shows interdependence between performance (speed of transactions) and reliability (ensuring proper balance checks, validations).
- Implementing transaction checks (like system settings verification, balance checks) adds reliability but impacts performance.

**Example from code:**
```php
// From TransactionController::sendMoney()
// Check system settings for transaction status
$systemSettings = (new SystemSettings())->getSettings();

// Check if transactions are blocked
if (isset($systemSettings['transactions_blocked']) && $systemSettings['transactions_blocked']) {
    $message = $systemSettings['block_message'] ?: 'Transactions are temporarily disabled by the administrator';
    self::json([
        'error' => $message,
        'code' => 'TRANSACTIONS_BLOCKED'
    ], 403);
    return;
}

// Check transfer limit if enabled
if (isset($systemSettings['transfer_limit_enabled']) && 
    $systemSettings['transfer_limit_enabled'] && 
    isset($data['amount']) && 
    $data['amount'] > $systemSettings['transfer_limit_amount']) {
    
    self::json([
        'error' => "Transaction amount exceeds the current transfer limit of {$systemSettings['transfer_limit_amount']}",
        'code' => 'TRANSFER_LIMIT_EXCEEDED',
        'limit' => $systemSettings['transfer_limit_amount']
    ], 403);
    return;
}
```

### 3. Maintainability and Efficiency

The modular architecture improves maintainability but affects efficiency:

- The modular architecture with separate controllers and models improves maintainability but introduces additional method calls and object instantiations that can impact efficiency.
- For example, in `TransactionController.php`, multiple model instances are created (`$transactionModel`, `$socketService`, `$bankAccountModel`, etc.) which improves code organization but adds overhead.

**Example from code:**
```php
// From TransactionController::sendMoney()
$transactionModel = new Transaction();
$socketService = new SocketService();
$bankAccountModel = new BankAccount();
$cardModel = new Card();
$ipaModel = new InstantPaymentAddress();
$userModel = new User();
```

### 4. Portability and Security

Security features are often tightly coupled with specific implementations:

- The system's security features (like PIN verification) are tightly coupled with specific database structures, making it harder to port to different environments without compromising security.
- The authentication system relies on specific database schemas and token generation mechanisms.

**Example from code:**
```php
// From InstantPaymentAddress model (implied)
if (!$ipaModel->verifyPin($senderIpaAddress, $data['pin'])) {
    self::json(['error' => 'Invalid PIN'], 401);
}
```

## Conclusion

These examples demonstrate how improving one quality factor often requires compromising another. System architects and developers must carefully balance these trade-offs based on the specific requirements and priorities of the FalsoPay payment system. 