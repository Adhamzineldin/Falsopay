<?php


namespace App\models;

use PDO;

class Transaction {
    private ?PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function create(int $sender_user_id, int $receiver_user_id, float $amount, string $transaction_type, int $sender_bank_id, int $receiver_bank_id, bool $ipa_used, int $ipa_id, string $status) {
        $sql = "INSERT INTO transactions (sender_user_id, receiver_user_id, amount, transaction_type, sender_bank_id, receiver_bank_id, ipa_used, ipa_id, status) 
                VALUES (:sender_user_id, :receiver_user_id, :amount, :transaction_type, :sender_bank_id, :receiver_bank_id, :ipa_used, :ipa_id, :status)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'sender_user_id' => $sender_user_id,
            'receiver_user_id' => $receiver_user_id,
            'amount' => $amount,
            'transaction_type' => $transaction_type,
            'sender_bank_id' => $sender_bank_id,
            'receiver_bank_id' => $receiver_bank_id,
            'ipa_used' => $ipa_used,
            'ipa_id' => $ipa_id,
            'status' => $status
        ]);
    }

    public function getAll() {
        $sql = "SELECT * FROM transactions";
        return $this->pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }
}

