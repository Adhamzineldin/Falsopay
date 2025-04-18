<?php


namespace App\models;

use PDO;

class InstantPaymentAddress {
    private ?PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function create(int $bank_id, string $account_id, string $ipa_address) {
        $sql = "INSERT INTO instant_payment_addresses (bank_id, account_id, ipa_address) VALUES (:bank_id, :account_id, :ipa_address)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'bank_id' => $bank_id,
            'account_id' => $account_id,
            'ipa_address' => $ipa_address
        ]);
    }

    public function getAll() {
        $sql = "SELECT * FROM instant_payment_addresses";
        return $this->pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }
}
