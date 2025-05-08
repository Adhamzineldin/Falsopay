# FalsoPay Development Documentation

Welcome to the FalsoPay development documentation. This section provides comprehensive information about the system architecture, code organization, and development guidelines.

## Documentation Index

### System Architecture

- [Technical Architecture](technical-architecture.md) - Overview of the system's technical architecture, components, and data flow
- [Backend Documentation](backend-documentation.md) - Detailed documentation of the PHP backend
- [Frontend Documentation](frontend-documentation.md) - Detailed documentation of the React/TypeScript frontend

### Development Guidelines

- [Code Style Guide](code-style-guide.md) - Coding standards and best practices
- [Git Workflow](git-workflow.md) - Version control workflow and guidelines

### Testing

- [Testing Plan](../testing/testing-plan.md) - Overall testing strategy and approach
- [White-Box Testing](../testing/white-box-tests.md) - Unit testing with path coverage
- [Black-Box Testing](../testing/black-box-tests.md) - System testing with boundary value analysis
- [Code Complexity Metrics](../testing/code-complexity-metrics.md) - Analysis of code complexity

### Quality Assurance

- [Software Quality Factors](../testing/software-quality-factors.md) - Analysis of software quality attributes
- [Test Summary](../testing/test-summary.md) - Summary of testing results and recommendations

## Getting Started

### Prerequisites

- PHP 8.0+
- MySQL/MariaDB 5.7+
- Node.js 16+
- Composer
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   composer install
   ```

3. Configure your environment:
   ```
   cp .env.example .env
   ```

4. Update the `.env` file with your database credentials

5. Start the development server:
   ```
   php -S localhost:8000 -t public
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Access the application at `http://localhost:5173`

## Development Workflow

1. Create a new branch for your feature or bug fix
2. Implement your changes following the code style guide
3. Write tests for your code
4. Submit a pull request for review
5. Address review comments
6. Merge after approval

## Contribution Guidelines

- Follow the code style guide
- Write tests for new features
- Keep commits focused and atomic
- Document your code and API endpoints
- Review others' code constructively

## Additional Resources

- [API Documentation](api-documentation.md)
- [Database Schema](database-schema.md)
- [Deployment Guide](deployment-guide.md) 