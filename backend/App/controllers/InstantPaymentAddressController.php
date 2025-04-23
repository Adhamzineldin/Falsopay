<?php

namespace App\controllers;

use App\models\InstantPaymentAddress;
use Exception;
use JetBrains\PhpStorm\NoReturn;

class InstantPaymentAddressController
{
    #[NoReturn] public static function createInstantPaymentAddress(array $data): void
    {
        $ipaModel = new InstantPaymentAddress();

        // Validate required fields
        $requiredFields = ['bank_id', 'account_number', 'ipa_address', 'user_id', 'pin'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) {
                self::json(['error' => "Missing required field: $field"], 400);
            }
        }

        // Enforce PIN length (since it's hashed later)
        if (strlen($data['pin']) < 6) {
            self::json(['error' => 'PIN must be at least 10 characters long.'], 400);
        }

        $ipaModel->create(
            $data['bank_id'],
            $data['account_number'],
            strtolower($data['ipa_address']),
            $data['user_id'],
            $data['pin']
        );
        
        self::json(['success' => true]);
    }


    #[NoReturn] public static function getAllInstantPaymentAddresses(): void
    {
        $ipaModel = new InstantPaymentAddress();
        $ipas = $ipaModel->getAll();
        self::json($ipas);
    }

    #[NoReturn] public static function getAllByBank(int $bank_id): void
    {
        $ipaModel = new InstantPaymentAddress();
        $ipas = $ipaModel->getAllByBank($bank_id);
        self::json($ipas);
    }

    #[NoReturn] public static function getAllByUserId(int $user_id): void
    {
        $ipaModel = new InstantPaymentAddress();
        $ipas = $ipaModel->getAllByUserId($user_id);
        self::json($ipas);
    }

    #[NoReturn] public static function getByBankAndAccount(int $bank_id, string $account_number): void
    {
        $ipaModel = new InstantPaymentAddress();
        $ipa = $ipaModel->getByBankAndAccount($bank_id, $account_number);
        $ipa ? self::json($ipa) : self::json(['error' => 'IPA not found'], 404);
    }

    #[NoReturn] public static function getByIpaAddress(string $ipa_address): void
    {
        $ipaModel = new InstantPaymentAddress();
        $ipa = $ipaModel->getByIpaAddress($ipa_address);
        $ipa ? self::json($ipa) : self::json(['error' => 'IPA address not found'], 404);
    }


    #[NoReturn] public static function getByIpaId(string $ipa_id): void
    {
        $ipaModel = new InstantPaymentAddress();
        $ipa = $ipaModel->getByIpaId($ipa_id);
        $ipa ? self::json($ipa) : self::json(['error' => 'IPA address not found'], 404);
    }
    
    

    #[NoReturn] public static function updateInstantPaymentAddress(int $bank_id, string $account_number, array $data): void
    {
        print_r($data);
        $ipaModel = new InstantPaymentAddress();
        $ipaAddress = $data['ipa_address'] ?? null;

        if (!$ipaAddress) {
            self::json(['error' => 'Missing ipa_address'], 400);
        }

        $success = $ipaModel->update($bank_id, $account_number, $ipaAddress);
        self::json(['success' => $success]);
    }

    #[NoReturn] public static function deleteInstantPaymentAddress(int $bank_id, string $account_number): void
    {
        $ipaModel = new InstantPaymentAddress();
        $success = $ipaModel->delete($bank_id, $account_number);
        self::json(['success' => $success]);
    }

    #[NoReturn] public static function deleteAllByUserId(int $user_id): void
    {
        $ipaModel = new InstantPaymentAddress();
        $success = $ipaModel->deleteByUserId($user_id);
        self::json(['success' => $success]);
    }
    
    
    
    

    #[NoReturn] public static function verifyPinForIpa(array $data): void
    {
        $ipaModel = new InstantPaymentAddress();

        if (!isset($data['ipa_address'], $data['pin'])) {
            self::json(['error' => 'Missing ipa_address or pin'], 400);
        }

        $isValid = $ipaModel->verifyPin($data['ipa_address'], $data['pin']);

        if (!$isValid) {
            self::json(['valid' => false, 'message' => 'Incorrect PIN'], 401);
        }

        self::json(['valid' => true]);
    }

    #[NoReturn] public static function updatePinForIpa(array $data): void
    {
        $ipaModel = new InstantPaymentAddress();

        if (!isset($data['ipa_address'], $data['new_pin'])) {
            self::json(['error' => 'Missing ipa_address or new_pin'], 400);
        }

        if (strlen($data['new_pin']) < 10) {
            self::json(['error' => 'PIN must be at least 10 characters long.'], 400);
        }

        $success = $ipaModel->updatePin($data['ipa_address'], $data['new_pin']);
        self::json(['success' => $success]);
    }






    #[NoReturn] private static function json($data, int $code = 200): void
    {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
}
