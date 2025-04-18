<?php

namespace App\controllers;

use App\models\User;

class UserController
{

    public static function createUser(array $data): void
    {
        $userModel = new User();

        if (!self::validateCreate($data)) {
            self::json(['error' => 'Missing or invalid fields'], 400);
        }

        $success = $userModel->create(
            $data['first_name'],
            $data['last_name'],
            $data['email'],
            $data['phone_number'],
            $data['default_account']
        );

        self::json(['success' => $success]);
    }

    public static function getAllUsers(): void
    {
        $userModel = new User();
        $users = $userModel->getAllUsers();
        self::json($users);
    }

    public static function getUserById(int $id): void
    {
        $userModel = new User();
        $user = $userModel->getById($id);
        $user ? self::json($user) : self::json(['error' => 'User not found'], 404);
    }

    public static function getUserByEmail(string $email): void
    {
        $userModel = new User();
        $user = $userModel->getByEmail($email);
        $user ? self::json($user) : self::json(['error' => 'User not found'], 404);
    }

    public static function updateUser(int $id, array $data): void
    {
        $userModel = new User();
        $success = $userModel->update($id, $data);
        self::json(['success' => $success]);
    }

    public static function deleteUser(int $id): void
    {
        $userModel = new User();
        $success = $userModel->delete($id);
        self::json(['success' => $success]);
    }

    public static function checkUserExistsByEmail(string $email): void
    {
        $userModel = new User();
        $exists = $userModel->existsByEmail($email);
        self::json(['exists' => $exists]);
    }

    public static function setDefaultAccount(int $userId, int $accountId): void
    {
        $userModel = new User();
        $success = $userModel->setDefaultAccount($userId, $accountId);
        self::json(['success' => $success]);
    }

    public static function getDefaultAccount(int $userId): void
    {
        $userModel = new User();
        $accountId = $userModel->getDefaultAccount($userId);
        $accountId !== null
            ? self::json(['default_account' => $accountId])
            : self::json(['error' => 'User not found or no default account'], 404);
    }

    private static function validateCreate(array $data): bool
    {
        return isset($data['first_name'], $data['last_name'], $data['email'], $data['phone_number'], $data['default_account']) &&
            is_string($data['first_name']) &&
            is_string($data['last_name']) &&
            filter_var($data['email'], FILTER_VALIDATE_EMAIL) &&
            is_numeric($data['phone_number']) &&
            is_numeric($data['default_account']);
    }

    private static function json($data, int $code = 200): void
    {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
}
