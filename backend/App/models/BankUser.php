<?php

namespace App\models;

use App\database\Database;
use Exception;
use PDO;

class BankUser {
    private ?PDO $pdo;

    /**
     * @throws Exception
     */
    public function __construct() {
        $this->pdo = Database::getInstance()->getConnection();
    }

    public function create(string $first_name, string $last_name, string $email, string $phone_number, string $date_of_birth): void {
        $sql = "INSERT INTO bank_users (first_name, last_name, email, phone_number, date_of_birth)
                VALUES (:first_name, :last_name, :email, :phone_number, :date_of_birth)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'first_name' => $first_name,
            'last_name' => $last_name,
            'email' => $email,
            'phone_number' => $phone_number,
            'date_of_birth' => $date_of_birth
        ]);
    }

    public function getAll(): array {
        $sql = "SELECT * FROM bank_users";
        return $this->pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById(int $id): ?array {
        $sql = "SELECT * FROM bank_users WHERE bank_user_id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function getByPhoneNumber(int $phoneNumber): ?array {
        $sql = "SELECT * FROM bank_users WHERE phone_number = :phoneNumber";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':phoneNumber', $phoneNumber);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }
    
    

    public function update(int $id, array $fields): bool {
        $columns = [];
        foreach ($fields as $key => $value) {
            $columns[] = "$key = :$key";
        }

        $sql = "UPDATE bank_users SET " . implode(', ', $columns) . " WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $fields['id'] = $id;
        return $stmt->execute($fields);
    }

    public function delete(int $id): bool {
        $sql = "DELETE FROM bank_users WHERE bank_user_id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }
}
