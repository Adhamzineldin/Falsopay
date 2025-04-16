# Non-Functional Requirements

## Categories Followed
- Performance
- Security
- Usability
- Maintainability
- Availability

## Specification with Types
| Requirement                                          | Category      |
|------------------------------------------------------|---------------|
| System must process 95% of transfers within 5 second | Performance   |
| Passwords must be encrypted using bcrypt             | Security      |
| UI must be responsive and mobile-friendly            | Usability     |
| Code must follow PSR standards and be modular        | Maintainability|
| System must have 99.9% uptime                        | Availability  |

## Fit Criteria (Testable)
- **Performance**: Benchmark tests show 95% of API responses are < 5000ms.
- **Security**: Manual tests confirm no sensitive data is stored in plaintext.
- **Usability**: User feedback scores average 8+/10 in internal testing.
- **Maintainability**: 80%+ code coverage with unit tests.
- **Availability**: Monitored by uptime tools with 99.9% SLA simulation.

## Impact on Architecture
- System will use a modular MVC architecture to ensure maintainability.
- APIs will be optimized and rate-limited to guarantee high performance.
- Security layer will include middleware for JWT validation and role checks.
- Frontend components will be decoupled to reduce load time and increase reusability.
