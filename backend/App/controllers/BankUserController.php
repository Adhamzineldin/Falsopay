<?php

namespace App\controllers;

use App\models\BankUser;
use JetBrains\PhpStorm\NoReturn;

class BankUserController {

    #[NoReturn] public static function createBankUser(array $data): void {
        $required = ['first_name', 'last_name', 'email', 'phone_number', 'date_of_birth'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                self::json(['error' => "Missing required field: $field"], 400);
            }
        }

        $model = new BankUser();
        $model->create(
            $data['first_name'],
            $data['last_name'],
            $data['email'],
            $data['phone_number'],
            $data['date_of_birth']
        );

        self::json(['success' => true]);
    }

    #[NoReturn] public static function getAllBankUsers(): void {
        $model = new BankUser();
        $users = $model->getAll();
        self::json($users);
    }

    #[NoReturn] public static function getBankUser(int $id): void {
        $model = new BankUser();
        $user = $model->getById($id);
        $user ? self::json($user) : self::json(['error' => 'Not found'], 404);
    }

    #[NoReturn] public static function updateBankUser(int $id, array $data): void {
        $model = new BankUser();
        $success = $model->update($id, $data);
        self::json(['success' => $success]);
    }

    #[NoReturn] public static function deleteBankUser(int $id): void {
        $model = new BankUser();
        $success = $model->delete($id);
        self::json(['success' => $success]);
    }

    #[NoReturn] private static function json($data, int $code = 200): void {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
}
