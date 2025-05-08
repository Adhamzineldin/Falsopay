<?php

namespace App\models\dto;

/**
 * Data Transfer Object for Favorite
 */
class FavoriteDTO
{
    public ?int $favorite_id = null;
    public int $user_id;
    public string $recipient_identifier;
    public string $recipient_name;
    public string $method;
    public ?int $bank_id = null;
    public string $created_at;
} 