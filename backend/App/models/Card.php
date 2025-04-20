<?php

namespace App\models;

use App\database\Database;
use Exception;
use PDO;

class Card {
    private ?PDO $pdo;

    /**
     * @throws Exception
     */
    public function __construct() {
        $this->pdo = Database::getInstance()->getConnection();
    }

    public function getAll(): array {
        $sql = "SELECT * FROM cards";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create(int $bank_id, string $card_number, string $expiration_date, string $cvv, string $card_type, string $pin): void {
        $hashedPin = password_hash($pin, PASSWORD_BCRYPT);

        $sql = "INSERT INTO cards (bank_id, card_number, expiration_date, cvv, card_type, pin)
                VALUES (:bank_id, :card_number, :expiration_date, :cvv, :card_type, :pin)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'bank_id' => $bank_id,
            'card_number' => $card_number,
            'expiration_date' => $expiration_date,
            'cvv' => $cvv,
            'card_type' => $card_type,
            'pin' => $hashedPin
        ]);
    }

    public function verifyPin(int $bank_id, string $card_number, string $enteredPin): bool {
        $sql = "SELECT pin FROM cards WHERE bank_id = :bank_id AND card_number = :card_number";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'bank_id' => $bank_id,
            'card_number' => $card_number
        ]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$result || !isset($result['pin'])) {
            return false;
        }

        return password_verify($enteredPin, $result['pin']);
    }

    public function getAllByBank(int $bank_id): array {
        $sql = "SELECT * FROM cards WHERE bank_id = :bank_id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['bank_id' => $bank_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getByBankAndCardNumber(int $bank_id, string $card_number): ?array {
        $sql = "SELECT * FROM cards WHERE bank_id = :bank_id AND card_number = :card_number";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'bank_id' => $bank_id,
            'card_number' => $card_number
        ]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function update(int $bank_id, string $card_number, array $fields): bool {
        $columns = [];
        foreach ($fields as $key => $value) {
            if ($key === 'pin') {
                $value = password_hash($value, PASSWORD_BCRYPT);
                $fields[$key] = $value;
            }
            $columns[] = "$key = :$key";
        }

        $sql = "UPDATE cards SET " . implode(', ', $columns) . " WHERE bank_id = :bank_id AND card_number = :card_number";
        $stmt = $this->pdo->prepare($sql);
        $fields['bank_id'] = $bank_id;
        $fields['card_number'] = $card_number;
        return $stmt->execute($fields);
    }

    public function delete(int $bank_id, string $card_number): bool {
        $sql = "DELETE FROM cards WHERE bank_id = :bank_id AND card_number = :card_number";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'bank_id' => $bank_id,
            'card_number' => $card_number
        ]);
        return $stmt->rowCount() > 0;
    }
}
