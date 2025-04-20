<?php

namespace App\models;

use App\database\Database;
use Exception;
use PDO;

class User
{
    private ?PDO $pdo;

// Constructor now accepts a PDO instance directly, instead of using Database::getInstance()

    /**
     * @throws Exception
     */
    public function __construct()
    {
        $this->pdo = Database::getInstance()->getConnection();
    }

    public function createUser(string $first_name, string $last_name, string $email, string $phone_number, ?int $default_account = null): bool
    {
        // Modify the SQL query to include the default_account column and allow NULL for it
        
        
        $sql = "INSERT INTO users (first_name, last_name, email, phone_number, default_account)
            VALUES (:first_name, :last_name, :email, :phone_number, :default_account)";

        $stmt = $this->pdo->prepare($sql);

        // Bind parameters and pass null if default_account is null
        return $stmt->execute([
            'first_name'   => $first_name,
            'last_name'    => $last_name,
            'email'        => $email,
            'phone_number' => $phone_number,
            'default_account' => $default_account 
        ]);
    }



    public function getAllUsers(): array
    {
        $sql = "SELECT * FROM users";
        return $this->pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getUserById(int $id): ?array
    {
        $sql = "SELECT * FROM users WHERE user_id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['id' => $id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user ?: null;
    }

    public function getUserByPhoneNumber(string $phone_number): ?array
    {
        $sql = "SELECT * FROM users WHERE phone_number = :phone_number";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['phone_number' => $phone_number]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user ?: null;
    }
    
    
    

    public function getUserByEmail(string $email): ?array
    {
        $sql = "SELECT * FROM users WHERE email = :email";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user ?: null;
    }

    /**
     * @throws Exception
     */
    public function updateUser(int $id, array $fields): bool
    {
        
        // Validate if the $fields array has at least one field to update
        if (empty($fields)) {
            throw new Exception("No fields provided to update.");
        }

        $set = [];
        $params = ['id' => $id];

        // Loop through the $fields and create the SET clause
        foreach ($fields as $key => $value) {
            // Check if the column exists in the database before proceeding
            if (!in_array($key, ['first_name', 'last_name', 'email', 'phone_number', 'default_account'])) {
                throw new Exception("Invalid column name: $key");
            }

            $set[] = "$key = :$key";
            $params[$key] = $value;
        }

        // Create the SQL query
        $sql = "UPDATE users SET " . implode(', ', $set) . " WHERE user_id = :id";
        
        // Prepare and execute the query
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($params);
    }


    public function deleteUser(int $id): bool
    {
        $sql = "DELETE FROM users WHERE user_id = :id";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }

    public function existsByPhoneNumber(string $phone_number): bool
    {
        $sql = "SELECT COUNT(*) FROM users WHERE phone_number = :phone_number";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['phone_number' => $phone_number]);
        return $stmt->fetchColumn() > 0;
    }

    public function setDefaultAccount(int $userId, ?int $accountId): bool
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
