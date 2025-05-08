<?php

namespace App\models\dto;

/**
 * Data Transfer Object for Instant Payment Address
 */
class InstantPaymentAddressDTO
{
    public ?int $ipa_id = null;
    public ?int $bank_id = null;
    public ?string $account_number = null;
    public string $ipa_address;
    public ?int $user_id = null;
    public string $pin;
    public string $created_at;
} 