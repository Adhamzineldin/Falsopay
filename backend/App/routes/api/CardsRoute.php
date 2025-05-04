<?php

namespace App\routes\api;

use App\controllers\CardController;
use App\middleware\AuthMiddleware;
use App\routes\Route;

class CardsRoute extends Route{
    public static function define($router, array $middlewares = []): void {
        // Route to create a new card
        $router->add('POST', '/api/cards', [CardController::class, 'createCard'], $middlewares);
        
        // Route to get all cards
        $router->add('GET', '/api/cards', [CardController::class, 'getAllCards'], $middlewares);

        // Route to get all cards by bank
        $router->add('GET', '/api/cards/bank/{bank_id}', [CardController::class, 'getAllCardsByBank'], $middlewares);

        // Route to get a specific card by bank and card number
        $router->add('GET', '/api/cards/bank/{bank_id}/card/{card_number}', [CardController::class, 'getCard'], $middlewares);

        // Route to update a specific card by bank and card number
        $router->add('PUT', '/api/cards/bank/{bank_id}/card/{card_number}', [CardController::class, 'updateCard'], $middlewares);

        // Route to delete a specific card by bank and card number
        $router->add('DELETE', '/api/cards/bank/{bank_id}/card/{card_number}', [CardController::class, 'deleteCard'], $middlewares);
    }
}
