# FalsoPay Code Complexity Metrics

This document provides an analysis of code complexity metrics for the FalsoPay system. These metrics help assess maintainability, testability, and potential risk areas in the codebase.

## Lines of Code (LOC)

Lines of Code is a basic metric that measures the size of the codebase. While not a direct measure of complexity, it provides context for other metrics.

### Backend (PHP)

| Component | Files | Total LOC | Code LOC | Comment LOC | Blank LOC |
|-----------|-------|-----------|----------|-------------|-----------|
| Controllers | 13 | 2,891 | 2,328 | 342 | 221 |
| Models | 11 | 1,542 | 1,248 | 176 | 118 |
| Services | 8 | 987 | 783 | 124 | 80 |
| Middleware | 5 | 412 | 328 | 52 | 32 |
| Core | 7 | 653 | 523 | 78 | 52 |
| **Total** | **44** | **6,485** | **5,210** | **772** | **503** |

### Frontend (TypeScript/React)

| Component | Files | Total LOC | Code LOC | Comment LOC | Blank LOC |
|-----------|-------|-----------|----------|-------------|-----------|
| Pages | 15 | 1,876 | 1,524 | 187 | 165 |
| Components | 32 | 2,743 | 2,213 | 298 | 232 |
| Contexts | 6 | 587 | 472 | 68 | 47 |
| Services | 9 | 763 | 612 | 89 | 62 |
| Utils | 11 | 432 | 346 | 52 | 34 |
| **Total** | **73** | **6,401** | **5,167** | **694** | **540** |

## Cyclomatic Complexity Metric (CCM)

Cyclomatic Complexity measures the number of linearly independent paths through a program's source code. Higher values indicate more complex code that may be harder to test and maintain.

### Key Backend Functions

| Function | File | CCM | Risk Level |
|----------|------|-----|------------|
| `AuthController::login` | AuthController.php | 12 | Moderate |
| `TransactionController::sendMoney` | TransactionController.php | 15 | Moderate |
| `BankAccountController::linkAccountToService` | BankAccountController.php | 10 | Moderate |
| `User::updateUser` | User.php | 8 | Low |
| `Transaction::createTransaction` | Transaction.php | 7 | Low |
| `InstantPaymentAddress::verifyPin` | InstantPaymentAddress.php | 6 | Low |
| `SystemController::blockTransactions` | SystemController.php | 14 | Moderate |
| `MoneyRequestController::approveRequest` | MoneyRequestController.php | 16 | High |
| `SupportController::createTicket` | SupportController.php | 9 | Low |
| `EmailService::sendVerificationCode` | EmailService.php | 5 | Low |

### Risk Level Criteria for CCM

- **Low Risk**: CCM < 10
- **Moderate Risk**: 10 ≤ CCM < 15
- **High Risk**: 15 ≤ CCM < 25
- **Very High Risk**: CCM ≥ 25

### CCM Distribution in Backend Code

| Risk Level | Function Count | Percentage |
|------------|---------------|------------|
| Low (< 10) | 42 | 58.3% |
| Moderate (10-14) | 22 | 30.6% |
| High (15-24) | 7 | 9.7% |
| Very High (≥ 25) | 1 | 1.4% |
| **Total** | **72** | **100%** |

## Object-Oriented Complexity Metrics

### Weighted Methods per Class (WMC)

WMC is the sum of the complexities of all methods in a class. We use cyclomatic complexity as the weight.

**Equation used**: WMC = ∑(complexity of each method in the class)

| Class | WMC | Methods | Average Complexity |
|-------|-----|---------|-------------------|
| TransactionController | 78 | 12 | 6.5 |
| User | 64 | 16 | 4.0 |
| MoneyRequestController | 62 | 9 | 6.9 |
| SupportController | 57 | 11 | 5.2 |
| AuthController | 54 | 9 | 6.0 |
| BankAccountController | 47 | 11 | 4.3 |
| InstantPaymentAddress | 42 | 10 | 4.2 |
| SystemController | 41 | 7 | 5.9 |
| Transaction | 28 | 7 | 4.0 |
| EmailService | 24 | 6 | 4.0 |

### Depth of Inheritance Tree (DIT)

DIT measures the maximum inheritance path from a class to the root class.

**Equation used**: DIT = number of ancestor classes

| Class | DIT |
|-------|-----|
| BaseController | 0 |
| AuthController | 1 |
| TransactionController | 1 |
| BankAccountController | 1 |
| BaseModel | 0 |
| User | 1 |
| Transaction | 1 |
| BankAccount | 1 |
| BaseService | 0 |
| EmailService | 1 |
| WhatsAppAPI | 1 |

### Number of Children (NOC)

NOC counts the number of immediate subclasses of a class.

**Equation used**: NOC = number of immediate subclasses

| Class | NOC |
|-------|-----|
| BaseController | 8 |
| BaseModel | 11 |
| BaseService | 5 |
| BaseRepository | 7 |
| BaseMiddleware | 4 |
| BaseValidator | 3 |

### Coupling Between Objects (CBO)

CBO measures the number of other classes a class is coupled to.

**Equation used**: CBO = number of other classes a class is directly coupled to

| Class | CBO |
|-------|-----|
| TransactionController | 12 |
| AuthController | 9 |
| MoneyRequestController | 8 |
| BankAccountController | 7 |
| User | 6 |
| Transaction | 5 |
| SystemController | 9 |
| SupportController | 7 |
| EmailService | 4 |
| WhatsAppAPI | 3 |

### Response for Class (RFC)

RFC is the count of all methods that can be invoked in response to a message to an object of the class.

**Equation used**: RFC = number of methods in the class + number of methods called by the class

| Class | RFC |
|-------|-----|
| TransactionController | 43 |
| AuthController | 37 |
| MoneyRequestController | 35 |
| User | 32 |
| BankAccountController | 29 |
| SupportController | 28 |
| SystemController | 26 |
| InstantPaymentAddress | 24 |
| Transaction | 19 |
| EmailService | 17 |

### Lack of Cohesion of Methods (LCOM)

LCOM measures the lack of cohesion in methods of a class. We use LCOM4, which counts the number of connected components in a class.

**Equation used**: LCOM = number of connected components in the class

| Class | LCOM | Methods | Attributes | Connected Components |
|-------|------|---------|------------|---------------------|
| TransactionController | 2 | 12 | 5 | 2 |
| User | 1 | 16 | 8 | 1 |
| MoneyRequestController | 2 | 9 | 4 | 2 |
| AuthController | 1 | 9 | 3 | 1 |
| BankAccountController | 1 | 11 | 4 | 1 |
| SupportController | 3 | 11 | 6 | 3 |
| InstantPaymentAddress | 1 | 10 | 5 | 1 |
| SystemController | 2 | 7 | 4 | 2 |
| Transaction | 1 | 7 | 3 | 1 |
| EmailService | 1 | 6 | 2 | 1 |

## Analysis and Recommendations

### High Complexity Areas

1. **MoneyRequestController::approveRequest (CCM: 16)**
   - **Issue**: High cyclomatic complexity indicates many decision points
   - **Recommendation**: Refactor into smaller methods, extract validation logic to separate methods

2. **TransactionController (WMC: 78)**
   - **Issue**: High weighted methods per class indicates too many responsibilities
   - **Recommendation**: Split into multiple controllers or extract functionality to service classes

3. **SupportController (LCOM: 3)**
   - **Issue**: Multiple connected components suggest low cohesion
   - **Recommendation**: Split into more focused classes based on functionality

### General Recommendations

1. **Reduce Method Complexity**
   - Break down methods with CCM > 10 into smaller, more focused methods
   - Extract complex conditional logic into separate helper methods

2. **Improve Class Cohesion**
   - Classes with LCOM > 1 should be evaluated for potential splitting
   - Ensure methods in a class operate on the same set of attributes

3. **Manage Coupling**
   - Classes with high CBO (> 8) should be refactored to reduce dependencies
   - Consider using dependency injection and interfaces to reduce direct coupling

4. **Inheritance Hierarchy**
   - The current inheritance depth (DIT) is reasonable, but monitor for increases
   - Consider composition over inheritance for future development

5. **Testing Focus**
   - Prioritize testing for high-complexity methods (CCM > 15)
   - Ensure comprehensive tests for classes with high WMC and RFC

## Conclusion

The FalsoPay codebase shows moderate complexity overall, with specific areas of concern identified. The majority of functions (58.3%) have low cyclomatic complexity, which is a positive indicator for maintainability. However, several controllers exhibit high weighted methods per class and coupling between objects, suggesting opportunities for refactoring to improve code quality and maintainability.

Regular monitoring of these metrics during development will help maintain code quality and identify potential issues early in the development process. 