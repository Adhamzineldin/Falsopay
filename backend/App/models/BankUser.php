<?php


namespace App\models;

use PDO;

class BankUser {
    private ?PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function create(string $first_name, string $last_name, string $email, string $phone_number, string $date_of_birth) {
        $sql = "INSERT INTO bank_users (first_name, last_name, email, phone_number, date_of_birth) VALUES (:first_name, :last_name, :email, :phone_number, :date_of_birth)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'first_name' => $first_name,
            'last_name' => $last_name,
            'email' => $email,
            'phone_number' => $phone_number,
            'date_of_birth' => $date_of_birth
        ]);
    }

    public function getAll() {
        $sql = "SELECT * FROM bank_users";
        return $this->pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }
}
