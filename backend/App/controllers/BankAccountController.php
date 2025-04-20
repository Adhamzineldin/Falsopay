<?php

namespace App\controllers;

use App\models\BankAccount;
use App\models\BankUser;
use App\models\Card;
use App\models\User;
use JetBrains\PhpStorm\NoReturn;

class BankAccountController
{
    #[NoReturn] public static function createBankAccount(array $data): void
    {
        $required = ['bank_id', 'account_number', 'bank_user_id', 'iban', 'status', 'type', 'balance'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                self::json(['error' => "Missing required field: $field"], 400);
            }
        }

        $model = new BankAccount();
        $model->create(
            $data['bank_id'],
            $data['account_number'],
            $data['bank_user_id'],
            $data['iban'],
            $data['status'],
            $data['type'],
            $data['balance']
        );

        self::json(['success' => true]);
    }

    #[NoReturn] public static function getAllBankAccounts(): void
    {
        $model = new BankAccount();
        $accounts = $model->getAll();
        self::json($accounts);
    }

    #[NoReturn] public static function getBankAccount(int $bankId, string $accountNumber): void
    {
        $model = new BankAccount();
        $account = $model->getByCompositeKey($bankId, $accountNumber); // Use the correct method
        $account ? self::json($account) : self::json(['error' => 'Not found'], 404);
    }

    #[NoReturn] public static function updateBankAccount(int $bankId, string $accountNumber, array $data): void
    {
        $model = new BankAccount();
        $success = $model->update($bankId, $accountNumber, $data);
        self::json(['success' => $success]);
    }

    #[NoReturn] public static function deleteBankAccount(int $bankId, string $accountNumber): void
    {
        $model = new BankAccount();
        $success = $model->delete($bankId, $accountNumber);
        self::json(['success' => $success]);
    }

    #[NoReturn] public static function getByIBAN(string $iban): void
    {
        $model = new BankAccount();
        $account = $model->getByIban($iban);
        $account ? self::json($account) : self::json(['error' => 'Not found'], 404);
    }

    #[NoReturn] public static function getByUserId(int $bankUserId): void
    {
        $model = new BankAccount();
        $accounts = $model->getAllByUserId($bankUserId); // Fixed method name
        self::json($accounts);
    }

    #[NoReturn] public static function getByUserAndBank(int $bankUserId, int $bankId): void
    {
        $model = new BankAccount();
        $accounts = $model->getAllByUserAndBankId($bankUserId, $bankId); // Fixed method name
        self::json($accounts);
    }

    #[NoReturn] public static function addBalance(int $bankId, string $accountNumber, array $data): void
    {
        $amount = $data['amount'] ?? null;
        if ($amount === null) {
            self::json(['error' => 'Missing amount'], 400);
        }

        $model = new BankAccount();
        $success = $model->addBalance($bankId, $accountNumber, $amount); // Corrected to pass bankId
        self::json(['success' => $success]);
    }

    #[NoReturn] public static function subtractBalance(int $bankId, string $accountNumber, array $data): void
    {
        $amount = $data['amount'] ?? null;
        if ($amount === null) {
            self::json(['error' => 'Missing amount'], 400);
        }

        $model = new BankAccount();
        $success = $model->subtractBalance($bankId, $accountNumber, $amount); // Corrected to pass bankId
        self::json(['success' => $success]);
    }

    #[NoReturn] public static function getBalance(int $bankId, string $accountNumber): void
    {
        $model = new BankAccount();
        $balance = $model->getBalance($bankId, $accountNumber); // Corrected to pass bankId
        $balance !== null
            ? self::json(['balance' => $balance])
            : self::json(['error' => 'Account not found'], 404);
    }



    public static function linkAccountToService(array $data) {
        $required = ['card_number', 'phone_number', 'bank_id', 'card_pin'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                self::json(['error' => "Missing required field: $field"], 400);
            }
        }
        
        
        $cardModel = new Card();
        $bankUserModel = new BankUser();
        $bankAccountModel = new BankAccount();
        
        $card = $cardModel->getByBankAndCardNumber($data['bank_id'], $data['card_number']);
        
        if (!$card) {
            self::json(['error' => 'Card not found'], 404);
        }
        
        $bankUser = $bankUserModel->getById($card['bank_user_id']);
        
        if (!$bankUser) {
            self::json(['error' => 'Bank user not found'], 404);
        }
        
        if ($bankUser['phone_number'] !== $data['phone_number']) {
            self::json(['error' => 'Phone number does not match'], 403);
        }
        
        $isCorrectPin = $cardModel->verifyPin($data['bank_id'], $data['card_number'], $data['card_pin']);
        
        if (!$isCorrectPin) {
            self::json(['error' => 'Incorrect PIN'], 403);
        }
        
        $bankAccounts = $bankAccountModel->getAllByUserAndBankId($card['bank_user_id'], $data['bank_id']);
        
        self::json($bankAccounts);
        
    }
    
    
    

    #[NoReturn] private static function json($data, int $code = 200): void
    {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
}
