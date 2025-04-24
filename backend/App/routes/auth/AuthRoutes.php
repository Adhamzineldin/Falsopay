<?php

namespace App\routes\auth;

use App\controllers\AuthController;

class AuthRoutes
{
    public static function define($router, array $middlewares = []): void
    {
        // Auth-related endpoints
        $router->add('POST', '/api/send-msg', [AuthController::class, 'sendMsg'], $middlewares);
        $router->add('POST', '/api/send-verification-email', [AuthController::class, 'sendVerificationEmail'], $middlewares);
        $router->add('POST', '/api/check-phone', [AuthController::class, 'checkIfUserWithPhoneNumberExists'], $middlewares);
        $router->add('POST', '/api/create-user', [AuthController::class, 'createUser'], $middlewares);
        $router->add('POST', '/api/login', [AuthController::class, 'login'], $middlewares);
        $router->add('DELETE', '/api/delete-account', [AuthController::class, 'deleteAccount'], $middlewares);
    }
}
