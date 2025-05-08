<?php

namespace App\models\dto;

/**
 * Data Transfer Object for System Settings
 */
class SystemSettingsDTO
{
    public ?int $setting_id = null;
    public bool $transfer_limit_enabled = false;
    public float $transfer_limit_amount = 5000.00;
    public bool $transactions_blocked = false;
    public ?string $block_message = null;
    public bool $maintenance_mode = false;
    public ?string $maintenance_message = null;
    public ?int $updated_by = null;
    public string $updated_at;
    public string $created_at;
} 