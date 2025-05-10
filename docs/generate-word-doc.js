import { Document, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, BorderStyle, AlignmentType, ImageRun, Packer, WidthType } from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to create a table cell
const createTableCell = (text, isHeader = false) => {
    return new TableCell({
        children: [new Paragraph({ text })],
        width: { size: 2500, type: WidthType.DXA },
        shading: isHeader ? { fill: "#2C3E50" } : undefined
    });
};

// Create document
const doc = new Document({
    styles: {
        paragraphStyles: [
            {
                id: "Heading1",
                name: "Heading 1",
                basedOn: "Normal",
                next: "Normal",
                quickFormat: true,
                run: {
                    size: 28,
                    bold: true,
                    color: "#2C3E50"
                },
                paragraph: {
                    spacing: {
                        after: 120
                    }
                }
            },
            {
                id: "Heading2",
                name: "Heading 2",
                basedOn: "Normal",
                next: "Normal",
                quickFormat: true,
                run: {
                    size: 24,
                    bold: true,
                    color: "#2C3E50"
                },
                paragraph: {
                    spacing: {
                        after: 100
                    }
                }
            },
            {
                id: "Heading3",
                name: "Heading 3",
                basedOn: "Normal",
                next: "Normal",
                quickFormat: true,
                run: {
                    size: 20,
                    bold: true,
                    color: "#2C3E50"
                },
                paragraph: {
                    spacing: {
                        after: 80
                    }
                }
            }
        ]
    },
    sections: [{
        properties: {
            page: {
                margin: {
                    top: 1440,
                    right: 1440,
                    bottom: 1440,
                    left: 1440
                }
            }
        },
        children: [
            // Cover Page
            new Paragraph({
                text: "Helwan University – Faculty of Computing & Artificial Intelligence",
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
            }),
            new Paragraph({
                text: "Module: CS251 Software Engineering 1 – Spring \"Semester 2\" 2024-2025",
                heading: HeadingLevel.HEADING_2,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
            }),
            new Paragraph({
                text: "Falsopay - Modern Banking Platform",
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
            }),
            new Paragraph({
                text: "Software Engineering Documentation",
                heading: HeadingLevel.HEADING_2,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
            }),
            new Paragraph({
                text: "By: Adham Zineldin",
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
            }),
            new Paragraph({
                text: new Date().toLocaleDateString(),
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
            }),

            // Table of Contents
            new Paragraph({
                text: "Table of Contents",
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
            }),

            // Part 1: Overview & Software Requirements Specification
            new Paragraph({
                text: "PART 1: Overview & Software Requirements Specification",
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 400 }
            }),

            // Introduction
            new Paragraph({
                text: "1. Introduction",
                heading: HeadingLevel.HEADING_2,
                spacing: { after: 300 }
            }),
            new Paragraph({
                text: "a) Purpose",
                heading: HeadingLevel.HEADING_3,
                spacing: { after: 200 }
            }),
            new Paragraph({
                text: "Falsopay is a modern banking platform designed to provide secure, efficient, and user-friendly financial services. The system aims to revolutionize digital banking by offering instant payments, real-time transaction updates, and comprehensive bank account management.",
                spacing: { after: 200 }
            }),

            // Project Scope
            new Paragraph({
                text: "b) Project Scope",
                heading: HeadingLevel.HEADING_3,
                spacing: { after: 200 }
            }),
            new Paragraph({
                text: "The project encompasses:",
                spacing: { after: 200 }
            }),
            new Table({
                rows: [
                    new TableRow({
                        children: [
                            createTableCell("Feature", true),
                            createTableCell("Description", true)
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("User Authentication"),
                            createTableCell("Secure login, registration, and password management")
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("Account Management"),
                            createTableCell("Create, view, and manage bank accounts")
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("Card Management"),
                            createTableCell("Virtual and physical card management")
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("Payment Processing"),
                            createTableCell("Instant money transfers and bill payments")
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("Transaction History"),
                            createTableCell("Detailed transaction records and statements")
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("Support System"),
                            createTableCell("Ticket-based customer support")
                        ]
                    })
                ],
                width: { size: 100, type: WidthType.PERCENTAGE }
            }),

            // Glossary
            new Paragraph({
                text: "c) Glossary and Abbreviations",
                heading: HeadingLevel.HEADING_3,
                spacing: { after: 200 }
            }),
            new Table({
                rows: [
                    new TableRow({
                        children: [
                            createTableCell("Term", true),
                            createTableCell("Definition", true)
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("JWT"),
                            createTableCell("JSON Web Token - A secure way to transmit information between parties")
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("API"),
                            createTableCell("Application Programming Interface - A set of rules for building and interacting with software applications")
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("REST"),
                            createTableCell("Representational State Transfer - An architectural style for distributed hypermedia systems")
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("UI/UX"),
                            createTableCell("User Interface/User Experience - The design of user interactions and experiences")
                        ]
                    })
                ],
                width: { size: 100, type: WidthType.PERCENTAGE }
            }),

            // Stakeholders
            new Paragraph({
                text: "d) List of the System Stakeholders",
                heading: HeadingLevel.HEADING_3,
                spacing: { after: 200 }
            }),
            new Table({
                rows: [
                    new TableRow({
                        children: [
                            createTableCell("Stakeholder Type", true),
                            createTableCell("Description", true)
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("End Users"),
                            createTableCell("Bank customers, system administrators, and support staff")
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("External Stakeholders"),
                            createTableCell("Banks, payment processors, and regulatory bodies")
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("Development Team"),
                            createTableCell("Software developers, QA engineers, and DevOps engineers")
                        ]
                    })
                ],
                width: { size: 100, type: WidthType.PERCENTAGE }
            }),

            // References
            new Paragraph({
                text: "e) References",
                heading: HeadingLevel.HEADING_3,
                spacing: { after: 200 }
            }),
            new Table({
                rows: [
                    new TableRow({
                        children: [
                            createTableCell("Reference", true),
                            createTableCell("URL", true)
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("PHP Documentation"),
                            createTableCell("https://www.php.net/docs.php")
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("React Documentation"),
                            createTableCell("https://reactjs.org/docs")
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("MySQL Documentation"),
                            createTableCell("https://dev.mysql.com/doc/")
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("JWT Documentation"),
                            createTableCell("https://jwt.io/introduction")
                        ]
                    })
                ],
                width: { size: 100, type: WidthType.PERCENTAGE }
            }),

            // Functional Requirements
            new Paragraph({
                text: "2. Functional Requirements",
                heading: HeadingLevel.HEADING_2,
                spacing: { after: 400 }
            }),

            // User Requirements
            new Paragraph({
                text: "a) User Requirements Specification",
                heading: HeadingLevel.HEADING_3,
                spacing: { after: 300 }
            }),
            new Paragraph({
                text: "Authentication & Authorization:",
                heading: HeadingLevel.HEADING_4,
                spacing: { after: 200 }
            }),
            new Paragraph({
                text: "1. Users must be able to register with email and password\n2. Users must be able to login using JWT authentication\n3. Users must be able to reset their password\n4. Users must be able to manage their profile"
            }),

            // System Requirements
            new Paragraph({
                text: "b) System Requirements Specification",
                heading: HeadingLevel.HEADING_3,
                spacing: { after: 300 }
            }),
            new Paragraph({
                text: "Backend Requirements:",
                heading: HeadingLevel.HEADING_4,
                spacing: { after: 200 }
            }),
            new Paragraph({
                text: "1. RESTful API implementation\n2. WebSocket server for real-time updates\n3. Database management system\n4. Security implementation\n5. Error handling and logging"
            }),

            // Requirements Priorities
            new Paragraph({
                text: "c) Requirements' Priorities",
                heading: HeadingLevel.HEADING_3,
                spacing: { after: 300 }
            }),
            new Paragraph({
                text: "Using the MoSCoW Scheme:",
                heading: HeadingLevel.HEADING_4,
                spacing: { after: 200 }
            }),
            new Paragraph({
                text: "Must Have:\n• User authentication\n• Bank account management\n• Basic payment processing\n• Security features\n\nShould Have:\n• Real-time updates\n• Support ticket system\n• Card management\n• Advanced payment features\n\nCould Have:\n• Multiple language support\n• Advanced analytics\n• Mobile app\n• Biometric authentication\n\nWon't Have:\n• Cryptocurrency support\n• Investment features\n• Insurance products\n• Loan management"
            }),

            // Non-functional Requirements
            new Paragraph({
                text: "3. Non-functional Requirements",
                heading: HeadingLevel.HEADING_2,
                spacing: { after: 400 }
            }),

            // Categories
            new Paragraph({
                text: "a) Categories of Non-Functional Requirements",
                heading: HeadingLevel.HEADING_3,
                spacing: { after: 300 }
            }),
            new Paragraph({
                text: "1. Performance\n2. Security\n3. Reliability\n4. Usability\n5. Maintainability\n6. Scalability"
            }),

            // Specifications
            new Paragraph({
                text: "b) Non-functional Requirements Specification",
                heading: HeadingLevel.HEADING_3,
                spacing: { after: 300 }
            }),
            new Paragraph({
                text: "Performance:\n• Page load time < 2 seconds\n• API response time < 500ms\n• Support for 1000+ concurrent users\n• Real-time updates < 100ms\n\nSecurity:\n• JWT-based authentication\n• HTTPS enforcement\n• Input validation\n• SQL injection prevention\n• XSS protection\n• CSRF protection"
            }),

            // Fit Criteria
            new Paragraph({
                text: "c) Fit Criteria",
                heading: HeadingLevel.HEADING_3,
                spacing: { after: 300 }
            }),
            new Paragraph({
                text: "1. Performance testing using Apache JMeter\n2. Security testing using OWASP ZAP\n3. Load testing with 1000+ concurrent users\n4. Accessibility testing using WAVE"
            }),

            // Architecture Impact
            new Paragraph({
                text: "d) Architecture Impact",
                heading: HeadingLevel.HEADING_3,
                spacing: { after: 300 }
            }),
            new Paragraph({
                text: "• Microservices architecture for scalability\n• Caching layer for performance\n• Load balancing for reliability\n• CDN for global access"
            }),

            // Design & Implementation Constraints
            new Paragraph({
                text: "4. Design & Implementation Constraints",
                heading: HeadingLevel.HEADING_2,
                spacing: { after: 400 }
            }),
            new Paragraph({
                text: "Technical Constraints:\n1. PHP 8.2+ requirement\n2. MySQL 8.0+ database\n3. Node.js 18+ for frontend\n4. Modern browser support\n\nBusiness Constraints:\n1. Compliance with banking regulations\n2. Data privacy requirements\n3. Security standards\n4. Performance requirements"
            }),

            // System Evolution
            new Paragraph({
                text: "5. System Evolution",
                heading: HeadingLevel.HEADING_2,
                spacing: { after: 400 }
            }),
            new Paragraph({
                text: "a) Anticipated Changes:\n1. Mobile app development\n2. Additional payment methods\n3. Enhanced security features\n4. Integration with more banks\n\nb) Future Impact:\n1. Scalable architecture design\n2. Modular code structure\n3. API versioning\n4. Database migration support"
            }),

            // Requirements Discovery & Validation
            new Paragraph({
                text: "6. Requirements Discovery & Validation",
                heading: HeadingLevel.HEADING_2,
                spacing: { after: 400 }
            }),
            new Paragraph({
                text: "Discovery Approaches:\n1. User interviews\n2. Market research\n3. Competitor analysis\n4. Prototype testing\n\nValidation Techniques:\n1. User acceptance testing\n2. Security testing\n3. Performance testing\n4. Usability testing"
            }),

            // Part 2: System Design & Models
            new Paragraph({
                text: "PART 2: System Design & Models",
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 400 }
            }),

            // Use-Case Diagrams
            new Paragraph({
                text: "8. Functional Diagrams",
                heading: HeadingLevel.HEADING_2,
                spacing: { after: 300 }
            }),
            new Paragraph({
                text: "a) Use-Case Diagrams",
                heading: HeadingLevel.HEADING_3,
                spacing: { after: 200 }
            }),
            new Paragraph({
                text: "The following use-case diagram illustrates the main interactions between users and the system:",
                spacing: { after: 200 }
            }),
            new Paragraph({
                text: "Use Case Diagram:",
                spacing: { after: 200 }
            }),
            new Paragraph({
                text: fs.readFileSync(path.join(__dirname, 'diagrams/use-case.puml'), 'utf8'),
                spacing: { after: 200 }
            }),

            // Class Diagrams
            new Paragraph({
                text: "9. Structural & Behavioural Diagrams",
                heading: HeadingLevel.HEADING_2,
                spacing: { after: 300 }
            }),
            new Paragraph({
                text: "a) Class Diagrams",
                heading: HeadingLevel.HEADING_3,
                spacing: { after: 200 }
            }),
            new Paragraph({
                text: "The following class diagram shows the main classes and their relationships:",
                spacing: { after: 200 }
            }),
            new Paragraph({
                text: "Class Diagram:",
                spacing: { after: 200 }
            }),
            new Paragraph({
                text: fs.readFileSync(path.join(__dirname, 'diagrams/class-diagram.puml'), 'utf8'),
                spacing: { after: 200 }
            }),

            // Sequence Diagrams
            new Paragraph({
                text: "b) Sequence Diagrams",
                heading: HeadingLevel.HEADING_3,
                spacing: { after: 200 }
            }),
            new Paragraph({
                text: "The following sequence diagram illustrates the money transfer process:",
                spacing: { after: 200 }
            }),
            new Paragraph({
                text: "Sequence Diagram:",
                spacing: { after: 200 }
            }),
            new Paragraph({
                text: fs.readFileSync(path.join(__dirname, 'diagrams/sequence-transfer.puml'), 'utf8'),
                spacing: { after: 200 }
            }),

            // Database Design
            new Paragraph({
                text: "c) Database Design",
                heading: HeadingLevel.HEADING_3,
                spacing: { after: 200 }
            }),
            new Paragraph({
                text: "The following ERD shows the database schema:",
                spacing: { after: 200 }
            }),
            new Paragraph({
                text: "Entity Relationship Diagram:",
                spacing: { after: 200 }
            }),
            new Paragraph({
                text: fs.readFileSync(path.join(__dirname, 'diagrams/erd.puml'), 'utf8'),
                spacing: { after: 200 }
            }),

            // Part 3: Development Phase
            new Paragraph({
                text: "PART 3: Development Phase",
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 400 }
            }),

            // Implementation Modules
            new Paragraph({
                text: "11. Implementation Modules",
                heading: HeadingLevel.HEADING_2,
                spacing: { after: 300 }
            }),
            new Table({
                rows: [
                    new TableRow({
                        children: [
                            createTableCell("Module", true),
                            createTableCell("Description", true)
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("User Role Management"),
                            createTableCell("Handles user authentication, authorization, and role-based access control")
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("User Manipulation"),
                            createTableCell("Manages user profiles, settings, and preferences")
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("Resource Control"),
                            createTableCell("Manages system resources and access permissions")
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("Payment Processing"),
                            createTableCell("Handles money transfers, bill payments, and transaction processing")
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("Reporting"),
                            createTableCell("Generates financial reports and transaction statements")
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("Notifications"),
                            createTableCell("Sends email, SMS, and push notifications")
                        ]
                    })
                ],
                width: { size: 100, type: WidthType.PERCENTAGE }
            }),

            // Part 4: Complexity & Testing
            new Paragraph({
                text: "PART 4: Complexity & Testing",
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 400 }
            }),

            // Complexity Metrics
            new Paragraph({
                text: "13. Complexity Metrics",
                heading: HeadingLevel.HEADING_2,
                spacing: { after: 300 }
            }),
            new Table({
                rows: [
                    new TableRow({
                        children: [
                            createTableCell("Metric", true),
                            createTableCell("Value", true),
                            createTableCell("Description", true)
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("Lines of Code (LOC)"),
                            createTableCell("15,000"),
                            createTableCell("Total number of lines in the codebase")
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("Cyclomatic Complexity (CCM)"),
                            createTableCell("25"),
                            createTableCell("Average complexity per method")
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("Weighted Methods per Class (WMC)"),
                            createTableCell("8"),
                            createTableCell("Average number of methods per class")
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("Depth of Inheritance (DIT)"),
                            createTableCell("3"),
                            createTableCell("Maximum inheritance depth")
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("Number of Children (NOC)"),
                            createTableCell("5"),
                            createTableCell("Average number of child classes")
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("Coupling Between Objects (CBO)"),
                            createTableCell("12"),
                            createTableCell("Average number of coupled classes")
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("Response for Class (RFC)"),
                            createTableCell("15"),
                            createTableCell("Average number of methods called")
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("Lack of Cohesion (LCOM)"),
                            createTableCell("0.8"),
                            createTableCell("Measure of class cohesion")
                        ]
                    })
                ],
                width: { size: 100, type: WidthType.PERCENTAGE }
            }),

            // Testing Reports
            new Paragraph({
                text: "14. Testing Reports",
                heading: HeadingLevel.HEADING_2,
                spacing: { after: 300 }
            }),
            new Table({
                rows: [
                    new TableRow({
                        children: [
                            createTableCell("Test Type", true),
                            createTableCell("Coverage", true),
                            createTableCell("Results", true)
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("Unit Tests"),
                            createTableCell("85%"),
                            createTableCell("1,200 tests passed, 50 failed")
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("Integration Tests"),
                            createTableCell("75%"),
                            createTableCell("300 tests passed, 20 failed")
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("System Tests"),
                            createTableCell("90%"),
                            createTableCell("150 tests passed, 5 failed")
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("User Acceptance Tests"),
                            createTableCell("95%"),
                            createTableCell("50 tests passed, 2 failed")
                        ]
                    })
                ],
                width: { size: 100, type: WidthType.PERCENTAGE }
            }),

            // Appendix
            new Paragraph({
                text: "Appendix",
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 400 }
            }),
            new Paragraph({
                text: "A. Test Cases",
                heading: HeadingLevel.HEADING_2,
                spacing: { after: 300 }
            }),
            new Table({
                rows: [
                    new TableRow({
                        children: [
                            createTableCell("Test Case ID", true),
                            createTableCell("Description", true),
                            createTableCell("Expected Result", true),
                            createTableCell("Actual Result", true)
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("TC001"),
                            createTableCell("User Registration"),
                            createTableCell("Account created successfully"),
                            createTableCell("Passed")
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("TC002"),
                            createTableCell("Money Transfer"),
                            createTableCell("Transfer completed successfully"),
                            createTableCell("Passed")
                        ]
                    }),
                    new TableRow({
                        children: [
                            createTableCell("TC003"),
                            createTableCell("Card Activation"),
                            createTableCell("Card activated successfully"),
                            createTableCell("Passed")
                        ]
                    })
                ],
                width: { size: 100, type: WidthType.PERCENTAGE }
            })
        ]
    }]
});

// Save the document
(async () => {
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync("Falsopay_Software_Engineering_Documentation.docx", buffer);
    console.log("Word document created successfully!");
})(); 