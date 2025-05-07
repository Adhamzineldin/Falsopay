<?php

namespace App\models;

use App\database\Database;
use Exception;
use PDO;

class SupportTicket
{
    private ?PDO $pdo;

    /**
     * @throws Exception
     */
    public function __construct()
    {
        $this->pdo = Database::getInstance()->getConnection();
    }

    /**
     * Create a new support ticket
     * 
     * @throws Exception
     */
    public function createTicket(int $userId, string $subject, string $message): array
    {
        $sql = "INSERT INTO support_tickets (user_id, subject, message)
                VALUES (:user_id, :subject, :message)";

        $stmt = $this->pdo->prepare($sql);
        $status = $stmt->execute([
            'user_id' => $userId,
            'subject' => $subject,
            'message' => $message
        ]);

        if ($status) {
            $ticketId = $this->pdo->lastInsertId();
            return $this->getTicketById($ticketId);
        } else {
            throw new Exception("Failed to create support ticket.");
        }
    }

    /**
     * Get a ticket by ID
     */
    public function getTicketById(int $id): ?array
    {
        $sql = "SELECT t.*,
                COALESCE(u.first_name, '') as first_name, 
                COALESCE(u.last_name, '') as last_name, 
                COALESCE(u.email, t.contact_email) as email, 
                COALESCE(u.phone_number, t.contact_phone) as phone_number,
                CASE WHEN t.user_id IS NULL THEN 1 ELSE 0 END as is_public 
                FROM support_tickets t
                LEFT JOIN users u ON t.user_id = u.user_id
                WHERE t.ticket_id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['id' => $id]);
        $ticket = $stmt->fetch(PDO::FETCH_ASSOC);
        return $ticket ?: null;
    }

    /**
     * Get all tickets for a user
     */
    public function getTicketsByUserId(int $userId): array
    {
        $sql = "SELECT * FROM support_tickets WHERE user_id = :user_id ORDER BY created_at DESC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['user_id' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get all tickets (for admin)
     */
    public function getAllTickets(): array
    {
        $sql = "SELECT t.*, 
                COALESCE(u.first_name, '') as first_name, 
                COALESCE(u.last_name, '') as last_name, 
                COALESCE(u.email, t.contact_email) as email, 
                COALESCE(u.phone_number, t.contact_phone) as phone_number,
                CASE WHEN t.user_id IS NULL THEN 1 ELSE 0 END as is_public
                FROM support_tickets t
                LEFT JOIN users u ON t.user_id = u.user_id
                ORDER BY 
                  CASE 
                    WHEN t.status = 'open' THEN 1
                    WHEN t.status = 'in_progress' THEN 2
                    WHEN t.status = 'closed' THEN 3
                  END,
                  t.created_at DESC";
        return $this->pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get all tickets by status (for admin)
     */
    public function getTicketsByStatus(string $status): array
    {
        $sql = "SELECT t.*, 
                COALESCE(u.first_name, '') as first_name, 
                COALESCE(u.last_name, '') as last_name, 
                COALESCE(u.email, t.contact_email) as email, 
                COALESCE(u.phone_number, t.contact_phone) as phone_number,
                CASE WHEN t.user_id IS NULL THEN 1 ELSE 0 END as is_public
                FROM support_tickets t
                LEFT JOIN users u ON t.user_id = u.user_id
                WHERE t.status = :status
                ORDER BY t.created_at DESC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['status' => $status]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Update a ticket's status
     */
    public function updateTicketStatus(int $id, string $status): bool
    {
        if (!in_array($status, ['open', 'in_progress', 'closed'])) {
            throw new Exception("Invalid status value.");
        }

        $sql = "UPDATE support_tickets SET status = :status WHERE ticket_id = :id";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([
            'id' => $id,
            'status' => $status
        ]);
    }

    /**
     * Add a reply to a ticket
     */
    public function addReply(int $ticketId, int $userId, string $message, bool $isAdmin = false): array
    {
        $sql = "INSERT INTO support_replies (ticket_id, user_id, message, is_admin)
                VALUES (:ticket_id, :user_id, :message, :is_admin)";

        $stmt = $this->pdo->prepare($sql);
        $status = $stmt->execute([
            'ticket_id' => $ticketId,
            'user_id' => $userId,
            'message' => $message,
            'is_admin' => $isAdmin ? 1 : 0
        ]);

        if ($status) {
            // If it's not the admin replying, update the ticket status to "open"
            if (!$isAdmin) {
                $this->updateTicketStatus($ticketId, 'open');
            }
            $replyId = $this->pdo->lastInsertId();
            return $this->getReplyById($replyId);
        } else {
            throw new Exception("Failed to add reply.");
        }
    }

    /**
     * Get a reply by ID
     */
    public function getReplyById(int $id): ?array
    {
        $sql = "SELECT r.*, u.first_name, u.last_name 
                FROM support_replies r
                JOIN users u ON r.user_id = u.user_id
                WHERE r.reply_id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['id' => $id]);
        $reply = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Clean up names to remove any extra characters
        if ($reply) {
            $reply['first_name'] = trim($reply['first_name']);
            $reply['last_name'] = trim($reply['last_name']);
        }
        
        return $reply ?: null;
    }

    /**
     * Get all replies for a ticket
     */
    public function getRepliesByTicketId(int $ticketId): array
    {
        // This SQL query ensures we get the correct user information for each reply
        $sql = "SELECT 
                r.*,
                u.first_name, 
                u.last_name, 
                u.email,
                u.role
                FROM support_replies r
                JOIN users u ON r.user_id = u.user_id
                WHERE r.ticket_id = :ticket_id
                ORDER BY r.created_at ASC";
                
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['ticket_id' => $ticketId]);
        $replies = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Clean up all names to ensure no extra characters
        foreach ($replies as &$reply) {
            $reply['first_name'] = trim($reply['first_name'] ?? '');
            $reply['last_name'] = trim($reply['last_name'] ?? '');
        }
        
        return $replies;
    }

    /**
     * Create a new public support ticket (from non-authenticated users)
     * 
     * @param array $data Ticket data including subject, message, contact information
     * @return array The created ticket
     * @throws Exception
     */
    public function createPublicTicket(array $data): array
    {
        // Begin a transaction for data consistency
        $this->pdo->beginTransaction();
        
        try {
            $sql = "INSERT INTO support_tickets 
                    (subject, message, status, contact_name, contact_email, contact_phone)
                    VALUES (:subject, :message, 'open', :contact_name, :contact_email, :contact_phone)";
            
            $params = [
                'subject' => $data['subject'],
                'message' => $data['message'],
                'contact_name' => $data['contact_name'],
                'contact_email' => $data['contact_email'],
                'contact_phone' => $data['contact_phone'] 
            ];
            
            // If there's an associated user ID, include it
            if (isset($data['user_id'])) {
                $sql = "INSERT INTO support_tickets 
                        (user_id, subject, message, status, contact_name, contact_email, contact_phone)
                        VALUES (:user_id, :subject, :message, 'open', :contact_name, :contact_email, :contact_phone)";
                $params['user_id'] = $data['user_id'];
            }
            
            $stmt = $this->pdo->prepare($sql);
            $status = $stmt->execute($params);
            
            if (!$status) {
                $this->pdo->rollBack();
                throw new Exception("Failed to create public support ticket.");
            }
            
            $ticketId = $this->pdo->lastInsertId();
            
            // Commit the transaction
            $this->pdo->commit();
            
            // Retrieve and return the inserted ticket
            return [
                'ticket_id' => $ticketId,
                'subject' => $data['subject'],
                'message' => $data['message'],
                'status' => 'open',
                'contact_name' => $data['contact_name'],
                'contact_email' => $data['contact_email'],
                'contact_phone' => $data['contact_phone'] ?? null,
                'created_at' => date('Y-m-d H:i:s'),
                'user_id' => $data['user_id'] ?? null
            ];
        } catch (Exception $e) {
            // Roll back the transaction on error
            $this->pdo->rollBack();
            throw $e;
        }
    }
} 