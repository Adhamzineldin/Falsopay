<?php

namespace App\models;

use App\database\Database;
use PDO;
use PDOException;

class MoneyRequest {
    private $pdo;

    public function __construct() {
        $database = Database::getInstance();
        $this->pdo = $database->getConnection();
    }

    /**
     * Create a new money request
     * 
     * @param array $requestData
     * @return array|bool
     */
    public function createRequest($requestData) {
        try {
            $stmt = $this->pdo->prepare("
                INSERT INTO money_requests (
                    requester_user_id, requested_user_id, requester_name, requested_name,
                    amount, requester_ipa_address, requested_ipa_address, message, status
                ) VALUES (
                    :requester_user_id, :requested_user_id, :requester_name, :requested_name,
                    :amount, :requester_ipa_address, :requested_ipa_address, :message, 'pending'
                )
            ");

            $stmt->execute([
                ':requester_user_id' => $requestData['requester_user_id'],
                ':requested_user_id' => $requestData['requested_user_id'],
                ':requester_name' => $requestData['requester_name'],
                ':requested_name' => $requestData['requested_name'],
                ':amount' => $requestData['amount'],
                ':requester_ipa_address' => $requestData['requester_ipa_address'],
                ':requested_ipa_address' => $requestData['requested_ipa_address'],
                ':message' => $requestData['message'] ?? null
            ]);

            $requestId = $this->pdo->lastInsertId();
            return $this->getRequestById($requestId);
        } catch (PDOException $e) {
            error_log("Error creating money request: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get a money request by ID
     * 
     * @param int $requestId
     * @return array|bool
     */
    public function getRequestById($requestId) {
        try {
            $stmt = $this->pdo->prepare("
                SELECT * FROM money_requests WHERE request_id = :request_id
            ");
            $stmt->execute([':request_id' => $requestId]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error getting money request: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get all pending money requests for a user
     * 
     * @param int $userId
     * @return array|bool
     */
    public function getPendingRequestsForUser($userId) {
        try {
            $stmt = $this->pdo->prepare("
                SELECT * FROM money_requests 
                WHERE requested_user_id = :user_id 
                AND status = 'pending'
                ORDER BY created_at DESC
            ");
            $stmt->execute([':user_id' => $userId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error getting pending money requests: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get all money requests for a user (both sent and received)
     * 
     * @param int $userId
     * @return array|bool
     */
    public function getAllRequestsForUser($userId) {
        try {
            $stmt = $this->pdo->prepare("
                SELECT * FROM money_requests 
                WHERE requester_user_id = :user_id OR requested_user_id = :user_id
                ORDER BY created_at DESC
            ");
            $stmt->execute([':user_id' => $userId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error getting all money requests: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Update a money request status
     * 
     * @param int $requestId
     * @param string $status
     * @param int|null $transactionId
     * @return bool
     */
    public function updateRequestStatus($requestId, $status, $transactionId = null) {
        try {
            error_log("Updating money request status: Request ID: $requestId, Status: $status, Transaction ID: " . ($transactionId ?? 'null'));

            $sql = "UPDATE money_requests SET status = :status, updated_at = NOW()";
            $params = [
                ':request_id' => $requestId,
                ':status' => $status
            ];

            if ($transactionId !== null) {
                $sql .= ", transaction_id = :transaction_id";
                $params[':transaction_id'] = $transactionId;
            }

            $sql .= " WHERE request_id = :request_id";
            
            error_log("SQL query: $sql");
            error_log("Parameters: " . json_encode($params));

            $stmt = $this->pdo->prepare($sql);
            $result = $stmt->execute($params);
            
            // Check affected rows to confirm update worked
            $rowCount = $stmt->rowCount();
            error_log("Update result: " . ($result ? 'true' : 'false') . ", Rows affected: $rowCount");
            
            return $result && $rowCount > 0;
        } catch (PDOException $e) {
            error_log("Error updating money request status: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Find a money request by requested IPA
     * 
     * @param string $ipaAddress
     * @return array|bool
     */
    public function findRequestByIPA($ipaAddress) {
        try {
            $stmt = $this->pdo->prepare("
                SELECT * FROM money_requests 
                WHERE requested_ipa_address = :ipa_address
                ORDER BY created_at DESC
            ");
            $stmt->execute([':ipa_address' => $ipaAddress]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error finding money request by IPA: " . $e->getMessage());
            return false;
        }
    }
} 