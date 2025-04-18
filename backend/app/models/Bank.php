<?php

namespace App\models;

use PDO;

class Bank {
private ?PDO $pdo;

public function __construct(PDO $pdo) {
$this->pdo = $pdo;
}

public function create(string $bank_name, string $bank_code, string $swift_code) {
$sql = "INSERT INTO banks (bank_name, bank_code, swift_code) VALUES (:bank_name, :bank_code, :swift_code)";
$stmt = $this->pdo->prepare($sql);
$stmt->execute(['bank_name' => $bank_name, 'bank_code' => $bank_code, 'swift_code' => $swift_code]);
}

public function getAll() {
$sql = "SELECT * FROM banks";
return $this->pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
}
}
