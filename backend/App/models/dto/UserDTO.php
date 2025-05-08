<?php

namespace App\models\dto;

/**
 * Data Transfer Object for User
 */
class UserDTO
{
    public ?int $user_id = null;
    public string $first_name;
    public string $last_name;
    public string $email;
    public string $phone_number;
    public string $created_at;
    public ?int $default_account = null;
    public string $role = 'user';
    public string $status = 'active';
} 