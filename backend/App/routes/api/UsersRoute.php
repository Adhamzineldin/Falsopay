<?php

namespace App\routes\api;

use App\controllers\UserController;
use App\middleware\AuthMiddleware;
use App\routes\Route;

class UsersRoute extends Route
{
    public static function define($router, array $middlewares = []): void
    {
        // Define all the user-related routes
        $router->add('GET', '/api/users', [UserController::class, 'getAllUsers'], $middlewares);
        $router->add('GET', '/api/users/{id}', [UserController::class, 'getUserById'], $middlewares);
        $router->add('POST', '/api/users', [UserController::class, 'createUser'], $middlewares);
        $router->add('PUT', '/api/users/{id}', [UserController::class, 'updateUser'], $middlewares);
        $router->add('DELETE', '/api/users/{id}', [UserController::class, 'deleteUser']);

        // Additional routes for user email 
        $router->add('GET', '/api/users/email/{email}', [UserController::class, 'getUserByEmail']);
        $router->add('GET', '/api/users/number/{number}', [UserController::class, 'getUserByPhoneNumber']);
        
        // Route for checking if a user exists by phone number
        $router->add('GET', '/api/users/exists/{phone_number}', [UserController::class, 'checkUserExistsByPhoneNumber']);
        
        // Route for getting and setting the default account for a user
        $router->add('GET', '/api/users/{id}/default-account', [UserController::class, 'getDefaultAccount']);
        $router->add('PUT', '/api/users/{id}/default-account', [UserController::class, 'setDefaultAccount'], $middlewares);
    }
}
