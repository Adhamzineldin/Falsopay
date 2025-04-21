# Transactions API

This section defines routes for handling transactions.

---

## Routes

### Namespace
`App\routes\api`

### Route Definitions
| HTTP Method | Endpoint | Controller Method | Description |
|-------------|----------------------------------|------------------------------|----------------------------|
| POST | `/api/transactions` | `createTransaction` | Create a new transaction |
| GET | `/api/transactions` | `getAllTransactions` | Retrieve all transactions |
| GET | `/api/transactions/by-user/{user_id}` | `getTransactionsByUserId` | Retrieve transactions by user ID |
| POST | `/api/transactions/send-money` | `sendMoney` | Process sending money transaction |

---

## Transaction Controller

### Namespace
`App\controllers`

### Methods

#### `createTransaction(array $data): void`
- **Description**: Creates a new transaction.
- **Required Parameters**:
    - `sender_id`, `receiver_id`, `amount`, `currency`, `status`
- **Response**: JSON success or error message.

#### `getAllTransactions(): void`
- **Description**: Retrieves all transactions.
- **Response**: JSON list of transactions.

#### `getTransactionsByUserId(int $user_id): void`
- **Description**: Retrieves all transactions linked to a user.
- **Response**: JSON list of transactions.

#### `sendMoney(array $data): void`
- **Description**: Processes a money transfer between users.
- **Required Parameters**:
    - `sender_id`, `receiver_id`, `amount`, `currency`
- **Response**: JSON success or failure status.

---

## Utility Method

#### `json($data, int $code = 200): void`
- **Description**: Sends a JSON response with the given data and status code.
- **Response**: Outputs JSON response and terminates script.
