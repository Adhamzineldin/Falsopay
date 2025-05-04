<?php

namespace App\routes\api;

use App\controllers\BankAccountController;
use App\middleware\AuthMiddleware;
use App\routes\Route;

class BankAccountsRoute extends Route
{
    public static function define($router, array $middlewares = []): void
    {
        $router->add('GET', '/api/bank-accounts/iban/{iban}', [BankAccountController::class, 'getByIBAN'], $middlewares);
        $router->add('GET', '/api/bank-accounts/user/{bank_user_id}/bank/{bank_id}', [BankAccountController::class, 'getByUserAndBank'], $middlewares);
        $router->add('GET', '/api/bank-accounts/user/{bank_user_id}', [BankAccountController::class, 'getByUserId'], $middlewares);
        $router->add('GET', '/api/bank-accounts/phone/{phone_number}', [BankAccountController::class, 'getByUserPhoneNumber'], $middlewares);
        $router->add('GET', '/api/bank-accounts/{bank_id}/{account_number}/balance', [BankAccountController::class, 'getBalance'], $middlewares);
        
        $router->add('PATCH', '/api/bank-accounts/{bank_id}/{account_number}/add-balance', [BankAccountController::class, 'addBalance'], $middlewares);
        $router->add('PATCH', '/api/bank-accounts/{bank_id}/{account_number}/subtract-balance', [BankAccountController::class, 'subtractBalance'], $middlewares);
        
        $router->add('GET', '/api/bank-accounts/{bank_id}/{account_number}', [BankAccountController::class, 'getBankAccount'], $middlewares);
        $router->add('PUT', '/api/bank-accounts/{bank_id}/{account_number}', [BankAccountController::class, 'updateBankAccount'], $middlewares);
        $router->add('DELETE', '/api/bank-accounts/{bank_id}/{account_number}', [BankAccountController::class, 'deleteBankAccount'], $middlewares);

        $router->add('GET', '/api/bank-accounts', [BankAccountController::class, 'getAllBankAccounts'], $middlewares);
        $router->add('POST', '/api/bank-accounts', [BankAccountController::class, 'createBankAccount'], $middlewares);

        $router->add('POST', '/api/bank-accounts/link', [BankAccountController::class, 'linkAccountToService'], $middlewares);

    }
}
