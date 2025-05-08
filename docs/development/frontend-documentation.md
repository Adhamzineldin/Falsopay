# FalsoPay Frontend Documentation

## System Overview

The FalsoPay frontend is a modern web application built with React and TypeScript. It provides a user-friendly interface for digital payment operations, allowing users to manage their accounts, send and receive money, and track transaction history.

## Technology Stack

- **React**: UI library for building component-based interfaces
- **TypeScript**: Static typing for JavaScript
- **Vite**: Build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **ShadcnUI**: UI component library

## Directory Structure

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page components/views
│   ├── contexts/         # React context providers
│   ├── services/         # API and external service integrations
│   ├── utils/            # Utility functions
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript type definitions
│   ├── lib/              # Third-party library configurations
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── dist/                 # Build output
├── node_modules/         # Dependencies
├── package.json          # Project configuration and dependencies
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── tailwind.config.ts    # Tailwind CSS configuration
```

## Core Components

### App Structure

#### App.tsx
The main application component that sets up routing and global providers.

**Key Features:**
- Router configuration
- Authentication state management
- Global layout components

#### Main Navigation Components

- **Navbar**: Top navigation bar with user menu and notifications
- **Sidebar**: Navigation links for different sections of the application
- **Footer**: Application footer with links and information

### Key Pages

#### Authentication

- **LoginPage**: User login with phone number and IPA verification
- **RegisterPage**: New user registration
- **VerificationPage**: Email/phone verification after registration

#### Dashboard

- **DashboardPage**: Main user dashboard showing balance and recent transactions
- **TransactionHistoryPage**: Detailed list of all user transactions
- **AccountSettingsPage**: User profile and account settings

#### Money Transfer

- **SendMoneyPage**: Interface for sending money to other users
- **RequestMoneyPage**: Interface for requesting money from other users
- **TransferMethodsPage**: Selection of different transfer methods

#### Bank Accounts

- **LinkBankAccountPage**: Interface for linking bank accounts
- **ManageBankAccountsPage**: Management of linked bank accounts
- **BankVerificationPage**: Verification of bank account details

### Reusable Components

#### UI Elements

- **Button**: Customizable button component with variants
- **Input**: Form input components with validation
- **Card**: Container component for content sections
- **Modal**: Dialog component for confirmations and forms
- **Toast**: Notification component for success/error messages
- **Dropdown**: Selection component for options

#### Form Components

- **TransactionForm**: Form for creating money transfers
- **BankAccountForm**: Form for adding bank account details
- **SearchUserForm**: Form for finding users by phone or IPA

#### Data Display

- **TransactionList**: List of transactions with filtering
- **TransactionCard**: Individual transaction display
- **BalanceDisplay**: Component showing current balance
- **UserAvatar**: User profile picture component

## State Management

### React Context

- **AuthContext**: Manages user authentication state
- **TransactionContext**: Manages transaction data and operations
- **NotificationContext**: Manages system notifications
- **ThemeContext**: Manages application theme settings

### Custom Hooks

- **useAuth**: Authentication operations and state
- **useTransactions**: Transaction operations and state
- **useNotifications**: Notification display and management
- **useForm**: Form handling with validation
- **useLocalStorage**: Persistent storage in browser

## API Integration

### API Service

The `ApiService` handles communication with the backend API:

- Request/response handling
- Authentication token management
- Error handling

### Service Modules

- **AuthService**: Authentication operations
- **TransactionService**: Money transfer operations
- **BankAccountService**: Bank account operations
- **UserService**: User profile operations
- **NotificationService**: System notifications

## Routing

The application uses React Router for client-side routing:

- **Public Routes**: Accessible without authentication
- **Protected Routes**: Require user authentication
- **Role-based Routes**: Require specific user roles

## Form Handling and Validation

- Form state management with React hooks
- Input validation with validation schemas
- Error display and handling

## Styling

- Tailwind CSS for utility-based styling
- Component-specific CSS modules
- Theme variables for consistent design
- Responsive design for mobile and desktop

## Error Handling

- Global error boundary for catching React errors
- API error handling and display
- Form validation error display
- Offline state handling

## Security Features

- Token-based authentication
- Secure storage of sensitive information
- CSRF protection
- Input sanitization
- Session timeout handling

## Performance Optimizations

- Code splitting for faster initial load
- Lazy loading of components
- Memoization of expensive calculations
- Optimized rendering with React.memo
- Image optimization

## Accessibility

- ARIA attributes for screen readers
- Keyboard navigation support
- Focus management
- Color contrast compliance
- Responsive text sizing

## Testing

- Unit tests with Jest
- Component tests with React Testing Library
- End-to-end tests with Cypress
- Mock service worker for API testing

## Build and Deployment

- Development build with hot module replacement
- Production build with optimization
- Environment-specific configuration
- Continuous integration setup

## Browser Compatibility

- Modern browser support (Chrome, Firefox, Safari, Edge)
- Polyfills for older browsers
- Responsive design for different screen sizes
- Mobile device optimization

## Getting Started for Developers

1. Clone the repository
2. Install dependencies with `npm install`
3. Start development server with `npm run dev`
4. Build for production with `npm run build`
5. Run tests with `npm test` 