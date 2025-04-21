# Bank Users API

This section defines routes and controllers for managing bank users.

---

## Routes

### Namespace
`App\routes\api`

### Route Definitions
| HTTP Method | Endpoint | Controller Method | Description |
|-------------|----------------------------------|------------------------|-----------------------------|
| POST | `/api/bank-users` | `createBankUser` | Create a new bank user |
| GET | `/api/bank-users` | `getAllBankUsers` | Retrieve all bank users |
| GET | `/api/bank-users/{id}` | `getBankUser` | Retrieve a bank user by ID |
| PUT | `/api/bank-users/{id}` | `updateBankUser` | Update a bank user by ID |
| DELETE | `/api/bank-users/{id}` | `deleteBankUser` | Delete a bank user by ID |

---

## Bank User Controller

### Namespace
`App\controllers`

### Methods

#### `createBankUser(array $data): void`
- **Description**: Creates a new bank user.
- **Required Parameters**:
    - `first_name`, `last_name`, `email`, `phone_number`, `date_of_birth`
- **Response**: JSON success or error message.

#### `getAllBankUsers(): void`
- **Description**: Retrieves all bank users.
- **Response**: JSON list of users.

#### `getBankUser(int $id): void`
- **Description**: Retrieves a specific bank user by ID.
- **Response**: JSON user details or error message.

#### `updateBankUser(int $id, array $data): void`
- **Description**: Updates bank user details.
- **Response**: JSON success or error message.

#### `deleteBankUser(int $id): void`
- **Description**: Deletes a bank user.
- **Response**: JSON success status.

---

## Utility Method

#### `json($data, int $code = 200): void`
- **Description**: Sends a JSON response with the given data and status code.
- **Response**: Outputs JSON response and terminates script.
