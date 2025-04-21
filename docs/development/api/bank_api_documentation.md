# Banks API

This section defines routes and controllers for managing banks.

---

## Routes

### Namespace
`App\routes\api`

### Route Definitions
| HTTP Method | Endpoint | Controller Method | Description |
|-------------|----------------------------------|---------------------------|-------------------------------|
| GET | `/api/banks` | `getAllBanks` | Retrieve all banks |
| GET | `/api/banks/{id}` | `getBankById` | Retrieve a bank by ID |
| POST | `/api/banks` | `createBank` | Create a new bank |
| PUT | `/api/banks/{id}` | `updateBank` | Update a bank by ID |
| DELETE | `/api/banks/{id}` | `deleteBank` | Delete a bank by ID |

---

## Bank Controller

### Namespace
`App\controllers`

### Methods

#### `createBank(array $data): void`
- **Description**: Creates a new bank.
- **Required Parameters**:
    - `bank_name`, `bank_code`, `swift_code`
- **Response**: JSON success or error message.

#### `getAllBanks(): void`
- **Description**: Retrieves all banks.
- **Response**: JSON list of banks.

#### `getBankById(int $id): void`
- **Description**: Retrieves a specific bank by ID.
- **Response**: JSON bank details or error message.

#### `updateBank(int $id, array $data): void`
- **Description**: Updates bank details.
- **Required Parameters**:
    - `bank_name`, `bank_code`, `swift_code`
- **Response**: JSON success or error message.

#### `deleteBank(int $id): void`
- **Description**: Deletes a bank.
- **Response**: JSON success status.

---

## Utility Method

#### `json($data, int $code = 200): void`
- **Description**: Sends a JSON response with the given data and status code.
- **Response**: Outputs JSON response and terminates script.
