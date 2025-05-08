<?php

namespace App\models\dto;

/**
 * Data Transfer Object for Card
 */
class CardDTO
{
    public ?int $card_id = null;
    public int $bank_user_id;
    public int $bank_id;
    public string $card_number;
    public string $expiration_date;
    public string $cvv;
    public ?string $pin = null;
    public string $card_type;
    public string $created_at;
} 