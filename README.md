# Falsopay - Modern Banking Platform

Falsopay is a comprehensive banking platform that combines a robust PHP backend with a modern React frontend, offering a secure and user-friendly banking experience.

## 🚀 Features

- **Secure Authentication**: JWT-based authentication system
- **Real-time Transactions**: WebSocket support for instant updates
- **Modern UI**: Built with React, TypeScript, and Shadcn UI
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **Comprehensive Testing**: PHPUnit for backend, Cypress for frontend
- **API Documentation**: Detailed API documentation
- **Secure Payments**: Instant payment processing
- **Bank Integration**: Support for multiple bank accounts
- **Card Management**: Virtual and physical card support
- **Support System**: Integrated ticket system
- **System Settings**: Configurable platform settings

## 🛠️ Tech Stack

### Backend
- PHP 8.2+
- JWT Authentication
- WebSocket Server (Ratchet)
- MySQL Database
- PHPUnit Testing
- RESTful API Architecture

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Shadcn UI Components
- React Query
- React Router
- Zod Validation
- Cypress Testing

## 📋 Prerequisites

- PHP 8.2 or higher
- Node.js 18 or higher
- MySQL 8.0 or higher
- Composer
- npm or yarn

## 🚀 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/falsopay.git
cd falsopay
```

2. Backend Setup:
```bash
cd backend
composer install
cp .env.example .env
# Configure your .env file with database credentials
php artisan key:generate
```

3. Frontend Setup:
```bash
cd frontend
npm install
cp .env.example .env
# Configure your frontend environment variables
```

4. Database Setup:
```bash
# Create and configure your database
php artisan migrate
php artisan db:seed
```

## 🏃‍♂️ Running the Application

1. Start the Backend:
```bash
cd backend
php artisan serve
```

2. Start the Frontend:
```bash
cd frontend
npm run dev
```

3. Start WebSocket Server:
```bash
cd backend
php artisan websocket:serve
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
composer test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 📚 API Documentation

API documentation is available at `/api/docs` when running the backend server.

## 🔒 Security

- JWT-based authentication
- HTTPS enforcement
- CSRF protection
- XSS prevention
- SQL injection protection
- Rate limiting
- Input validation

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Adham Zineldin

## 🙏 Acknowledgments

- Shadcn UI for the beautiful component library
- React Query for efficient data fetching
- Tailwind CSS for the utility-first CSS framework
- PHPUnit for robust testing
