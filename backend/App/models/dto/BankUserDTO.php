<?php

namespace App\models\dto;

/**
 * Data Transfer Object for Bank User
 */
class BankUserDTO
{
    public ?int $bank_user_id = null;
    public string $first_name;
    public string $last_name;
    public string $email;
    public string $phone_number;
    public string $date_of_birth;
    public string $created_at;
} 