<?php

namespace App\routes\api;

use App\controllers\BankController;
use App\middleware\AuthMiddleware;
use App\routes\Route;

class BanksRoute extends Route
{
    public static function define($router, array $middlewares = []): void
    {
        // Define all the bank-related routes

        // Route for getting all banks
        $router->add('GET', '/api/banks', [BankController::class, 'getAllBanks'], $middlewares);

        // Route for getting a bank by ID
        $router->add('GET', '/api/banks/{id}', [BankController::class, 'getBankById'], $middlewares);

        // Route for creating a new bank
        $router->add('POST', '/api/banks', [BankController::class, 'createBank'], $middlewares);

        // Route for updating a bank by ID
        $router->add('PUT', '/api/banks/{id}', [BankController::class, 'updateBank'], $middlewares);

        // Route for deleting a bank by ID
        $router->add('DELETE', '/api/banks/{id}', [BankController::class, 'deleteBank'], $middlewares);
    }
}
