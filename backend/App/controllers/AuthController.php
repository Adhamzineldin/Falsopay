<?php

namespace App\controllers;

use App\middleware\AuthMiddleware;
use App\models\InstantPaymentAddress;
use App\models\User;
use App\services\EmailService;
use App\services\WhatsAppAPI;
use JetBrains\PhpStorm\NoReturn;

class AuthController
{
    #[NoReturn] public static function sendMsg(array $data): void
    {
        $whatsAppAPI = new WhatsAppAPI();
        $recipient = $data['recipient'] ?? null;
        $message = $data['message'] ?? null;
        if ($recipient && $message) {
            $whatsAppAPI->sendMessage($recipient, $message);
        } else {
            echo "Recipient or message is missing.";
        }
        
    }


    #[NoReturn] public static function sendVerificationEmail(array $data): void
    {
        $recipient = $data['recipient'] ?? null;
        $code = $data['code'] ?? null;

        if ($recipient && $code) {
            EmailService::sendVerificationCode($recipient, $code);
            self::json(['success' => true, 'message' => 'Verification email sent successfully'], 200);
        } else {
            self::json(['success' => false, 'message' => 'Verification email is missing.'], 400);   
        }

    }
    
    #[NoReturn] public static function checkIfUserWithPhoneNumberExists(array $data): void
    {
        $userModel = new User();
        $phoneNumber = $data['phone_number'] ?? null;
        
        if (!$phoneNumber) {
            self::json(['error' => 'Phone number is required'], 400);
        }
        
        $user = $userModel->getUserByPhoneNumber($phoneNumber);
        
        if (!$user) {
            self::json(['exists' => false]);
        } else {
            self::json(['exists' => true, 'user_id' => $user["user_id"]]);
        }
    }


    /**
     * @throws \Exception
     */
    #[NoReturn] public static function createUser(array $data): void
    {
        $authMiddleware = new AuthMiddleware();
        $userModel = new User();
        $phoneNumber = $data['phone_number'] ?? null;

        $user = $userModel->getUserByPhoneNumber($phoneNumber);

        if ($user) {
            self::json(['error' => 'User already exists'], 400);
        }
        
        $fields = ['first_name', 'last_name', 'phone_number', 'email'];

        foreach ($fields as $field) {
            if (!isset($data[$field])) {
                self::json(['error' => "Missing required field: $field"], 400);
            }
        }
        
        $user = $userModel->createUser(
            $data['first_name'],
            $data['last_name'],
            $data['email'],
            $data['phone_number'],
        );
        
        if ($user) {
            $user_token = $authMiddleware->generateToken($user['user_id']);
            self::json(['success' => true, 'user_token' => $user_token, 'user' => $user]);
        } else {
            self::json(['error' => 'Failed to create user'], 500);
        }
        
       
    }
    
    #[NoReturn] public static function login(array $data): void
    {
        $userModel = new User();
        $authMiddleware = new AuthMiddleware();
        $ipaModel = new InstantPaymentAddress();
        
        $fields = ['phone_number', 'ipa_address'];
        
        foreach ($fields as $field) {
            if (!isset($data[$field])) {
                self::json(['error' => "Missing required field: $field"], 400);
            }
        }
        
        $user = $userModel->getUserByPhoneNumber($data['phone_number']);
        
        if (!$user) {
            self::json(['error' => 'User not found'], 404);
        }

        $ipa_accounts = $ipaModel->getAllByUserId($user['user_id']);

        if (empty($ipa_accounts)) {
            $user_token = $authMiddleware->generateToken($user['user_id']);
            self::json(['success' => true, 'user_token' => $user_token, 'user' => $user]);
        } else {
            $ipaExists = false;
            foreach ($ipa_accounts as $ipa_account) {
                if ($ipa_account['ipa_address'] === $data['ipa_address']) {
                    $ipaExists = true;
                    break;
                }
            }
            
            if ($ipaExists) {
                $user_token = $authMiddleware->generateToken($user['user_id']);
                self::json(['success' => true, 'user_token' => $user_token, 'user' => $user]);
            } else {
                self::json(['error' => 'Invalid IPA'], 401);
            }
        }
    }
    
    #[NoReturn] public static function deleteAccount(array $data): void
    {
        $authMiddleware = new AuthMiddleware();
        $userModel = new User();
        $ipaModel = new InstantPaymentAddress();
        
        if (!$data["phone_number"]){
            self::json(['error' => 'Phone number is required'], 400);
        }
        
        $user = $userModel->getUserByPhoneNumber($data['phone_number']);
        
        if (!$user) {
            self::json(['error' => 'User not found'], 404);
        }
        
        $ipa = $ipaModel->getAllByUserId($user['user_id']);
        
        if (empty($ipa)) {
            self::json(['success' => true, 'message' => 'No IPA found for this user']);
        } else {
            $ipaDeletionStatus = $ipaModel->deleteByUserId($user['user_id']);
            if (!$ipaDeletionStatus) {
                self::json(['error' => 'Failed to delete IPA'], 500);
            } 
        }

        $userDeletionStatus = $userModel->deleteUser($user['user_id']); 
        if (!$userDeletionStatus) {
            self::json(['error' => 'Failed to delete user'], 500);
        } else {
            self::json(['success' => true, 'message' => 'User account deleted successfully']);
        }
    }
    
    
    
    
    
    
    


    #[NoReturn] private static function json($data, int $code = 200): void
    {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
}