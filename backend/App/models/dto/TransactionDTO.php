<?php

namespace App\models\dto;

/**
 * Data Transfer Object for Transaction
 */
class TransactionDTO
{
    public ?int $transaction_id = null;
    public ?int $sender_user_id = null;
    public ?int $receiver_user_id = null;
    public ?string $sender_name = null;
    public ?string $receiver_name = null;
    public float $amount;
    public ?int $sender_bank_id = null;
    public ?int $receiver_bank_id = null;
    public ?string $sender_account_number = null;
    public ?string $receiver_account_number = null;
    public string $transaction_time;
    public ?string $sender_ipa_address = null;
    public ?string $receiver_ipa_address = null;
    public ?string $receiver_phone = null;
    public ?string $receiver_card = null;
    public ?string $receiver_iban = null;
    public string $transfer_method;
} 