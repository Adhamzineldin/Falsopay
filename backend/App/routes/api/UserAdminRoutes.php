<?php

namespace App\routes\api;

use App\controllers\UserAdminController;
use App\middleware\AdminMiddleware;
use App\routes\Route;
use App\config\ErrorLogger;
use Exception;

class UserAdminRoutes extends Route
{
    public static function define($router, array $middlewares = []): void
    {
        try {
            $controller = new UserAdminController();
            $logger = ErrorLogger::getInstance();
            
            // Add admin middleware for these routes
            $adminMiddlewares = array_merge($middlewares, [[AdminMiddleware::class, 'ensureAdmin']]);
            
            // Get all users
            $router->add('GET', '/api/admin/users', function() use ($controller, $logger) {
                try {
                    return $controller->getAllUsers();
                } catch (Exception $e) {
                    $logger->error("Route error in /api/admin/users: " . $e->getMessage());
                    return [
                        'status' => 'error',
                        'message' => 'Failed to retrieve users',
                        'code' => 500
                    ];
                }
            }, $adminMiddlewares);
            
            // Get blocked users
            $router->add('GET', '/api/admin/users/blocked', function() use ($controller, $logger) {
                try {
                    return $controller->getBlockedUsers();
                } catch (Exception $e) {
                    $logger->error("Route error in /api/admin/users/blocked: " . $e->getMessage());
                    return [
                        'status' => 'error',
                        'message' => 'Failed to retrieve blocked users',
                        'code' => 500
                    ];
                }
            }, $adminMiddlewares);
            
            // Block a user
            $router->add('POST', '/api/admin/users/block', function($body) use ($controller, $logger) {
                try {
                    return $controller->blockUser($body);
                } catch (Exception $e) {
                    $logger->error("Route error in POST /api/admin/users/block: " . $e->getMessage());
                    return [
                        'status' => 'error',
                        'message' => 'Failed to block user',
                        'code' => 500
                    ];
                }
            }, $adminMiddlewares);
            
            // Unblock a user
            $router->add('POST', '/api/admin/users/unblock', function($body) use ($controller, $logger) {
                try {
                    return $controller->unblockUser($body);
                } catch (Exception $e) {
                    $logger->error("Route error in POST /api/admin/users/unblock: " . $e->getMessage());
                    return [
                        'status' => 'error',
                        'message' => 'Failed to unblock user',
                        'code' => 500
                    ];
                }
            }, $adminMiddlewares);
        } catch (Exception $e) {
            // Log error if controller creation fails
            $logger = ErrorLogger::getInstance();
            $logger->error("Failed to initialize UserAdminController: " . $e->getMessage());
        }
    }
} 