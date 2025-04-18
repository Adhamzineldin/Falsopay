<?php


namespace App\models;

use PDO;

class Card {
    private ?PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function create(int $bank_user_id, int $bank_id, string $card_number, string $expiration_date, string $cvv, string $card_type) {
        $sql = "INSERT INTO cards (bank_user_id, bank_id, card_number, expiration_date, cvv, card_type) VALUES (:bank_user_id, :bank_id, :card_number, :expiration_date, :cvv, :card_type)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'bank_user_id' => $bank_user_id,
            'bank_id' => $bank_id,
            'card_number' => $card_number,
            'expiration_date' => $expiration_date,
            'cvv' => $cvv,
            'card_type' => $card_type
        ]);
    }

    public function getAll() {
        $sql = "SELECT * FROM cards";
        return $this->pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }
}
