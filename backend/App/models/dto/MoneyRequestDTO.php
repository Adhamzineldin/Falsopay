<?php

namespace App\models\dto;

/**
 * Data Transfer Object for Money Request
 */
class MoneyRequestDTO
{
    public ?int $request_id = null;
    public int $requester_user_id;
    public int $requested_user_id;
    public string $requester_name;
    public string $requested_name;
    public float $amount;
    public string $requester_ipa_address;
    public string $requested_ipa_address;
    public ?string $message = null;
    public string $status = 'pending';
    public ?int $transaction_id = null;
    public string $created_at;
    public string $updated_at;
} 