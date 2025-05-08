# Code Complexity Metrics

This document presents various code complexity metrics for the FalsoPay system, including Lines of Code (LOC), Cyclomatic Complexity Metric (CCM), and Object-Oriented complexity metrics.

## LOC and CCM for Main Functions

| Function | LOC | CCM |
|----------|-----|-----|
| `TransactionController::sendMoney()` | 149 | 12 |
| `AuthController::login()` | 42 | 5 |
| `BankAccountController::linkAccountToService()` | 39 | 5 |
| `User::createUser()` | 28 | 2 |
| `BankAccount::getByCompositeKey()` | 10 | 1 |
| `Transaction::createTransaction()` | 32 | 2 |

**Calculation method:**
- **LOC**: Counted non-blank, non-comment lines in each function
- **CCM**: Calculated as E - N + 2P where:
  - E = number of edges (control flow paths)
  - N = number of nodes (statements)
  - P = number of connected components (typically 1 for functions)
  - Simplified as 1 + number of decision points (if, else, case, &&, ||, ternary operators, loops)

## Object-Oriented Complexity Metrics

### WMC (Weighted Methods per Class)

WMC = Sum of complexities of all methods in the class

| Class | WMC | Calculation |
|-------|-----|-------------|
| `User` | 21 | Sum of complexities of 21 methods |
| `Transaction` | 3 | Sum of complexities of 3 methods |
| `BankAccount` | 10 | Sum of complexities of 10 methods |
| `AuthController` | 6 | Sum of complexities of 6 methods |
| `TransactionController` | 5 | Sum of complexities of 5 methods |
| `BankAccountController` | 11 | Sum of complexities of 11 methods |

### DIT (Depth of Inheritance Tree)

DIT = Length of the maximum path from the node to the root of the tree

| Class | DIT | Explanation |
|-------|-----|-------------|
| `User` | 0 | No parent class |
| `Transaction` | 0 | No parent class |
| `BankAccount` | 0 | No parent class |
| `AuthController` | 0 | No parent class |
| `TransactionController` | 0 | No parent class |
| `BankAccountController` | 0 | No parent class |

### NOC (Number of Children)

NOC = Number of immediate subclasses of a class

| Class | NOC | Explanation |
|-------|-----|-------------|
| `User` | 0 | No child classes |
| `Transaction` | 0 | No child classes |
| `BankAccount` | 0 | No child classes |
| `AuthController` | 0 | No child classes |
| `TransactionController` | 0 | No child classes |
| `BankAccountController` | 0 | No child classes |

### CBO (Coupling Between Objects)

CBO = Count of the number of other classes to which a class is coupled

| Class | CBO | Coupled Classes |
|-------|-----|-----------------|
| `User` | 2 | `Database`, `Exception` |
| `Transaction` | 2 | `Database`, `PDO` |
| `BankAccount` | 2 | `Database`, `PDO` |
| `AuthController` | 5 | `AuthMiddleware`, `InstantPaymentAddress`, `User`, `EmailService`, `WhatsAppAPI` |
| `TransactionController` | 10 | `BankAccount`, `Card`, `InstantPaymentAddress`, `Transaction`, `User`, `SystemSettings`, `EmailService`, `SocketService`, `WhatsAppAPI`, `Exception` |
| `BankAccountController` | 4 | `BankAccount`, `BankUser`, `Card`, `User` |

### RFC (Response for Class)

RFC = Number of methods that can be invoked in response to a message received by an object of that class

| Class | RFC | Calculation |
|-------|-----|-------------|
| `User` | 21 + 2 = 23 | 21 methods + 2 methods from `Database` |
| `Transaction` | 3 + 2 = 5 | 3 methods + 2 methods from `Database` |
| `BankAccount` | 10 + 2 = 12 | 10 methods + 2 methods from `Database` |
| `AuthController` | 6 + 15 = 21 | 6 methods + methods from coupled classes |
| `TransactionController` | 5 + 25 = 30 | 5 methods + methods from coupled classes |
| `BankAccountController` | 11 + 12 = 23 | 11 methods + methods from coupled classes |

### LCOM (Lack of Cohesion of Methods)

LCOM = Number of pairs of methods that don't share instance variables - Number of pairs that do

| Class | LCOM | Explanation |
|-------|-----|-------------|
| `User` | 0 | All methods use the `$pdo` instance variable |
| `Transaction` | 0 | All methods use the `$pdo` instance variable |
| `BankAccount` | 0 | All methods use the `$pdo` instance variable |
| `AuthController` | 5 | Methods have limited sharing of instance variables |
| `TransactionController` | 2 | Most methods share the model instances |
| `BankAccountController` | 3 | Some methods share model instances, others don't |

## Analysis and Observations

1. **Complexity Hotspots**: 
   - `TransactionController::sendMoney()` has the highest CCM (12) and LOC (149), indicating a complex function that might benefit from refactoring.
   - `TransactionController` has the highest CBO (10), suggesting it might be taking on too many responsibilities.

2. **Inheritance**: 
   - The system makes minimal use of inheritance (all DIT values are 0), favoring composition over inheritance.

3. **Cohesion**:
   - Model classes (`User`, `Transaction`, `BankAccount`) show good cohesion (LCOM = 0) as all methods operate on the database connection.
   - Controller classes have higher LCOM values, suggesting they might benefit from further division of responsibilities.

4. **Coupling**:
   - `TransactionController` has high coupling (CBO = 10), which could make it more difficult to maintain and test.
   - Model classes have low coupling (CBO = 2), which is a positive architectural trait. 