<?php

namespace App\routes\api;

use App\controllers\SystemController;
use App\middleware\AdminMiddleware;
use App\routes\Route;
use App\config\ErrorLogger;
use Exception;

class SystemRoute extends Route
{
    public static function define($router, array $middlewares = []): void
    {
        // Create controller instance
        try {
            $controller = new SystemController();
            $logger = ErrorLogger::getInstance();
            
            // Add admin middleware for admin-only routes
            $adminMiddlewares = array_merge($middlewares, [[AdminMiddleware::class, 'ensureAdmin']]);
            
            // Public status route - accessible without authentication
            $router->add('GET', '/api/system/status', function() use ($controller, $logger) {
                try {
                    return $controller->getPublicStatus();
                } catch (Exception $e) {
                    $logger->error("Route error in /api/system/status: " . $e->getMessage());
                    
                    // Return a default response that won't trigger maintenance mode
                    return [
                        'status' => 'success',
                        'data' => [
                            'transactions_enabled' => true,
                            'message' => null,
                            'transfer_limit' => null
                        ],
                        'code' => 200
                    ];
                }
            });
            
            // Admin-only routes
            $router->add('GET', '/api/admin/system/settings', function() use ($controller, $logger) {
                try {
                    return $controller->getSettings();
                } catch (Exception $e) {
                    $logger->error("Route error in /api/admin/system/settings: " . $e->getMessage());
                    return [
                        'status' => 'error',
                        'message' => 'Failed to retrieve system settings',
                        'code' => 500
                    ];
                }
            }, $adminMiddlewares);
            
            $router->add('GET', '/api/admin/system/status', function() use ($controller, $logger) {
                try {
                    return $controller->getAdminSystemStatus();
                } catch (Exception $e) {
                    $logger->error("Route error in /api/admin/system/status: " . $e->getMessage());
                    return [
                        'status' => 'error',
                        'message' => 'Failed to retrieve system status',
                        'code' => 500
                    ];
                }
            }, $adminMiddlewares);
            
            $router->add('PUT', '/api/admin/system/settings', function($body) use ($controller, $logger) {
                try {
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
                    
                    // Log the user ID and request body for debugging
                    $logger->info("Updating system settings with user ID: " . ($userId ?? 'null') . ", body: " . json_encode($body));
                    
                    $result = $controller->updateSettings($body, $userId);
                    
                    // If result is an error, log it
                    if (isset($result['status']) && $result['status'] === 'error') {
                        $logger->error("Error updating system settings: " . ($result['message'] ?? 'Unknown error'));
                    }
                    
                    return $result;
                } catch (Exception $e) {
                    $errorMsg = "Route error in PUT /api/admin/system/settings: " . $e->getMessage();
                    $logger->error($errorMsg);
                    return [
                        'status' => 'error',
                        'message' => 'Failed to update system settings: ' . $e->getMessage(),
                        'code' => 500
                    ];
                }
            }, $adminMiddlewares);
            
        } catch (Exception $e) {
            // Log error if controller creation fails
            $logger = ErrorLogger::getInstance();
            $logger->error("Failed to initialize SystemController: " . $e->getMessage());
            
            // Add a fallback route that won't trigger maintenance mode
            $router->add('GET', '/api/system/status', function() {
                return [
                    'status' => 'success',
                    'data' => [
                        'transactions_enabled' => true,
                        'message' => null,
                        'transfer_limit' => null
                    ],
                    'code' => 200
                ];
            });
        }
    }
} 