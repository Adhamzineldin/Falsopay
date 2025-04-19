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
        $requiredFields = ['bank_id', 'account_id', 'ipa_address', 'user_id'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) {
                self::json(['error' => "Missing required field: $field"], 400);
            }
        }

        $ipaModel->create(
            $data['bank_id'],
            $data['account_id'],
            $data['ipa_address'],
            $data['user_id']
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

    #[NoReturn] public static function getByBankAndAccount(int $bank_id, string $account_id): void
    {
        $ipaModel = new InstantPaymentAddress();
        $ipa = $ipaModel->getByBankAndAccount($bank_id, $account_id);
        $ipa ? self::json($ipa) : self::json(['error' => 'IPA not found'], 404);
    }

    #[NoReturn] public static function getByIpaAddress(string $ipa_address): void
    {
        $ipaModel = new InstantPaymentAddress();
        $ipa = $ipaModel->getByIpaAddress($ipa_address);
        $ipa ? self::json($ipa) : self::json(['error' => 'IPA address not found'], 404);
    }

    #[NoReturn] public static function updateInstantPaymentAddress(int $bank_id, string $account_id, array $data): void
    {
        print_r($data);
        $ipaModel = new InstantPaymentAddress();
        $ipaAddress = $data['ipa_address'] ?? null;

        if (!$ipaAddress) {
            self::json(['error' => 'Missing ipa_address'], 400);
        }

        $success = $ipaModel->update($bank_id, $account_id, $ipaAddress);
        self::json(['success' => $success]);
    }

    #[NoReturn] public static function deleteInstantPaymentAddress(int $bank_id, string $account_id): void
    {
        $ipaModel = new InstantPaymentAddress();
        $success = $ipaModel->delete($bank_id, $account_id);
        self::json(['success' => $success]);
    }

    #[NoReturn] public static function deleteAllByUserId(int $user_id): void
    {
        $ipaModel = new InstantPaymentAddress();
        $success = $ipaModel->deleteByUserId($user_id);
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
