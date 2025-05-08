<?php

namespace App\models\dto;

/**
 * Data Transfer Object for Support Ticket
 */
class SupportTicketDTO
{
    public ?int $ticket_id = null;
    public ?int $user_id = null;
    public string $subject;
    public string $message;
    public string $status = 'open';
    public ?string $contact_name = null;
    public ?string $contact_email = null;
    public ?string $contact_phone = null;
    public string $created_at;
    public string $updated_at;
} 