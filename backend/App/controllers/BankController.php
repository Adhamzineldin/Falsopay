<?php

namespace App\controllers;

use App\models\Bank;
use Exception;
use JetBrains\PhpStorm\NoReturn;

class BankController
{
    #[NoReturn] public static function createBank(array $data): void
    {
        $bankModel = new Bank();
        // Validate required fields
        $requiredFields = ['bank_name', 'bank_code', 'swift_code'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) {
                self::json(['error' => "Missing required field: $field"], 400);
            }
        }

        // Create the bank
        $bankModel->create(
            $data['bank_name'],
            $data['bank_code'],
            $data['swift_code']
        );

        self::json(['success' => true]);
    }

    #[NoReturn] public static function getAllBanks(): void
    {
        $bankModel = new Bank();
        $banks = $bankModel->getAll();
        self::json($banks);
    }

    #[NoReturn] public static function getBankById(int $id): void
    {
        $bankModel = new Bank();
        $bank = $bankModel->getBankById($id);
        $bank ? self::json($bank) : self::json(['error' => 'Bank not found'], 404);
    }

    #[NoReturn] public static function updateBank(int $id, array $data): void
    {
        $bankModel = new Bank();

        // Validate required fields for update
        $requiredFields = ['bank_name', 'bank_code', 'swift_code'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) {
                self::json(['error' => "Missing required field: $field"], 400);
            }
        }

        $bankModel->update($id, $data['bank_name'], $data['bank_code'], $data['swift_code']);
        self::json(['success' => true]);
    }

    #[NoReturn] public static function deleteBank(int $id): void
    {
        $bankModel = new Bank();
        $bankModel->delete($id);
        self::json(['success' => true]);
    }

    #[NoReturn] private static function json($data, int $code = 200): void
    {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
}
