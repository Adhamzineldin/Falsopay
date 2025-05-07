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
        $sql = "SELECT t.*, u.first_name, u.last_name, u.email, u.phone_number 
                FROM support_tickets t
                JOIN users u ON t.user_id = u.user_id
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
        $sql = "SELECT t.*, u.first_name, u.last_name, u.email, u.phone_number 
                FROM support_tickets t
                JOIN users u ON t.user_id = u.user_id
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
        $sql = "SELECT t.*, u.first_name, u.last_name, u.email, u.phone_number 
                FROM support_tickets t
                JOIN users u ON t.user_id = u.user_id
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
        return $reply ?: null;
    }

    /**
     * Get all replies for a ticket
     */
    public function getRepliesByTicketId(int $ticketId): array
    {
        $sql = "SELECT r.*, u.first_name, u.last_name 
                FROM support_replies r
                JOIN users u ON r.user_id = u.user_id
                WHERE r.ticket_id = :ticket_id
                ORDER BY r.created_at ASC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['ticket_id' => $ticketId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
} 