<?php

namespace App\models;

use App\database\Database;
use PDO;

class BankAccount {
    private ?PDO $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance()->getConnection();
    }

    public function create(int $bank_id, string $account_number, int $bank_user_id, string $iban, string $status, string $type, float $balance): void {
        $sql = "INSERT INTO bank_accounts (bank_id, account_number, bank_user_id, iban, status, type, balance)
                VALUES (:bank_id, :account_number, :bank_user_id, :iban, :status, :type, :balance)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'bank_id' => $bank_id,
            'account_number' => $account_number,
            'bank_user_id' => $bank_user_id,
            'iban' => $iban,
            'status' => $status,
            'type' => $type,
            'balance' => $balance
        ]);
    }

    public function getAll(): array {
        $sql = "SELECT * FROM bank_accounts";
        return $this->pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getByCompositeKey(int $bank_id, string $account_number): ?array {
        $sql = "SELECT * FROM bank_accounts WHERE bank_id = :bank_id AND account_number = :account_number";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'bank_id' => $bank_id,
            'account_number' => $account_number
        ]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    public function getByIban(string $iban): ?array {
        $sql = "SELECT * FROM bank_accounts WHERE iban = :iban";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':iban', $iban);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function getAllByUserId(int $userId): array {
        $sql = "SELECT * FROM bank_accounts WHERE bank_user_id = :user_id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getAllByUserAndBankId(int $userId, int $bankId): array {
        $sql = "SELECT * FROM bank_accounts WHERE bank_user_id = :user_id AND bank_id = :bank_id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':user_id', $userId);
        $stmt->bindParam(':bank_id', $bankId);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function update(int $bank_id, string $account_number, array $fields): bool {
        $columns = [];
        foreach ($fields as $key => $value) {
            $columns[] = "$key = :$key";
        }

        $sql = "UPDATE bank_accounts SET " . implode(', ', $columns) . " WHERE bank_id = :bank_id AND account_number = :account_number";
        $stmt = $this->pdo->prepare($sql);
        $fields['bank_id'] = $bank_id;
        $fields['account_number'] = $account_number;
        return $stmt->execute($fields);
    }

    public function delete(int $bank_id, string $account_number): bool {
        $sql = "DELETE FROM bank_accounts WHERE bank_id = :bank_id AND account_number = :account_number";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':bank_id', $bank_id);
        $stmt->bindParam(':account_number', $account_number);
        return $stmt->execute();
    }

    public function addBalance(int $bank_id, string $account_number, float $amount): bool {
        $sql = "UPDATE bank_accounts SET balance = balance + :amount WHERE bank_id = :bank_id AND account_number = :account_number";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':amount', $amount);
        $stmt->bindParam(':bank_id', $bank_id);
        $stmt->bindParam(':account_number', $account_number);
        return $stmt->execute();
    }

    public function subtractBalance(int $bank_id, string $account_number, float $amount): bool {
        $sql = "UPDATE bank_accounts SET balance = balance - :amount WHERE bank_id = :bank_id AND account_number = :account_number";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':amount', $amount);
        $stmt->bindParam(':bank_id', $bank_id);
        $stmt->bindParam(':account_number', $account_number);
        return $stmt->execute();
    }

    public function getBalance(int $bank_id, string $account_number): ?float {
        $sql = "SELECT balance FROM bank_accounts WHERE bank_id = :bank_id AND account_number = :account_number";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':bank_id', $bank_id);
        $stmt->bindParam(':account_number', $account_number);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? (float)$result['balance'] : null;
    }
}
