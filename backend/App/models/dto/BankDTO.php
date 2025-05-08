<?php

namespace App\models\dto;

/**
 * Data Transfer Object for Bank
 */
class BankDTO
{
    public ?int $bank_id = null;
    public string $bank_name;
    public string $bank_code;
    public string $swift_code;
} 