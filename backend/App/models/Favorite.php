<?php

namespace App\models;

use App\database\Database;
use Exception;
use PDO;

class Favorite
{
    private ?PDO $pdo;

    /**
     * @throws Exception
     */
    public function __construct()
    {
        $this->pdo = Database::getInstance()->getConnection();
    }

    /**
     * Create a new favorite
     * 
     * @throws Exception
     */
    public function createFavorite(int $userId, string $recipientIdentifier, string $recipientName, string $method, ?int $bankId = null): array
    {
        $sql = "INSERT INTO favorites (user_id, recipient_identifier, recipient_name, method, bank_id)
                VALUES (:user_id, :recipient_identifier, :recipient_name, :method, :bank_id)";

        $stmt = $this->pdo->prepare($sql);
        $status = $stmt->execute([
            'user_id' => $userId,
            'recipient_identifier' => $recipientIdentifier,
            'recipient_name' => $recipientName,
            'method' => $method,
            'bank_id' => $bankId
        ]);

        if ($status) {
            $favoriteId = $this->pdo->lastInsertId();
            return $this->getFavoriteById($favoriteId);
        } else {
            throw new Exception("Failed to create favorite.");
        }
    }

    /**
     * Get a favorite by ID
     */
    public function getFavoriteById(int $id): ?array
    {
        $sql = "SELECT * FROM favorites WHERE favorite_id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['id' => $id]);
        $favorite = $stmt->fetch(PDO::FETCH_ASSOC);
        return $favorite ?: null;
    }

    /**
     * Get all favorites for a user
     */
    public function getFavoritesByUserId(int $userId): array
    {
        $sql = "SELECT f.*, b.bank_name 
                FROM favorites f 
                LEFT JOIN banks b ON f.bank_id = b.bank_id 
                WHERE f.user_id = :user_id 
                ORDER BY f.created_at DESC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['user_id' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get favorites for a user filtered by method
     */
    public function getFavoritesByMethod(int $userId, string $method): array
    {
        $sql = "SELECT f.*, b.bank_name 
                FROM favorites f 
                LEFT JOIN banks b ON f.bank_id = b.bank_id 
                WHERE f.user_id = :user_id AND f.method = :method 
                ORDER BY f.created_at DESC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'user_id' => $userId,
            'method' => $method
        ]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Update a favorite
     * 
     * @throws Exception
     */
    public function updateFavorite(int $id, array $fields): bool
    {
        if (empty($fields)) {
            throw new Exception("No fields provided to update.");
        }

        $set = [];
        $params = ['id' => $id];

        // Filter out favorite_id and user_id from fields to update
        $allowedFields = ['recipient_identifier', 'recipient_name', 'method', 'bank_id'];
        $filteredFields = array_intersect_key($fields, array_flip($allowedFields));

        if (empty($filteredFields)) {
            throw new Exception("No valid fields provided to update.");
        }

        foreach ($filteredFields as $key => $value) {
            $set[] = "$key = :$key";
            $params[$key] = $value;
        }

        $sql = "UPDATE favorites SET " . implode(', ', $set) . " WHERE favorite_id = :id";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Delete a favorite
     */
    public function deleteFavorite(int $id): bool
    {
        $sql = "DELETE FROM favorites WHERE favorite_id = :id";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }

    /**
     * Check if a favorite exists for a user with the given identifier and method
     */
    public function favoriteExists(int $userId, string $recipientIdentifier, string $method): bool
    {
        $sql = "SELECT COUNT(*) FROM favorites 
                WHERE user_id = :user_id 
                AND recipient_identifier = :recipient_identifier 
                AND method = :method";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'user_id' => $userId,
            'recipient_identifier' => $recipientIdentifier,
            'method' => $method
        ]);
        return $stmt->fetchColumn() > 0;
    }
} 