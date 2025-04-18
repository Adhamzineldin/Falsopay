<?php

namespace App\models;

use App\database\Database;
use PDO;

class User
{
    private ?PDO $pdo;

// Constructor now accepts a PDO instance directly, instead of using Database::getInstance()

    /**
     * @throws \Exception
     */
    public function __construct()
    {
        $this->pdo = Database::getInstance()->getConnection();
    }

    public function create(string $first_name, string $last_name, string $email, string $phone_number, int $default_account): bool
    {
        $sql = "INSERT INTO users (first_name, last_name, email, phone_number, Default_Account)
        VALUES (:first_name, :last_name, :email, :phone_number, :default_account)";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([
            'first_name' => $first_name,
            'last_name' => $last_name,
            'email' => $email,
            'phone_number' => $phone_number,
            'default_account' => $default_account
        ]);
    }

    public function getAllUsers(): array
    {
        $sql = "SELECT * FROM users";
        return $this->pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById(int $id): ?array
    {
        $sql = "SELECT * FROM users WHERE user_id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['id' => $id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user ?: null;
    }

    public function getByEmail(string $email): ?array
    {
        $sql = "SELECT * FROM users WHERE email = :email";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user ?: null;
    }

    public function update(int $id, array $fields): bool
    {
        $set = [];
        $params = ['id' => $id];

        foreach ($fields as $key => $value) {
            $set[] = "$key = :$key";
            $params[$key] = $value;
        }

        $sql = "UPDATE users SET " . implode(', ', $set) . " WHERE user_id = :id";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($params);
    }

    public function delete(int $id): bool
    {
        $sql = "DELETE FROM users WHERE user_id = :id";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }

    public function existsByEmail(string $email): bool
    {
        $sql = "SELECT COUNT(*) FROM users WHERE email = :email";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['email' => $email]);
        return $stmt->fetchColumn() > 0;
    }

    public function setDefaultAccount(int $userId, int $accountId): bool
    {
        $sql = "UPDATE users SET Default_Account = :accountId WHERE user_id = :userId";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([
            'accountId' => $accountId,
            'userId' => $userId
        ]);
    }

    public function getDefaultAccount(int $userId): ?int
    {
        $sql = "SELECT Default_Account FROM users WHERE user_id = :userId";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['userId' => $userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? (int)$result['Default_Account'] : null;
    }
}
