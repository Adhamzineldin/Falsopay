# Cards API

This section defines routes and controllers for managing cards.

---

## Routes

### Namespace
`App\routes\api`

### Route Definitions
| HTTP Method | Endpoint | Controller Method | Description |
|-------------|--------------------------------------------------|------------------------|-----------------------------|
| POST | `/api/cards` | `createCard` | Create a new card |
| GET | `/api/cards` | `getAllCards` | Retrieve all cards |
| GET | `/api/cards/bank/{bank_id}` | `getAllCardsByBank` | Retrieve all cards by bank ID |
| GET | `/api/cards/bank/{bank_id}/card/{card_number}` | `getCard` | Retrieve card by bank and card number |
| PUT | `/api/cards/bank/{bank_id}/card/{card_number}` | `updateCard` | Update a card by bank and card number |
| DELETE | `/api/cards/bank/{bank_id}/card/{card_number}` | `deleteCard` | Delete a card by bank and card number |

---

## Card Controller

### Namespace
`App\controllers`

### Methods

#### `createCard(array $data): void`
- **Description**: Creates a new card.
- **Required Parameters**:
    - `bank_id`, `card_number`, `expiration_date`, `cvv`, `card_type`, `pin`
- **Response**: JSON success or error message.

#### `getAllCards(): void`
- **Description**: Retrieves all cards.
- **Response**: JSON list of cards.

#### `getAllCardsByBank(int $bank_id): void`
- **Description**: Retrieves all cards associated with a specific bank.
- **Response**: JSON list of cards.

#### `getCard(int $bank_id, string $card_number): void`
- **Description**: Retrieves a specific card by bank ID and card number.
- **Response**: JSON card details or error message.

#### `updateCard(int $bank_id, string $card_number, array $data): void`
- **Description**: Updates card details.
- **Response**: JSON success or error message.

#### `deleteCard(int $bank_id, string $card_number): void`
- **Description**: Deletes a card.
- **Response**: JSON success status.

#### `verifyCardPin(array $data): void`
- **Description**: Verifies a card PIN.
- **Required Parameters**:
    - `bank_id`, `card_number`, `pin`
- **Response**: JSON validation result.

---

## Utility Method

#### `json($data, int $code = 200): void`
- **Description**: Sends a JSON response with the given data and status code.
- **Response**: Outputs JSON response and terminates script.
