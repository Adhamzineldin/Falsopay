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
        
        $router->add('GET', '/api/admin/system/status', function() use ($controller) {
            return $controller->getAdminSystemStatus();
        }, $adminMiddlewares);
        
        $router->add('PUT', '/api/admin/system/settings', function($body) use ($controller) {
            // Check if user_id is provided and ensure it's a valid integer
            $userId = null;
            
            if (isset($_REQUEST['user_id']) && is_numeric($_REQUEST['user_id']) && (int)$_REQUEST['user_id'] > 0) {
                $userId = (int)$_REQUEST['user_id'];
            } elseif (isset($body['user_id']) && is_numeric($body['user_id']) && (int)$body['user_id'] > 0) {
                $userId = (int)$body['user_id'];
            }
            
            // If user_id isn't valid, check if we have authenticated user in session
            if (!$userId && isset($_SESSION['user_id']) && (int)$_SESSION['user_id'] > 0) {
                $userId = (int)$_SESSION['user_id'];
            }
            
            return $controller->updateSettings($body, $userId);
        }, $adminMiddlewares);
    }
} 