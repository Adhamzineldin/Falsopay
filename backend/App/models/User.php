<?php


namespace App\models;

use PDO;

class User {
    private ?PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function create(string $first_name, string $last_name, string $email, string $phone_number, int $default_account) {
        $sql = "INSERT INTO users (first_name, last_name, email, phone_number, Default_Account) VALUES (:first_name, :last_name, :email, :phone_number, :default_account)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'first_name' => $first_name,
            'last_name' => $last_name,
            'email' => $email,
            'phone_number' => $phone_number,
            'default_account' => $default_account
        ]);
    }

    public function getAll() {
        $sql = "SELECT * FROM users";
        return $this->pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }
}
