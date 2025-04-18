<?php


namespace App\models;

use PDO;

class BankAccount {
    private ?PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    /**
     * Create a new bank account in the database
     * @param int $bank_id
     * @param string $account_number
     * @param int $bank_user_id
     * @param string $iban
     * @param string $status
     * @param string $type
     * @param float $balance
     */
    public function create(int $bank_id, string $account_number, int $bank_user_id, string $iban, string $status, string $type, float $balance) {
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

    /**
     * Get all bank accounts from the database
     * @return array
     */
    public function getAll() {
        $sql = "SELECT * FROM bank_accounts";
        return $this->pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Add balance to a specific bank account
     * @param string $account_number
     * @param float $amount
     * @return bool
     */
    public function addBalance(string $account_number, float $amount): bool {
        $sql = "UPDATE bank_accounts SET balance = balance + :amount WHERE account_number = :account_number";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':amount', $amount);
        $stmt->bindParam(':account_number', $account_number);

        return $stmt->execute();
    }

    /**
     * Subtract balance from a specific bank account
     * @param string $account_number
     * @param float $amount
     * @return bool
     */
    public function subtractBalance(string $account_number, float $amount): bool {
        $sql = "UPDATE bank_accounts SET balance = balance - :amount WHERE account_number = :account_number";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':amount', $amount);
        $stmt->bindParam(':account_number', $account_number);

        return $stmt->execute();
    }

    /**
     * Get the balance of a specific bank account
     * @param string $account_number
     * @return float|null
     */
    public function getBalance(string $account_number): ?float {
        $sql = "SELECT balance FROM bank_accounts WHERE account_number = :account_number";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':account_number', $account_number);
        $stmt->execute();

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? (float)$result['balance'] : null;
    }
}


