<?php

namespace App\models;

use App\database\Database;
use Exception;
use PDO;

class Bank {
    private ?PDO $pdo;

    /**
     * @throws Exception
     */
    public function __construct() {
        $this->pdo = Database::getInstance()->getConnection();
    }

    // CREATE: Add a new bank to the database
    public function create(string $bank_name, string $bank_code, string $swift_code) {
        $sql = "INSERT INTO banks (bank_name, bank_code, swift_code) VALUES (:bank_name, :bank_code, :swift_code)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'bank_name' => $bank_name,
            'bank_code' => $bank_code,
            'swift_code' => $swift_code
        ]);
    }

    // READ: Get a single bank by ID
    public function getBankById(int $bank_id) {
        $sql = "SELECT * FROM banks WHERE bank_id = :bank_id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['bank_id' => $bank_id]); // Fix: use 'bank_id' for parameter
        return $stmt->fetch(PDO::FETCH_ASSOC); // Return the result
    }

    // READ: Get all banks
    public function getAll() {
        $sql = "SELECT * FROM banks";
        return $this->pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    // UPDATE: Update bank information by bank_id
    public function update(int $bank_id, string $bank_name, string $bank_code, string $swift_code) {
        $sql = "UPDATE banks SET bank_name = :bank_name, bank_code = :bank_code, swift_code = :swift_code WHERE bank_id = :bank_id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'bank_name' => $bank_name,
            'bank_code' => $bank_code,
            'swift_code' => $swift_code,
            'bank_id' => $bank_id
        ]);
    }

    // DELETE: Delete a bank by bank_id
    public function delete(int $bank_id) {
        $sql = "DELETE FROM banks WHERE bank_id = :bank_id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['bank_id' => $bank_id]);
    }
}
