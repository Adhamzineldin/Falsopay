<?php

namespace App\controllers;

use App\models\User;
use Exception;
use JetBrains\PhpStorm\NoReturn;

class UserController
{

    #[NoReturn]
    public static function createUser(array $data): void
    {
        $userModel = new User();

        // Validate required fields
        $requiredFields = ['first_name', 'last_name', 'email', 'phone_number'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) {
                self::json(['error' => "Missing required field: $field"], 400);
            }
        }

        // Check if email is already used
        if ($userModel->getUserByEmail($data['email'])) {
            self::json(['error' => 'Email is already in use'], 409);
        }

        // Check if phone number is already used
        if ($userModel->getUserByPhone($data['phone_number'])) {
            self::json(['error' => 'Phone number is already in use'], 409);
        }

        try {
            $user = $userModel->createUser(
                $data['first_name'],
                $data['last_name'],
                $data['email'],
                $data['phone_number'],
                $data['default_account']
            );
            self::json(['success' => true, 'user' => $user]);
        } catch (Exception $e) {
            self::json(['error' => $e->getMessage()], 500);
        }
    }


    #[NoReturn] public static function getAllUsers(): void
    {
        $userModel = new User();
        $users = $userModel->getAllUsers();
        self::json($users);
    }

    #[NoReturn] public static function getUserById(int $id): void
    {
        $userModel = new User();
        $user = $userModel->getUserById($id);
        $user ? self::json($user) : self::json(['error' => 'User not found'], 404);
    }

    #[NoReturn] public static function getUserByPhoneNumber(string $phone_number): void
    {
        $userModel = new User();
        $user = $userModel->getUserByPhoneNumber($phone_number);
        $user ? self::json($user) : self::json(['error' => 'User not found'], 404);
    }

    #[NoReturn] public static function getUserByEmail(string $email): void
    {
        $userModel = new User();
        $user = $userModel->getUserByEmail($email);
        $user ? self::json($user) : self::json(['error' => 'User not found'], 404);
    }

    /**
     * @throws Exception
     */
    #[NoReturn] public static function updateUser(int $id, array $data): void
    {   
        print_r($data);
        $userModel = new User();
        $success = $userModel->updateUser($id, $data);
        self::json(['success' => $success]);
    }

    #[NoReturn] public static function deleteUser(int $id): void
    {
        $userModel = new User();
        $success = $userModel->deleteUser($id);
        self::json(['success' => $success]);
    }

    #[NoReturn] public static function checkUserExistsByPhoneNumber(string $email): void
    {
        $userModel = new User();
        $exists = $userModel->existsByPhoneNumber($email);
        self::json(['exists' => $exists]);
    }

    #[NoReturn] public static function setDefaultAccount(int $userId, array $data): void
    {
        $userModel = new User();
        $accountId = $data['accountId'] ?? null;
        $success = $userModel->setDefaultAccount($userId, $accountId);
        self::json(['success' => $success]);
    }

    #[NoReturn] public static function getDefaultAccount(int $userId): void
    {
        $userModel = new User();
        $accountId = $userModel->getDefaultAccount($userId);
        $accountId !== null
            ? self::json(['default_account' => $accountId])
            : self::json(['error' => 'User not found or no default account'], 404);
    }

    /**
     * Get user role securely from backend
     */
    #[NoReturn] public static function getUserRole(int $userId): void
    {
        $userModel = new User();
        $role = $userModel->getUserRole($userId);
        $role ? self::json(['role' => $role]) : self::json(['error' => 'User not found'], 404);
    }

    #[NoReturn] private static function json($data, int $code = 200): void
    {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
}
