# Bank Accounts API

This section defines routes and controllers for managing bank accounts.

---

## Routes

### Namespace
`App\routes\api`

### Route Definitions
| HTTP Method | Endpoint | Controller Method | Description |
|-------------|---------------------------------|----------------------------------|-----------------------------|
| GET | `/api/bank-accounts/iban/{iban}` | `getByIBAN` | Retrieve bank account by IBAN |
| GET | `/api/bank-accounts/user/{bank_user_id}/bank/{bank_id}` | `getByUserAndBank` | Retrieve accounts by user and bank |
| GET | `/api/bank-accounts/user/{bank_user_id}` | `getByUserId` | Retrieve accounts by user ID |
| GET | `/api/bank-accounts/{bank_id}/{account_number}/balance` | `getBalance` | Get balance of an account |
| PATCH | `/api/bank-accounts/{bank_id}/{account_number}/add-balance` | `addBalance` | Add balance to an account |
| PATCH | `/api/bank-accounts/{bank_id}/{account_number}/subtract-balance` | `subtractBalance` | Subtract balance from an account |
| GET | `/api/bank-accounts/{bank_id}/{account_number}` | `getBankAccount` | Get details of a bank account |
| PUT | `/api/bank-accounts/{bank_id}/{account_number}` | `updateBankAccount` | Update bank account details |
| DELETE | `/api/bank-accounts/{bank_id}/{account_number}` | `deleteBankAccount` | Delete a bank account |
| GET | `/api/bank-accounts` | `getAllBankAccounts` | Get all bank accounts |
| POST | `/api/bank-accounts` | `createBankAccount` | Create a new bank account |
| POST | `/api/bank-accounts/link` | `linkAccountToService` | Link bank account to service |

---

## Bank Account Controller

### Namespace
`App\controllers`

### Methods

#### `createBankAccount(array $data): void`
- **Description**: Creates a new bank account.
- **Required Parameters**:
    - `bank_id`, `account_number`, `bank_user_id`, `iban`, `status`, `type`, `balance`
- **Response**: JSON success or error message.

#### `getAllBankAccounts(): void`
- **Description**: Retrieves all bank accounts.
- **Response**: JSON list of bank accounts.

#### `getBankAccount(int $bankId, string $accountNumber): void`
- **Description**: Retrieves details of a specific bank account.
- **Response**: JSON account details or error message.

#### `updateBankAccount(int $bankId, string $accountNumber, array $data): void`
- **Description**: Updates bank account details.
- **Response**: JSON success status.

#### `deleteBankAccount(int $bankId, string $accountNumber): void`
- **Description**: Deletes a bank account.
- **Response**: JSON success status.

#### `getByIBAN(string $iban): void`
- **Description**: Retrieves a bank account by IBAN.
- **Response**: JSON account details or error message.

#### `getByUserId(int $bankUserId): void`
- **Description**: Retrieves all accounts associated with a user.
- **Response**: JSON list of accounts.

#### `getByUserAndBank(int $bankUserId, int $bankId): void`
- **Description**: Retrieves accounts by user and bank.
- **Response**: JSON list of accounts.

#### `addBalance(int $bankId, string $accountNumber, array $data): void`
- **Description**: Adds balance to an account.
- **Required Parameter**:
    - `amount`
- **Response**: JSON success or error message.

#### `subtractBalance(int $bankId, string $accountNumber, array $data): void`
- **Description**: Subtracts balance from an account.
- **Required Parameter**:
    - `amount`
- **Response**: JSON success or error message.

#### `getBalance(int $bankId, string $accountNumber): void`
- **Description**: Retrieves the balance of an account.
- **Response**: JSON balance or error message.

#### `linkAccountToService(array $data)`
- **Description**: Links a bank account to a service.
- **Required Parameters**:
    - `card_number`, `phone_number`, `bank_id`, `card_pin`
- **Response**: JSON list of linked accounts.

---

## Utility Method

#### `json($data, int $code = 200): void`
- **Description**: Sends a JSON response with the given data and status code.
- **Response**: Outputs JSON response and terminates script.
