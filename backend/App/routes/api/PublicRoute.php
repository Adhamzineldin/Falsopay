<?php

namespace App\routes\api;

use App\controllers\SupportController;
use App\routes\Route;

class PublicRoute extends Route
{
    public static function define($router, array $middlewares = []): void
    {
        // Create controllers
        $supportController = new SupportController();
        
        // Public support endpoint - doesn't require authentication
        $router->add('POST', '/api/public/support', function($body) use ($supportController) {
            return $supportController->createPublicTicket($body);
        }, []);
    }
} 