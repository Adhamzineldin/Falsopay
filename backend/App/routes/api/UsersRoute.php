<?php

namespace App\routes\api;

use App\controllers\UserController;
use App\middleware\AuthMiddleware;

class UsersRoute
{
    public static function define($router, array $middlewares = []): void
    {
        // Define all the user-related routes
        $router->add('GET', '/api/users', [UserController::class, 'getAllUsers'], $middlewares);
        $router->add('GET', '/api/users/{id}', [UserController::class, 'getUserById'], $middlewares);
        $router->add('POST', '/api/users', [UserController::class, 'createUser'], $middlewares);
        $router->add('PUT', '/api/users/{id}', [UserController::class, 'updateUser'], $middlewares);
        $router->add('DELETE', '/api/users/{id}', [UserController::class, 'deleteUser'], $middlewares);

        // Additional routes for user email 
        $router->add('GET', '/api/users/email/{email}', [UserController::class, 'getUserByEmail'], $middlewares);
        $router->add('GET', '/api/users/number/{number}', [UserController::class, 'getUserByPhoneNumber'], $middlewares);
        
        // Route for checking if a user exists by phone number
        $router->add('GET', '/api/users/exists/{phone_number}', [UserController::class, 'checkUserExistsByPhoneNumber'], $middlewares);
        
        // Route for getting and setting the default account for a user
        $router->add('GET', '/api/users/{id}/default-account', [UserController::class, 'getDefaultAccount'], $middlewares);
        $router->add('PUT', '/api/users/{id}/default-account', [UserController::class, 'setDefaultAccount'], $middlewares);
    }
}
