<?php

namespace App\routes\api;

use App\controllers\SystemController;
use App\middleware\AdminMiddleware;
use App\routes\Route;

class SystemRoute extends Route
{
    public static function define($router, array $middlewares = []): void
    {
        // Create controller instance
        $controller = new SystemController();
        
        // Add admin middleware for admin-only routes
        $adminMiddlewares = $middlewares;
        
        // Public status route - accessible without authentication
        $router->add('GET', '/api/system/status', function() use ($controller) {
            return $controller->getPublicStatus();
        });
        
        // Admin-only routes
        $router->add('GET', '/api/admin/system/settings', function() use ($controller) {
            return $controller->getSettings();
        }, $adminMiddlewares);
        
        $router->add('PUT', '/api/admin/system/settings', function($body) use ($controller) {
            $userId = $_REQUEST['user_id'] ?? $body['user_id'] ?? 0;
            return $controller->updateSettings($body, (int)$userId);
        }, $adminMiddlewares);
    }
} 