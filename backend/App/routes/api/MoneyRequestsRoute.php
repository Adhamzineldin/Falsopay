<?php

namespace App\routes\api;

use App\controllers\MoneyRequestController;
use App\middleware\AuthMiddleware;
use App\routes\Route;

class MoneyRequestsRoute extends Route {
    /**
     * Define the routes for money requests
     *
     * @param mixed $router The router instance
     * @param array $middlewares Middlewares to apply
     * @return void
     */
    public static function define($router, array $middlewares = []): void {
        // Create a new money request
        $router->add('POST', '/api/money-requests', [MoneyRequestController::class, 'createRequest'], $middlewares);
        
        // Get pending money requests for the authenticated user
        $router->add('GET', '/api/money-requests/pending', [MoneyRequestController::class, 'getPendingRequests'], $middlewares);
        
        // Get all money requests for the authenticated user
        $router->add('GET', '/api/money-requests', [MoneyRequestController::class, 'getAllRequests'], $middlewares);
        
        // Get a specific money request by ID
        $router->add('GET', '/api/money-requests/{id}', [MoneyRequestController::class, 'getRequestById'], $middlewares);
        
        // Process a money request (accept or decline)
        $router->add('POST', '/api/money-requests/{id}/process', [MoneyRequestController::class, 'processRequest'], $middlewares);
    }
} 