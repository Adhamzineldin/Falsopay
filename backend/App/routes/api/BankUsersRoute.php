<?php

namespace App\routes\api;

use App\controllers\BankUserController;
use App\middleware\AuthMiddleware;

class BankUsersRoute {
    public static function define($router, array $middlewares = []): void {
        // Route to create a new bank user
        $router->add('POST', '/api/bank-users', [BankUserController::class, 'createBankUser'], $middlewares);

        // Route to get all bank users
        $router->add('GET', '/api/bank-users', [BankUserController::class, 'getAllBankUsers'], $middlewares);

        // Route to get a specific bank user by ID
        $router->add('GET', '/api/bank-users/{id}', [BankUserController::class, 'getBankUser'], $middlewares);

        // Route to update a specific bank user by ID
        $router->add('PUT', '/api/bank-users/{id}', [BankUserController::class, 'updateBankUser'], $middlewares);

        // Route to delete a specific bank user by ID
        $router->add('DELETE', '/api/bank-users/{id}', [BankUserController::class, 'deleteBankUser'], $middlewares);
    }
}
