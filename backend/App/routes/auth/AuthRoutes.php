<?php

namespace App\routes\auth;

use App\controllers\AuthController;
class AuthRoutes
{
    public static function define($router, array $middlewares = []): void
    {
        // Define all the user-related routes
        $router->add('POST', '/api/send-msg', [AuthController::class, 'sendMsg'], $middlewares);
        
    }
}