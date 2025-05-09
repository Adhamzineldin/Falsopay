<?php

namespace App\controllers;

use App\models\SupportTicket;
use App\models\User;
use Exception;

class SupportController
{
    private SupportTicket $supportTicketModel;
    private User $userModel;

    /**
     * @throws Exception
     */
    public function __construct()
    {
        $this->supportTicketModel = new SupportTicket();
        $this->userModel = new User();
    }

    /**
     * Create a new support ticket
     * 
     * @param array $data The request data
     * @return array Response data
     */
    public function createTicket(array $data): array
    {
        try {
            // Validate required fields
            $requiredFields = ['user_id', 'subject', 'message'];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field]) || empty($data[$field])) {
                    return [
                        'status' => 'error',
                        'message' => "Missing required field: $field",
                        'code' => 400
                    ];
                }
            }

            // Create the ticket
            $ticket = $this->supportTicketModel->createTicket(
                (int)$data['user_id'],
                $data['subject'],
                $data['message']
            );

            // Get admin users to notify them about the new ticket
            $adminUsers = $this->userModel->getAdminUsers();
            if (!empty($adminUsers)) {
                $socketService = new \App\services\SocketService();
                $userName = $this->userModel->getUserById((int)$data['user_id']);
                $userFullName = $userName['first_name'] . ' ' . $userName['last_name'];
                
                // Notify each admin about the new ticket
                foreach ($adminUsers as $admin) {
                    $socketService->sendTicketNotification(
                        $admin['user_id'],
                        $ticket['ticket_id'],
                        $ticket['subject'],
                        "New support ticket from {$userFullName}",
                        "new_ticket"
                    );
                }
            }

            return [
                'status' => 'success',
                'message' => 'Support ticket created successfully',
                'data' => $ticket,
                'code' => 201
            ];

        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Failed to create ticket: ' . $e->getMessage(),
                'code' => 500
            ];
        }
    }

    /**
     * Get all tickets for a user
     * 
     * @param int $userId The user ID
     * @return array Response data
     */
    public function getUserTickets(int $userId): array
    {
        try {
            $tickets = $this->supportTicketModel->getTicketsByUserId($userId);

            return [
                'status' => 'success',
                'data' => $tickets,
                'code' => 200
            ];

        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Failed to retrieve tickets: ' . $e->getMessage(),
                'code' => 500
            ];
        }
    }

    /**
     * Get a ticket by ID
     * 
     * @param int $ticketId The ticket ID
     * @param int $userId The user ID (for authorization)
     * @param bool $isAdmin Whether the requester is an admin
     * @return array Response data
     */
    public function getTicket(int $ticketId, int $userId, bool $isAdmin = false): array
    {
        try {
            $ticket = $this->supportTicketModel->getTicketById($ticketId);
            
            if (!$ticket) {
                return [
                    'status' => 'error',
                    'message' => 'Ticket not found',
                    'code' => 404
                ];
            }

            // If not admin, ensure the ticket belongs to the user
            if (!$isAdmin && (int)$ticket['user_id'] !== $userId) {
                return [
                    'status' => 'error',
                    'message' => 'Unauthorized access to this ticket',
                    'code' => 403
                ];
            }

            // Get the replies for this ticket
            $replies = $this->supportTicketModel->getRepliesByTicketId($ticketId);

            return [
                'status' => 'success',
                'data' => [
                    'ticket' => $ticket,
                    'replies' => $replies
                ],
                'code' => 200
            ];

        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Failed to retrieve ticket: ' . $e->getMessage(),
                'code' => 500
            ];
        }
    }

    /**
     * Add a reply to a ticket
     * 
     * @param array $data The request data
     * @param int $userId The user ID (for authorization)
     * @param bool $isAdmin Whether the requester is an admin
     * @return array Response data
     */
    public function addReply(array $data, int $userId, bool $isAdmin = false): array
    {
        try {
            // Validate required fields
            $requiredFields = ['ticket_id', 'message'];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field]) || empty($data[$field])) {
                    return [
                        'status' => 'error',
                        'message' => "Missing required field: $field",
                        'code' => 400
                    ];
                }
            }

            $ticketId = (int)$data['ticket_id'];
            
            // Get the ticket to check ownership or admin status
            $ticket = $this->supportTicketModel->getTicketById($ticketId);
            
            if (!$ticket) {
                return [
                    'status' => 'error',
                    'message' => 'Ticket not found',
                    'code' => 404
                ];
            }

            // If not admin, ensure the ticket belongs to the user
            if (!$isAdmin && (int)$ticket['user_id'] !== $userId) {
                return [
                    'status' => 'error',
                    'message' => 'Unauthorized access to this ticket',
                    'code' => 403
                ];
            }

            // Add the reply using the provided user ID
            $reply = $this->supportTicketModel->addReply(
                $ticketId,
                $userId,
                $data['message'],
                $isAdmin
            );

            // If admin is replying, update the ticket status to "in_progress" if it's not already closed
            if ($isAdmin && $ticket['status'] !== 'closed') {
                $this->supportTicketModel->updateTicketStatus($ticketId, 'in_progress');
            }

            // Simple notification without changing names
            $socketService = new \App\services\SocketService();
            
            if ($isAdmin) {
                // Notify the ticket owner about admin reply
                $socketService->sendTicketNotification(
                    (int)$ticket['user_id'],
                    $ticketId,
                    $ticket['subject'],
                    "New reply on your ticket",
                    "new_reply"
                );
            } else {
                // Notify admins about user reply
                $adminUsers = $this->userModel->getAdminUsers();
                foreach ($adminUsers as $admin) {
                    $socketService->sendTicketNotification(
                        $admin['user_id'],
                        $ticketId,
                        $ticket['subject'],
                        "New reply on ticket #{$ticketId}",
                        "new_reply"
                    );
                }
            }

            return [
                'status' => 'success',
                'message' => 'Reply added successfully',
                'data' => $reply,
                'code' => 201
            ];

        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Failed to add reply: ' . $e->getMessage(),
                'code' => 500
            ];
        }
    }

    /**
     * Update a ticket's status (admin only)
     * 
     * @param int $ticketId The ticket ID
     * @param string $status The new status
     * @return array Response data
     */
    public function updateTicketStatus(int $ticketId, string $status): array
    {
        try {
            if (!in_array($status, ['open', 'in_progress', 'closed'])) {
                return [
                    'status' => 'error',
                    'message' => 'Invalid status value',
                    'code' => 400
                ];
            }

            $ticket = $this->supportTicketModel->getTicketById($ticketId);
            
            if (!$ticket) {
                return [
                    'status' => 'error',
                    'message' => 'Ticket not found',
                    'code' => 404
                ];
            }

            $result = $this->supportTicketModel->updateTicketStatus($ticketId, $status);

            if ($result) {
                // Send notification about status change
                if (isset($ticket['user_id']) && $ticket['user_id']) {
                    $socketService = new \App\services\SocketService();
                    $statusText = ucfirst(str_replace('_', ' ', $status));
                    
                    $socketService->sendTicketNotification(
                        (int)$ticket['user_id'],
                        $ticketId,
                        $ticket['subject'],
                        "Your ticket status has been updated to: {$statusText}",
                        "status_change"
                    );
                }
                
                return [
                    'status' => 'success',
                    'message' => 'Ticket status updated successfully',
                    'code' => 200
                ];
            } else {
                return [
                    'status' => 'error',
                    'message' => 'Failed to update ticket status',
                    'code' => 500
                ];
            }

        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Failed to update ticket status: ' . $e->getMessage(),
                'code' => 500
            ];
        }
    }

    /**
     * Get all tickets (admin only)
     * 
     * @return array Response data
     */
    public function getAllTickets(): array
    {
        try {
            $tickets = $this->supportTicketModel->getAllTickets();

            return [
                'status' => 'success',
                'data' => $tickets,
                'code' => 200
            ];

        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Failed to retrieve tickets: ' . $e->getMessage(),
                'code' => 500
            ];
        }
    }

    /**
     * Get tickets by status (admin only)
     * 
     * @param string $status The status to filter by
     * @return array Response data
     */
    public function getTicketsByStatus(string $status): array
    {
        try {
            if (!in_array($status, ['open', 'in_progress', 'closed'])) {
                return [
                    'status' => 'error',
                    'message' => 'Invalid status value',
                    'code' => 400
                ];
            }

            $tickets = $this->supportTicketModel->getTicketsByStatus($status);

            return [
                'status' => 'success',
                'data' => $tickets,
                'code' => 200
            ];

        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Failed to retrieve tickets: ' . $e->getMessage(),
                'code' => 500
            ];
        }
    }

    /**
     * Create a new support ticket from a non-authenticated user
     * 
     * @param array $data The request data
     * @return array Response data
     */
    public function createPublicTicket(array $data): array
    {
        try {
            // Validate required fields
            $requiredFields = ['first_name', 'last_name', 'email', 'subject', 'message'];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field]) || empty($data[$field])) {
                    return [
                        'status' => 'error',
                        'message' => "Missing required field: $field",
                        'code' => 400
                    ];
                }
            }

            // Validate email format
            if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                return [
                    'status' => 'error',
                    'message' => "Invalid email format",
                    'code' => 400
                ];
            }

            // Check if there's a user with this email
            $existingUser = $this->userModel->getUserByEmail($data['email']);
            $userId = null;

            if ($existingUser) {
                // Use the existing user's ID
                $userId = $existingUser['user_id'];
            }

            // Create the ticket
            $ticketData = [
                'subject' => $data['subject'],
                'message' => $data['message'],
                'contact_email' => $data['email'],
                'contact_phone' => $data['phone_number'] ?? null,
                'contact_name' => $data['first_name'] . ' ' . $data['last_name'],
                'is_public' => true
            ];

            if ($userId) {
                $ticketData['user_id'] = $userId;
            }

            $ticket = $this->supportTicketModel->createPublicTicket($ticketData);

            return [
                'status' => 'success',
                'message' => 'Support ticket created successfully',
                'code' => 201
            ];

        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Failed to create ticket: ' . $e->getMessage(),
                'code' => 500
            ];
        }
    }

    /**
     * Add a reply to a public ticket (admin only)
     * 
     * @param array $data The request data
     * @return array Response data
     */
    public function addPublicReply(array $data): array
    {
        try {
            // Validate required fields
            $requiredFields = ['ticket_id', 'message'];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field]) || empty($data[$field])) {
                    return [
                        'status' => 'error',
                        'message' => "Missing required field: $field",
                        'code' => 400
                    ];
                }
            }

            $ticketId = (int)$data['ticket_id'];
            
            // Get the ticket to check if it exists
            $ticket = $this->supportTicketModel->getTicketById($ticketId);
            
            if (!$ticket) {
                return [
                    'status' => 'error',
                    'message' => 'Ticket not found',
                    'code' => 404
                ];
            }

            // Use admin ID from request
            $adminUserId = $data['admin_user_id'] ?? null;
            
            if (!$adminUserId) {
                return [
                    'status' => 'error',
                    'message' => 'Admin user ID is required',
                    'code' => 400
                ];
            }

            // Add the reply using admin user ID
            $reply = $this->supportTicketModel->addReply(
                $ticketId,
                $adminUserId,
                $data['message'],
                true // is admin
            );

            // Update the ticket status to "in_progress" if it's not already closed
            if ($ticket['status'] !== 'closed') {
                $this->supportTicketModel->updateTicketStatus($ticketId, 'in_progress');
            }

            // Simple notification
            if (isset($ticket['user_id']) && $ticket['user_id']) {
                $socketService = new \App\services\SocketService();
                $socketService->sendTicketNotification(
                    (int)$ticket['user_id'],
                    $ticketId,
                    $ticket['subject'],
                    "New reply on your ticket",
                    "new_reply"
                );
            }

            return [
                'status' => 'success',
                'message' => 'Reply added successfully',
                'data' => $reply,
                'code' => 201
            ];

        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Failed to add reply: ' . $e->getMessage(),
                'code' => 500
            ];
        }
    }
} 