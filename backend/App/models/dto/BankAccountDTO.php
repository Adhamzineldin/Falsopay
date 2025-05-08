<?php

namespace App\models\dto;

/**
 * Data Transfer Object for Bank Account
 */
class BankAccountDTO
{
    public int $bank_id;
    public string $account_number;
    public int $bank_user_id;
    public string $iban;
    public string $status;
    public string $type;
    public float $balance;
    public string $created_at;
} 