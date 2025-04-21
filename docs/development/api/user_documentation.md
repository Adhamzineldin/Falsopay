# Users API

This section defines routes and controllers for managing users.

---

## Routes

### Namespace
`App\routes\api`

### Route Definitions
| HTTP Method | Endpoint | Controller Method | Description |
|-------------|--------------------------------------------|------------------------------------------|-------------------------------------------|
| GET | `/api/users` | `getAllUsers` | Retrieve all users |
| GET | `/api/users/{id}` | `getUserById` | Retrieve a user by ID |
| POST | `/api/users` | `createUser` | Create a new user |
| PUT | `/api/users/{id}` | `updateUser` | Update user details |
| DELETE | `/api/users/{id}` | `deleteUser` | Delete a user |
| GET | `/api/users/email/{email}` | `getUserByEmail` | Retrieve user by email |
| GET | `/api/users/number/{number}` | `getUserByPhoneNumber` | Retrieve user by phone number |
| GET | `/api/users/exists/{phone_number}` | `checkUserExistsByPhoneNumber` | Check if a user exists by phone number |
| GET | `/api/users/{id}/default-account` | `getDefaultAccount` | Get default account for a user |
| PUT | `/api/users/{id}/default-account` | `setDefaultAccount` | Set default account for a user |

---

## User Controller

### Namespace
`App\controllers`

### Methods

#### `createUser(array $data): void`
- **Description**: Creates a new user.
- **Required Parameters**:
    - `first_name`, `last_name`, `email`, `phone_number`, `default_account`
- **Response**: JSON success or error message.

#### `getAllUsers(): void`
- **Description**: Retrieves all users.
- **Response**: JSON list of users.

#### `getUserById(int $id): void`
- **Description**: Retrieves a user by ID.
- **Response**: JSON user details or error message.

#### `getUserByPhoneNumber(string $phone_number): void`
- **Description**: Retrieves a user by phone number.
- **Response**: JSON user details or error message.

#### `getUserByEmail(string $email): void`
- **Description**: Retrieves a user by email.
- **Response**: JSON user details or error message.

#### `updateUser(int $id, array $data): void`
- **Description**: Updates user details.
- **Response**: JSON success or error message.

#### `deleteUser(int $id): void`
- **Description**: Deletes a user.
- **Response**: JSON success status.

#### `checkUserExistsByPhoneNumber(string $phone_number): void`
- **Description**: Checks if a user exists by phone number.
- **Response**: JSON exists status.

#### `setDefaultAccount(int $userId, array $data): void`
- **Description**: Sets the default account for a user.
- **Required Parameters**:
    - `accountId`
- **Response**: JSON success or error message.

#### `getDefaultAccount(int $userId): void`
- **Description**: Retrieves the default account for a user.
- **Response**: JSON default account ID or error message.

---

## Utility Method

#### `json($data, int $code = 200): void`
- **Description**: Sends a JSON response with the given data and status code.
- **Response**: Outputs JSON response and terminates script.
