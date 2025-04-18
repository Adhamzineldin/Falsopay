<?php


namespace App\routes\api;

use App\controllers\UserController;

class UsersRoute
{
    public static function define($router): void
    {
        // Define all the user-related routes
        $router->add('GET', '/api/users', [UserController::class, 'getAllUsers']);
        $router->add('GET', '/api/users/{id}', [UserController::class, 'getUser']);
        $router->add('POST', '/api/users', [UserController::class, 'createUser']);
        $router->add('PUT', '/api/users/{id}', [UserController::class, 'updateUser']);
        $router->add('DELETE', '/api/users/{id}', [UserController::class, 'deleteUser']);
    }
}
