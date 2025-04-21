# Auth Routes

This file defines the routes related to authentication.

## Namespace
`App\routes\auth`

## Routes
| HTTP Method | Endpoint             | Controller Method                          | Middleware |
|-------------|----------------------|-------------------------------------------|------------|
| POST        | `/api/send-msg`      | `AuthController::sendMsg`                 | No Token   |
| POST        | `/api/check-phone`   | `AuthController::checkIfUserWithPhoneNumberExists` | No Token      |
| POST        | `/api/create-user`   | `AuthController::createUser`              | No Token      |
| POST        | `/api/login`         | `AuthController::login`                   | No Token      |
| DELETE      | `/api/delete-account`| `AuthController::deleteAccount`           | No Token      |

---

# Auth Controller

This file contains the logic for handling authentication-related requests.

## Namespace
`App\controllers`

## Methods

### `sendMsg(array $data): void`
- **Description**: Sends a message using the WhatsApp API.
- **Parameters**:
    - `recipient`: The recipient's phone number.
    - `message`: The message to be sent.
- **Response**: Outputs success or error message.

### `checkIfUserWithPhoneNumberExists(array $data): void`
- **Description**: Checks if a user exists with the given phone number.
- **Parameters**:
    - `phone_number`: The phone number to check.
- **Response**: JSON response indicating whether the user exists.

### `createUser(array $data): void`
- **Description**: Creates a new user.
- **Parameters**:
    - `first_name`: User's first name.
    - `last_name`: User's last name.
    - `phone_number`: User's phone number.
    - `email`: User's email address.
- **Response**: JSON response with success or error message.

### `login(array $data): void`
- **Description**: Logs in a user.
- **Parameters**:
    - `phone_number`: User's phone number.
    - `ipa`: Instant Payment Address (IPA).
- **Response**: JSON response with user token or error message.

### `deleteAccount(array $data): void`
- **Description**: Deletes a user account.
- **Parameters**:
    - `phone_number`: User's phone number.
- **Response**: JSON response with success or error message.

---

## Utility Method

### `json($data, int $code = 200): void`
- **Description**: Sends a JSON response with the given data and HTTP status code.
- **Parameters**:
    - `data`: The data to send in the response.
    - `code`: HTTP status code (default is 200).
- **Response**: Outputs JSON and terminates the script.