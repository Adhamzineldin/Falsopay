# Functional Requirements – FalsoPay (User-Focused Only)

##  User Requirements Specification
*Total: 30 functions | Implementation: 20 functions*

| #  | Function Description                                                            | Priority       | Implemented |
|----|----------------------------------------------------------------------------------|----------------|-------------|
| 1  | Register and log in via email                                                   | Must have      | ✅          |
| 2  | Log in via Google                                                       | Should have    | ✅          |
| 3  | Send money to a user by phone number                                            | Must have      | ✅          |
| 4  | View transaction history                                                        | Must have      | ✅          |
| 5  | Check account balance                                                           | Must have      | ✅          |
| 6  | Link a debit card securely                                                      | Must have      | ✅          |
| 7  | Link a prepaid card                                                             | Must have      | ✅          |
| 8  | Receive success/failure confirmation for transfers                              | Must have      | ✅          |
| 9  | Edit profile and update phone number                                            | Should have    | ✅          |
| 10 | Reset password via email                                                        | Should have    | ✅          |
| 11 | Block/unblock a linked card                                                     | Should have    | ✅          |
| 12 | Report suspicious activity                                                      | Should have    | ❌          |
| 13 | Scan QR code to pay another user                                                | Should have    | ✅          |
| 14 | View and download monthly account statements                                    | Should have    | ✅          |
| 15 | Add money to prepaid card from bank                                             | Should have    | ❌          |
| 16 | Set transfer limits per day/week                                                | Could have     | ✅          |
| 17 | Enable/disable notifications                                                    | Could have     | ❌          |
| 18 | Access customer support chat                                                    | Could have     | ❌          |
| 19 | Get in-app help/tutorials                                                       | Could have     | ✅           |
| 20 | View app usage statistics (e.g. total amount sent)                              | Could have     | ❌          |
| 21 | Add recipients to favorites for quick transfer                                  | Should have    | ✅          |
| 22 | Set a PIN for confirming transfers                                              | Must have      | ✅          |
| 23 | Schedule recurring transfers                                                    | Could have     | ❌          |
| 24 | Export transactions as CSV/PDF                                                  | Could have     | ❌          |
| 25 | Use biometric authentication (fingerprint/face)                                 | Should have    | ❌          |
| 26 | Multi-language support (English/Arabic toggle)                                  | Won’t have now | ❌         |
| 27 | Push notifications for incoming transfers                                       | Should have    | ✅          |
| 28 | Search/filter transactions by date or amount                                    | Should have    | ✅          |
| 29 | Request money from other users                                                  | Should have    | ❌          |
| 30 | Create payment links to share externally                                        | Could have     | ✅          |

---

## System Requirements Specification
*Total: 6 functions | Implementation: 4 functions*

| #  | Function Description                                                    | Priority       | Implemented |
|----|------------------------------------------------------------------------|----------------|-------------|
| 31 | Process transfer requests in < 1 second                                 | Must have      | ✅          |
| 32 | Store passwords securely using hashing (e.g., bcrypt)                  | Must have      | ✅          |
| 33 | Maintain a secure audit trail of all actions                           | Should have    | ✅          |
| 34 | Auto-backup all data every 24 hours                                    | Could have     | ❌          |
| 35 | Support high concurrency without data loss                             | Must have      | ✅          |
| 36 | Encrypt all sensitive data at rest and in transit                      | Must have      | ✅          |

---

##  Summary

- **36 total functions designed** (30 user + 6 system)
- **24 total functions selected for implementation** (marked ✅)
- Prioritized using **MoSCoW scheme**

