# Forks and Cascades in FalsoPay Interaction Diagrams

## Introduction to Interaction Patterns

In UML interaction diagrams (sequence diagrams and collaboration diagrams), different patterns can be used to model the flow of messages between objects. Two important patterns are Forks and Cascades, which represent different ways of organizing message flows in a system.

## Forks in Interaction Diagrams

### Definition
A Fork pattern occurs when an object sends messages to multiple objects in sequence or in parallel. It represents a divergence in the flow of control, where one object initiates multiple separate interactions.

### Example in FalsoPay
In the FalsoPay system, we can observe a Fork pattern in the UC9-SendMoney sequence diagram. After a transaction is successfully executed, the `TransactionService` initiates multiple separate interactions:

1. It sends a message to the `NotificationService` to notify the sender
2. It sends another message to the `NotificationService` to notify the recipient
3. It sends a message to the `AccountService` to update account balances

This is a Fork pattern because a single object (TransactionService) is initiating multiple separate flows of control to different objects.

```
TransactionService -> NotifService: Send confirmation to sender
NotifService --> TransactionService: Notification queued

TransactionService -> NotifService: Send notification to recipient
NotifService --> TransactionService: Notification queued

TransactionService -> AccountService: Update balances
AccountService --> TransactionService: Balances updated
```

### Advantages of Forks
1. **Clear Responsibility**: The initiating object has clear control over the process
2. **Centralized Decision Making**: Logic for when to trigger different actions is centralized
3. **Simplified Error Handling**: The initiating object can handle errors from any of the called objects

### Disadvantages of Forks
1. **Increased Coupling**: The initiating object needs to know about multiple other objects
2. **Potential for God Objects**: Can lead to objects with too many responsibilities
3. **Scalability Issues**: As the system grows, the initiating object may become overloaded with responsibilities

## Cascades in Interaction Diagrams

### Definition
A Cascade pattern occurs when objects delegate to each other in a chain, with each object in the chain performing its specific task and then delegating to the next object. It represents a sequential flow of control through multiple objects.

### Example in FalsoPay
In the FalsoPay system, we can observe a Cascade pattern in the authentication process. When a user attempts to log in, the following cascade occurs:

1. The `App` sends a login request to the `Gateway`
2. The `Gateway` delegates to the `AuthService`
3. The `AuthService` delegates to the `UserRepository` to find the user
4. The `UserRepository` delegates to the `Database` to retrieve user data
5. The `AuthService` then verifies the credentials and generates a token

This is a Cascade pattern because each object performs its specific task and then delegates to the next object in the chain.

```
User -> App: Login with credentials
App -> Gateway: POST /api/auth/login
Gateway -> AuthService: Authenticate user
AuthService -> UserRepository: Find user by email
UserRepository -> Database: Query user data
Database --> UserRepository: User data
UserRepository --> AuthService: User object
AuthService -> AuthService: Verify password
AuthService -> AuthService: Generate token
AuthService --> Gateway: Authentication result
Gateway --> App: 200 OK with token
App --> User: Display dashboard
```

### Advantages of Cascades
1. **Separation of Concerns**: Each object in the chain has a clear, specific responsibility
2. **Reduced Coupling**: Objects only need to know about the next object in the chain
3. **Flexibility**: Easy to insert new steps in the chain without disrupting existing code
4. **Maintainability**: Changes to one step don't affect other steps

### Disadvantages of Cascades
1. **Performance Overhead**: Multiple object interactions can introduce latency
2. **Complexity in Tracing**: Can be harder to trace the full flow of an operation
3. **Error Handling Complexity**: Errors may need to be propagated back through the chain
4. **Potential for Deep Call Stacks**: Can lead to deep call stacks that are harder to debug

## Comparison and Usage in FalsoPay

In the FalsoPay system, we have used both Forks and Cascades depending on the specific requirements of each interaction:

1. **Forks** are used when a central component needs to coordinate multiple independent actions, such as in transaction processing where notifications and account updates need to happen after a transaction.

2. **Cascades** are used when operations naturally flow through different layers of the system, such as in authentication where the request passes through the API layer, service layer, repository layer, and data access layer.

The choice between Forks and Cascades affects the system's maintainability, performance, and scalability. In FalsoPay, we've tried to balance these patterns to create a design that is both robust and flexible.

## Conclusion

Both Forks and Cascades are valuable interaction patterns in the FalsoPay system design. By understanding their advantages and disadvantages, we can make informed decisions about when to use each pattern to create a well-structured, maintainable system architecture. 