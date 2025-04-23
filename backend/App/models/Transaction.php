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
        // Updated fields based on the new schema
        $fields = [
            'sender_user_id',
            'receiver_user_id',
            'sender_name',
            'receiver_name',
            'amount',
            'sender_bank_id',
            'receiver_bank_id',
            'sender_account_number',
            'receiver_account_number',
            'status',
            'currency',
            'transaction_time',
            'sender_ipa_address',
            'receiver_ipa_address',
            'receiver_phone',
            'receiver_card',
            'receiver_iban',
            'transfer_method',
            'pin'
        ];

        // Prepare column names and placeholders for insertion
        $columns = implode(', ', $fields);
        $placeholders = implode(', ', array_map(fn($f) => ":$f", $fields));

        // Insert query
        $sql = "INSERT INTO transactions ($columns) VALUES ($placeholders)";
        $stmt = $this->pdo->prepare($sql);

        // Extract only the expected fields from $data
        $filteredData = array_intersect_key($data, array_flip($fields));

        // Execute the query with the filtered data
        $stmt->execute($filteredData);

        // Return the ID of the inserted transaction
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
