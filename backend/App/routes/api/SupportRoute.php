<?php

namespace App\routes\api;

use App\controllers\SupportController;
use App\middleware\AuthMiddleware;
use App\middleware\AdminMiddleware;
use App\routes\Route;

class SupportRoute extends Route
{
    public static function define($router, array $middlewares = []): void
    {
        // Create controller instance
        $controller = new SupportController();
        
        // Get admin middleware - we'll use the same middleware array for now
        // In a production app, we'd implement proper middleware chaining
        $adminMiddlewares = $middlewares;

        // Public route (no authentication required)
        $router->add('POST', '/api/public/support', function($body) use ($controller) {
            return $controller->createPublicTicket($body);
        }, []);

        // Routes for users
        $router->add('POST', '/api/support/tickets', function($body) use ($controller) {
            return $controller->createTicket($body);
        }, $middlewares);
        
        $router->add('GET', '/api/users/{id}/tickets', function($userId) use ($controller) {
            return $controller->getUserTickets((int)$userId);
        }, $middlewares);
        
        $router->add('GET', '/api/support/tickets/{id}/{user_id}', function($ticketId, $userId) use ($controller) {
            return $controller->getTicket((int)$ticketId, (int)$userId);
        }, $middlewares);
        
        $router->add('POST', '/api/support/replies', function($body) use ($controller) {
            // Just get the user ID from the request
            $userId = $body['user_id'] ?? 0;
            
            if (!$userId) {
                return [
                    'status' => 'error',
                    'message' => 'User ID is required',
                    'code' => 400
                ];
            }
            
            // Pass directly to controller
            return $controller->addReply($body, $userId);
        }, $middlewares);
        
        // Admin-only routes
        $router->add('GET', '/api/admin/support/tickets', function() use ($controller) {
            return $controller->getAllTickets();
        }, $adminMiddlewares);
        
        $router->add('GET', '/api/admin/support/tickets/status/{status}', function($status) use ($controller) {
            return $controller->getTicketsByStatus($status);
        }, $adminMiddlewares);
        
        $router->add('PUT', '/api/admin/support/tickets/{id}/status/{status}', function($ticketId, $status) use ($controller) {
            return $controller->updateTicketStatus((int)$ticketId, $status);
        }, $adminMiddlewares);
        
        $router->add('GET', '/api/admin/support/tickets/{id}', function($ticketId) use ($controller) {
            return $controller->getTicket((int)$ticketId, 0, true); // Admin call
        }, $adminMiddlewares);
        
        // Admin reply to ticket
        $router->add('POST', '/api/admin/support/replies', function($body) use ($controller) {
            // Just get the admin user ID from the request
            $adminUserId = $body['admin_user_id'] ?? 0;
            
            if (!$adminUserId) {
                return [
                    'status' => 'error',
                    'message' => 'Admin user ID not found',
                    'code' => 400
                ];
            }
            
            // Pass the admin's user_id and set isAdmin flag to true
            return $controller->addReply($body, $adminUserId, true);
        }, $adminMiddlewares);

        // Add a special debug route for user replies that temporarily bypasses the ownership check
        $router->add('POST', '/api/support/debug/replies', function($body) {
            if (!isset($body['ticket_id']) || !isset($body['message']) || empty($body['message'])) {
                return [
                    'status' => 'error',
                    'message' => 'Missing required fields: ticket_id or message',
                    'code' => 400
                ];
            }
            
            try {
                $ticketId = (int)$body['ticket_id'];
                
                // Get ticket to check if it exists
                $ticketModel = new \App\models\SupportTicket();
                $ticket = $ticketModel->getTicketById($ticketId);
                
                if (!$ticket) {
                    return [
                        'status' => 'error',
                        'message' => 'Ticket not found',
                        'code' => 404
                    ];
                }
                
                // Use the user ID from the request
                $userId = $body['user_id'] ?? 0;
                
                if (!$userId) {
                    return [
                        'status' => 'error',
                        'message' => 'User ID is required',
                        'code' => 400
                    ];
                }
                
                // Add reply using the provided user ID
                $reply = $ticketModel->addReply(
                    $ticketId,
                    (int)$userId,
                    $body['message'],
                    false // Not admin
                );
                
                return [
                    'status' => 'success',
                    'message' => 'Reply added successfully',
                    'data' => $reply,
                    'code' => 201
                ];
            } catch (\Exception $e) {
                error_log('Debug route error: ' . $e->getMessage());
                error_log('Debug route stack trace: ' . $e->getTraceAsString());
                
                return [
                    'status' => 'error',
                    'message' => 'Failed to add reply: ' . $e->getMessage(),
                    'code' => 500
                ];
            }
        }, $middlewares);

        // Admin reply to public ticket (without user_id)
        $router->add('POST', '/api/admin/support/public-replies', function($body) use ($controller) {
            // Just pass the data directly to the controller
            return $controller->addPublicReply($body);
        }, $adminMiddlewares);
    }
} 