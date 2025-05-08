# FalsoPay Code Style Guide

This document outlines the coding standards and best practices for the FalsoPay project. Following these guidelines ensures consistency, maintainability, and quality across the codebase.

## Table of Contents

1. [General Guidelines](#general-guidelines)
2. [Backend (PHP) Guidelines](#backend-php-guidelines)
3. [Frontend (TypeScript/React) Guidelines](#frontend-typescriptreact-guidelines)
4. [Database Guidelines](#database-guidelines)
5. [API Design Guidelines](#api-design-guidelines)
6. [Documentation Guidelines](#documentation-guidelines)
7. [Git Workflow](#git-workflow)

## General Guidelines

### Naming Conventions

- Use descriptive names that clearly communicate purpose
- Avoid abbreviations unless they are widely understood
- Be consistent with naming patterns across the codebase

### File Organization

- Group related files together
- Maintain a logical directory structure
- Keep files focused on a single responsibility

### Comments and Documentation

- Write self-documenting code where possible
- Add comments for complex logic or business rules
- Include documentation for public APIs and interfaces

### Error Handling

- Handle errors gracefully and provide meaningful messages
- Log errors with appropriate context
- Never expose sensitive information in error messages

## Backend (PHP) Guidelines

### Code Style

- Follow PSR-12 coding standard
- Use PHP 8.0+ features where appropriate
- Use strict typing with `declare(strict_types=1)`

### Naming Conventions

- **Classes**: PascalCase (e.g., `TransactionController`)
- **Methods**: camelCase (e.g., `createTransaction`)
- **Variables**: camelCase (e.g., `$userAccount`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_TRANSFER_AMOUNT`)
- **Database columns**: snake_case (e.g., `transaction_id`)

### Class Structure

- Follow single responsibility principle
- Keep classes focused and cohesive
- Use dependency injection for external dependencies
- Organize methods logically (public methods first, then protected, then private)

```php
<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\User;
use App\Services\AuthService;

class UserController
{
    private AuthService $authService;
    
    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }
    
    public function login(array $credentials): array
    {
        // Implementation
    }
    
    private function validateCredentials(array $credentials): bool
    {
        // Implementation
    }
}
```

### Error Handling

- Use exceptions for exceptional conditions
- Create custom exception classes for specific error types
- Handle exceptions at appropriate levels

```php
try {
    $transaction = $this->transactionService->createTransaction($data);
} catch (InsufficientBalanceException $e) {
    return $this->json(['error' => 'Insufficient balance'], 400);
} catch (Exception $e) {
    $this->logger->error('Transaction failed', ['error' => $e->getMessage()]);
    return $this->json(['error' => 'An unexpected error occurred'], 500);
}
```

### Database Interactions

- Use prepared statements to prevent SQL injection
- Keep database logic in model classes
- Use transactions for operations that modify multiple tables

## Frontend (TypeScript/React) Guidelines

### Code Style

- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Use functional components with hooks

### Naming Conventions

- **Components**: PascalCase (e.g., `TransactionForm`)
- **Files**: PascalCase for components (e.g., `TransactionForm.tsx`)
- **Interfaces/Types**: PascalCase with prefix I for interfaces (e.g., `IUser`, `TransactionType`)
- **Variables/Functions**: camelCase (e.g., `getUserData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_AMOUNT`)

### Component Structure

- Keep components focused on a single responsibility
- Extract reusable logic into custom hooks
- Use TypeScript interfaces for props

```tsx
interface TransactionFormProps {
  initialAmount?: number;
  onSubmit: (data: TransactionData) => void;
  isLoading: boolean;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  initialAmount = 0,
  onSubmit,
  isLoading
}) => {
  // Implementation
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form elements */}
    </form>
  );
};
```

### State Management

- Use React Context for global state
- Keep component state local when possible
- Use reducers for complex state logic

### Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Create reusable UI components

## Database Guidelines

### Table Naming

- Use plural nouns for table names (e.g., `users`, `transactions`)
- Use snake_case for table and column names
- Be consistent with naming patterns

### Column Design

- Use appropriate data types for columns
- Include proper constraints (NOT NULL, UNIQUE, etc.)
- Use foreign keys to enforce referential integrity

### Indexing

- Add indexes to columns used in WHERE clauses
- Add indexes to foreign key columns
- Consider composite indexes for frequently combined columns

### Query Optimization

- Write efficient queries that minimize resource usage
- Use EXPLAIN to analyze query performance
- Avoid N+1 query problems

## API Design Guidelines

### Endpoint Naming

- Use nouns, not verbs (e.g., `/api/transactions`, not `/api/getTransactions`)
- Use plural nouns for collections
- Use kebab-case for multi-word resources

### HTTP Methods

- `GET`: Retrieve resources
- `POST`: Create resources
- `PUT`: Update resources (full replacement)
- `PATCH`: Partial update of resources
- `DELETE`: Remove resources

### Status Codes

- `200 OK`: Successful operation
- `201 Created`: Resource created
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Authenticated but not authorized
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

### Response Format

Use consistent JSON response format:

```json
{
  "success": true,
  "data": {
    "id": 123,
    "amount": 100.00
  }
}
```

For errors:

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Insufficient balance for this transaction"
  }
}
```

## Documentation Guidelines

### Code Documentation

- Document public methods and classes
- Explain complex algorithms or business logic
- Include parameter and return type descriptions

### API Documentation

- Document all API endpoints
- Include request parameters and response format
- Provide example requests and responses

### README Files

- Include setup instructions
- Document environment requirements
- Provide quick start guide

## Git Workflow

### Branch Naming

- Feature branches: `feature/short-description`
- Bug fixes: `fix/issue-description`
- Releases: `release/version-number`

### Commit Messages

Follow conventional commits format:

```
type(scope): short description

Longer description if needed
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `test`: Adding or modifying tests
- `chore`: Changes to the build process, tools, etc.

### Pull Requests

- Create descriptive PR titles
- Include a summary of changes
- Reference related issues
- Request reviews from appropriate team members

## Code Review Guidelines

### What to Look For

- Code correctness and functionality
- Adherence to coding standards
- Security considerations
- Performance implications
- Test coverage

### Feedback Approach

- Be specific and constructive
- Explain the reasoning behind suggestions
- Focus on the code, not the person
- Acknowledge good solutions

## Conclusion

Following these guidelines will help maintain a high-quality, consistent codebase for the FalsoPay project. These standards should evolve over time as the project grows and technologies change. 