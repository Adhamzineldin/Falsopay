<?php

namespace App\models\dto;

/**
 * Data Transfer Object for Support Reply
 */
class SupportReplyDTO
{
    public ?int $reply_id = null;
    public int $ticket_id;
    public int $user_id;
    public bool $is_admin = false;
    public string $message;
    public string $created_at;
} 