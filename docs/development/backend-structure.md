# 🛠️ Backend Structure - FalsoPay

## 🧱 Overview

The backend is a stateless REST + WebSocket architecture built in pure PHP (no frameworks like Laravel).  
It supports token-based auth, real-time WebSocket events, and MySQL for persistence.

---

## 📁 Folder Structure

```
/backend
│
├── app/
│   ├── controllers/         # Static controllers (e.g. UserController.php, AuthController.php)
│   ├── models/              # DB access logic (e.g. User.php, Transaction.php)
│   ├── middleware/          # Auth, logging, validation middlewares
│   ├── routes/              # Route groups (e.g. auth/, user/, transaction/)
│
├── config/
│   ├── database.php         # DB credentials + PDO instance
│   ├── websocket.php        # WS settings (port, origin)
│
├── public/
│   ├── index.html            # Default fallback route (404 or docs)
│   ├── 401.html              
│   ├── 404.html
│
├── core/
│   ├── Router.php           # Lightweight router
│   ├── WebSocketServer.php  # Custom WebSocket server logic
│   ├── Logger.php           # Central logging utility
│
├── utils/
│   ├── Validator.php        # Input validation methods
│   ├── JWT.php              # Token generation + parsing
│
├── server.php              # Main entry point (e.g. Apache/Nginx routes here)
├── ws-server.php           # WebSocket server entry
├── .env                    # Sensitive config (DB, secret keys)
└── composer.json           # Autoloading, future dependency mgmt
```

---

## 🗄️ MySQL Database

- **Relational DB** (MySQL 8.x)
- UTF-8 collation, InnoDB engine

### Key Tables:

- `users`: Profile info, contact, metadata
- `instant_payment_addresses`: IPA-to-user mapping
- `transactions`: Records of money transfers
- `cards`: Debit & prepaid card data
- `sessions`: Active tokens
- `logs`: Admin/system activity
- `messages`: WS-based chat/messages

---

## 🔌 API Routing

Each route file (e.g. `routes/auth/AuthRoutes.php`) defines endpoints like:

```php
$router->add('POST', '/api/login', [AuthController::class, 'login']);
$router->add('DELETE', '/api/delete-account', [AuthController::class, 'deleteAccount']);
```

Auto-wired into `server.php` based on file structure.

### 🔐 Auth & Security

- JWT-based stateless authentication
- Token expiration and refresh logic in `AuthMiddleware.php`
- All protected routes pass through:

```php
$router->add('GET', '/api/protected', [Controller::class, 'fn'], [AuthMiddleware::class]);
```

- Sanitization via `Validator.php`
- SQL via **prepared statements** in models

---

## 📡 WebSockets

Custom WebSocket server (`ws-server.php`) using native PHP sockets:

- Listens on port `8080`
- Auth handshake with JWT
- Rooms for:
    - Transactions (real-time confirmations)
    - Chat (support messages)
    - Notifications (payment received)

Example:

```php
$ws = new WebSocketServer('0.0.0.0', 8080);
$ws->start(); // Handles clients in while(true)
```

---

## 🔁 Sample Request Flow

1. User logs in
2. `/api/login` → JWT returned
3. Client connects to WS
4. Sends JWT for verification
5. Initiates transfer
6. `/api/transfer` → DB insert + real-time `notify()` to receiver
7. Receiver sees notification
8. WebSocket event delivered to `/user/IPA/channel`

---

## 🧪 Testing

Manual + PHPUnit coverage for:

- Auth
- User CRUD
- Transaction creation + rollback
- Token validation

---

## 📈 Logging

`Logger.php` logs every action to:

- `logs/` folder
- `logs` table in DB (severity, user_id, message, timestamp)

Helpful for auditing & analytics

---

## 🚀 Deployment

- Apache/Nginx with `RewriteRule` → `server.php`
- WebSocket daemon managed via:

```bash
php ws-server.php > ws.log &
```

- `.env` used for secret keys, ports, DB credentials

---

## 💡 Future Improvements

- Redis for WebSocket pub/sub
- Admin dashboard (usage metrics, error tracking)
- OTP-based auth with Twilio/WhatsAppAPI  
