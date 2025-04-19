<?php

namespace App\routes\api;

use App\controllers\TransactionController;

class TransactionRoutes {
    public static function define($router) {
        $router->add('POST', '/api/transactions', [TransactionController::class, 'createTransaction']);
        $router->add('GET', '/api/transactions', [TransactionController::class, 'getAllTransactions']);
        $router->add('GET', '/api/transactions/by-user/{user_id}', [TransactionController::class, 'getTransactionsByUserId']);
        $router->add('POST', '/api/transactions/send-money', [TransactionController::class, 'sendMoney']);

    }
}
