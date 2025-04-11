# FalsoPay Project Breakdown

## 1) Introduction
We are building the FalsoPay project, a university-level fintech web application for instant money transfers and 24/7 bank account access, similar to InstaPay Egypt. The project will be split into the following sections:

### Key Project Areas:
- **Backend**: PHP-based (Laravel)
- **Frontend**: React-based
- **Timeline**: 3 weeks
- **Team**: 6 members
- **Tasks**:
    - Implement debit/prepaid card onboarding
    - 36 functions to be designed (6 per team member)
    - 24 functions to be implemented (4 per team member)
    - UML and testing documentation

---

## 2) Functional Requirements
The FalsoPay app should fulfill the following key functionalities:

### User Functionality:
1. **Account Registration & Login**:
    - User can register an account with basic info (email, phone, name).
    - Login functionality with Firebase authentication.

2. **Account Verification**:
    - User verification via SMS or email.

3. **Money Transfers**:
    - Transfer money instantly between users.
    - Ability to add recipient information or use contacts.

4. **Balance Information**:
    - Users can view account balance and transaction history.

5. **Debit/Prepaid Card Integration**:
    - Users can register and manage their debit/prepaid cards within the app.

6. **Transaction History**:
    - View complete history of past transactions.

7. **Account Security**:
    - Multi-factor authentication (2FA) for additional security.

8. **Instant Notifications**:
    - Users will receive notifications on transfers, balance updates, and account activities.

---

## 3) Non-Functional Requirements

1. **Performance**:
    - The system should be able to handle 10,000 concurrent users.
    - The money transfer should be processed within 3 seconds.

2. **Scalability**:
    - The system should scale easily with increasing user load.

3. **Availability**:
    - 99.99% uptime.

4. **Security**:
    - End-to-end encryption for all transactions.
    - Secure user data storage and communication.

5. **Compatibility**:
    - The application must be compatible across all modern browsers (Chrome, Firefox, Safari, Edge).
    - Mobile optimization for Android and iOS.

6. **Maintainability**:
    - Clean, modular codebase with comments for easier future updates.

---

## 4) All Diagrams

- **Use Case Diagram**: To showcase the main user interactions.
- **Class Diagram**: Representation of all the backend models and relationships.
- **Sequence Diagram**: Interaction flow between frontend and backend.
- **Entity-Relationship Diagram**: Database design with entities and relationships.
- **Flowcharts**: Representing the flow of different functionalities like money transfer, registration, and login.

---

## 5) Documentation
- **API Documentation**: Describing all the API endpoints, request/response formats, and error codes.
- **System Architecture**: Documentation of the overall architecture, including how the frontend and backend interact.
- **Testing Documentation**: Test cases and results.
- **Installation Guide**: Step-by-step guide to deploy the application.
- **Code Comments**: Well-commented codebase to enhance readability.

---

## Team Division for Implementation

### Backend Developers (PHP) - Difficulty: Hard
- **Backend Developer 1**: Responsible for implementing the core API logic (money transfer, user management, etc.), working with Laravel and databases.
- **Backend Developer 2**: Focus on security, JWT authentication, and payment gateway integration. Handle card registration and transaction history.

### Frontend Developers (React) - Difficulty: Medium
- **Frontend Developer 1**: UI design and implementation, ensuring responsiveness and user-friendly interfaces.
- **Frontend Developer 2**: Integration with backend APIs, handling frontend logic for user interactions and dynamic updates.

### Testing and Test Files - Difficulty: Easiest
- **Test Engineer**: Writing and running unit tests for both frontend and backend. Ensuring each functionality is thoroughly tested, including edge cases.

---

## Project Timeline

- **Start Date**: After Signals Quiz on Sunday
- **End Date**: 3 weeks from start
- **Challenges**:
    - Limited time to complete all tasks.
    - Need to make sure to finish the implementation and have a session where we explain each other's parts to gain experience with all aspects of the project.

---

## Conclusion
This project will require focused effort and collaboration. We must manage our time efficiently to meet the project requirements. After completing the implementation, we will have a session to explain each part to each other to ensure everyone has experience with all parts of the project.
