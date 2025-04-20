<?php

namespace App\models;

use App\database\Database;
use PDO;

class Transaction {
    private ?PDO $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance()->getConnection();
    }

    public function createTransaction(array $data): int {
        $fields = [
            'sender_user_id',
            'receiver_user_id',
            'amount',
            'transaction_type',
            'sender_bank_id',
            'receiver_bank_id',
            'sender_account_number',
            'receiver_account_number',
            'ipa_used',
            'ipa_id',
            'iban_used',
            'iban',
            'phone_number_used',
            'phone_number',
            'card_number_used',
            'card_number',
        ];

        $columns = implode(', ', $fields);
        $placeholders = implode(', ', array_map(fn($f) => ":$f", $fields));

        $sql = "INSERT INTO transactions ($columns) VALUES ($placeholders)";
        $stmt = $this->pdo->prepare($sql);

        // Extract only the expected fields
        $filteredData = array_intersect_key($data, array_flip($fields));

        $stmt->execute($filteredData);
        return (int)$this->pdo->lastInsertId();
    }


    public function getAll(): array {
        $sql = "SELECT * FROM transactions ORDER BY transaction_time DESC";
        return $this->pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAllByUserId(int $user_id): array {
        $sql = "SELECT * FROM transactions 
                WHERE sender_user_id = :user_id OR receiver_user_id = :user_id 
                ORDER BY transaction_time DESC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['user_id' => $user_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
