# Instant Payment Addresses API

This section defines routes and controllers for managing Instant Payment Addresses (IPA).

---

## Routes

### Namespace
`App\routes\api`

### Route Definitions
| HTTP Method | Endpoint | Controller Method | Description |
|-------------|--------------------------------------------------|----------------------------------|-----------------------------|
| GET | `/api/ipa/by-ipa/{ipa_address}` | `getByIpaAddress` | Retrieve IPA by address |
| GET | `/api/ipa/by-bank/{bank_id}` | `getAllByBank` | Retrieve all IPAs by bank |
| GET | `/api/ipa/by-user/{user_id}` | `getAllByUserId` | Retrieve all IPAs by user ID |
| GET | `/api/ipa/by-id/{id}` | `getByIpaId` | Retrieve IPA by ID |
| DELETE | `/api/ipa/by-user/{user_id}` | `deleteAllByUserId` | Delete all IPAs associated with a user |
| GET | `/api/ipa` | `getAllInstantPaymentAddresses` | Retrieve all Instant Payment Addresses |
| POST | `/api/ipa` | `createInstantPaymentAddress` | Create a new IPA |
| GET | `/api/ipa/{bank_id}/{account_number}` | `getByBankAndAccount` | Retrieve IPA by bank and account number |
| PUT | `/api/ipa/{bank_id}/{account_number}` | `updateInstantPaymentAddress` | Update an IPA for a given bank account |
| DELETE | `/api/ipa/{bank_id}/{account_number}` | `deleteInstantPaymentAddress` | Delete an IPA for a given bank account |
| PUT | `/api/ipa/update-pin` | `updatePinForIpa` | Update PIN for an IPA |
| POST | `/api/ipa/verify-pin` | `verifyPinForIpa` | Verify PIN for an IPA |

---

## Instant Payment Address Controller

### Namespace
`App\controllers`

### Methods

#### `createInstantPaymentAddress(array $data): void`
- **Description**: Creates a new Instant Payment Address.
- **Required Parameters**:
    - `bank_id`, `account_number`, `ipa_address`, `user_id`, `pin`
- **Response**: JSON success or error message.

#### `getAllInstantPaymentAddresses(): void`
- **Description**: Retrieves all Instant Payment Addresses.
- **Response**: JSON list of IPAs.

#### `getAllByBank(int $bank_id): void`
- **Description**: Retrieves all IPAs associated with a specific bank.
- **Response**: JSON list of IPAs.

#### `getAllByUserId(int $user_id): void`
- **Description**: Retrieves all IPAs associated with a user.
- **Response**: JSON list of IPAs.

#### `getByBankAndAccount(int $bank_id, string $account_number): void`
- **Description**: Retrieves an IPA by bank ID and account number.
- **Response**: JSON IPA details or error message.

#### `getByIpaAddress(string $ipa_address): void`
- **Description**: Retrieves an IPA by address.
- **Response**: JSON IPA details or error message.

#### `getByIpaId(string $ipa_id): void`
- **Description**: Retrieves an IPA by ID.
- **Response**: JSON IPA details or error message.

#### `updateInstantPaymentAddress(int $bank_id, string $account_number, array $data): void`
- **Description**: Updates IPA details.
- **Response**: JSON success or error message.

#### `deleteInstantPaymentAddress(int $bank_id, string $account_number): void`
- **Description**: Deletes an IPA associated with a bank account.
- **Response**: JSON success status.

#### `deleteAllByUserId(int $user_id): void`
- **Description**: Deletes all IPAs associated with a user.
- **Response**: JSON success status.

#### `verifyPinForIpa(array $data): void`
- **Description**: Verifies a PIN for an IPA.
- **Required Parameters**:
    - `ipa_address`, `pin`
- **Response**: JSON validation result.

#### `updatePinForIpa(array $data): void`
- **Description**: Updates the PIN for an IPA.
- **Required Parameters**:
    - `ipa_address`, `new_pin`
- **Response**: JSON success status.

---

## Utility Method

#### `json($data, int $code = 200): void`
- **Description**: Sends a JSON response with the given data and status code.
- **Response**: Outputs JSON response and terminates script.
