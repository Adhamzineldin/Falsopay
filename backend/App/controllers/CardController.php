<?php

namespace App\controllers;

use App\models\Card;
use JetBrains\PhpStorm\NoReturn;

class CardController {

    #[NoReturn]
    public static function createCard(array $data): void {
        $required = ['bank_id', 'card_number', 'expiration_date', 'cvv', 'card_type', 'pin'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                self::json(['error' => "Missing required field: $field"], 400);
            }
        }

        $model = new Card();
        $model->create(
            $data['bank_id'],
            $data['card_number'],
            $data['expiration_date'],
            $data['cvv'],
            $data['card_type'],
            $data['pin']
        );

        self::json(['success' => true]);
    }

    #[NoReturn]
    public static function getAllCards(): void {
        $model = new Card();
        $cards = $model->getAll();
        self::json($cards);
    }

    #[NoReturn]
    public static function getAllCardsByBank(int $bank_id): void {
        $model = new Card();
        $cards = $model->getAllByBank($bank_id);
        self::json($cards);
    }

    #[NoReturn]
    public static function getCard(int $bank_id, string $card_number): void {
        $model = new Card();
        $card = $model->getByBankAndCardNumber($bank_id, $card_number);
        $card ? self::json($card) : self::json(['error' => 'Card not found'], 404);
    }

    #[NoReturn]
    public static function updateCard(int $bank_id, string $card_number, array $data): void {
        $model = new Card();
        $success = $model->update($bank_id, $card_number, $data);
        self::json(['success' => $success]);
    }

    #[NoReturn]
    public static function deleteCard(int $bank_id, string $card_number): void {
        $model = new Card();
        $success = $model->delete($bank_id, $card_number);
        self::json(['success' => $success]);
    }

    // Optional: API route to verify card PIN
    #[NoReturn]
    public static function verifyCardPin(array $data): void {
        $required = ['bank_id', 'card_number', 'pin'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                self::json(['error' => "Missing required field: $field"], 400);
            }
        }

        $model = new Card();
        $isValid = $model->verifyPin(
            $data['bank_id'],
            $data['card_number'],
            $data['pin']
        );

        self::json(['valid' => $isValid]);
    }

    #[NoReturn]
    private static function json($data, int $code = 200): void {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
}
