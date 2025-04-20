<?php

namespace App\models;

use App\database\Database;
use PDO;

class InstantPaymentAddress {
    private ?PDO $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance()->getConnection();
    }

    // Create a new IPA
    public function create(int $bank_id, string $account_number, string $ipa_address, int $user_id, string $pin) {
        $hashedPin = password_hash($pin, PASSWORD_BCRYPT);

        $sql = "INSERT INTO instant_payment_addresses (bank_id, account_number, ipa_address, user_id, pin) 
            VALUES (:bank_id, :account_number, :ipa_address, :user_id, :pin)";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'bank_id' => $bank_id,
            'account_number' => $account_number,
            'ipa_address' => $ipa_address,
            'user_id' => $user_id,
            'pin' => $hashedPin // Store the hashed PIN
        ]);
    }


    // Get all IPAs
    public function getAll(): array {
        $sql = "SELECT * FROM instant_payment_addresses";
        $stmt = $this->pdo->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get all IPAs by bank_id
    public function getAllByBank(int $bank_id): array {
        $sql = "SELECT * FROM instant_payment_addresses WHERE bank_id = :bank_id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['bank_id' => $bank_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get all IPAs by user_id
    public function getAllByUserId(int $user_id): array {
        $sql = "SELECT * FROM instant_payment_addresses WHERE user_id = :user_id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['user_id' => $user_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get IPA by bank_id and account_number
    public function getByBankAndAccount(int $bank_id, string $account_number): ?array {
        $sql = "SELECT * FROM instant_payment_addresses WHERE bank_id = :bank_id AND account_number = :account_number";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'bank_id' => $bank_id,
            'account_number' => $account_number
        ]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    // Get IPA by ipa_address
    public function getByIpaAddress(string $ipa_address): ?array {
        $sql = "SELECT * FROM instant_payment_addresses WHERE ipa_address = :ipa_address";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['ipa_address' => $ipa_address]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function getByIpaId(?int $ipa_id): ?array {
        $sql = "SELECT * FROM instant_payment_addresses WHERE ipa_id = :ipa_id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['ipa_id' => $ipa_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }
    

    // Update IPA by bank_id and account_number
    public function update(int $bank_id, string $account_number, string $ipa_address): bool {
        $sql = "UPDATE instant_payment_addresses SET ipa_address = :ipa_address 
                WHERE bank_id = :bank_id AND account_number = :account_number";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([
            'bank_id' => $bank_id,
            'account_number' => $account_number,
            'ipa_address' => $ipa_address
        ]);
    }

    // Delete IPA by bank_id and account_number
    public function delete(int $bank_id, string $account_number): bool {
        $sql = "DELETE FROM instant_payment_addresses WHERE bank_id = :bank_id AND account_number = :account_number";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'bank_id' => $bank_id,
            'account_number' => $account_number
        ]);
        return $stmt->rowCount() > 0;
    }

    // Delete all IPAs by user_id
    public function deleteByUserId(int $user_id): bool {
        $sql = "DELETE FROM instant_payment_addresses WHERE user_id = :user_id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['user_id' => $user_id]);
        return $stmt->rowCount() > 0;
    }



    // Get hashed PIN by ipa_address
    public function getHashedPin(string $ipa_address): ?string {
        $sql = "SELECT pin FROM instant_payment_addresses WHERE ipa_address = :ipa_address";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['ipa_address' => $ipa_address]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? $result['pin'] : null;
    }

    // Get hashed PIN by ipa_address
    public function verifyPin(string $ipa_address, string $enteredPin): bool {
        $hashedPin = $this->getHashedPin($ipa_address);
        error_log("Entered PIN: " . $enteredPin);
        error_log("Hashed PIN from DB: " . $hashedPin);

        return $hashedPin && password_verify($enteredPin, $hashedPin);
    }




}
