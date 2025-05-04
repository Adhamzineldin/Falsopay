<?php

namespace App\routes\api;

use App\controllers\TransactionController;
use App\routes\Route;

class TransactionRoutes  extends Route{
    public static function define($router, array $middlewares = []): void
    {
        $router->add('POST', '/api/transactions', [TransactionController::class, 'createTransaction'], $middlewares);
        $router->add('GET', '/api/transactions', [TransactionController::class, 'getAllTransactions'], $middlewares);
        $router->add('GET', '/api/transactions/by-user/{user_id}', [TransactionController::class, 'getTransactionsByUserId'], $middlewares);
        $router->add('POST', '/api/transactions/send-money', [TransactionController::class, 'sendMoney'], $middlewares);

    }
}
