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
            return $controller->addReply($body, $body['user_id'] ?? 0);
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
            // Use ticket creator's user_id as the replying user ID
            // This ensures we have a valid user_id that exists in the users table
            $ticketId = (int)$body['ticket_id'];
            $ticket = (new \App\models\SupportTicket())->getTicketById($ticketId);
            $userId = $ticket ? (int)$ticket['user_id'] : 0;
            
            // Pass the ticket creator's user_id and set isAdmin flag to true
            return $controller->addReply($body, $userId, true);
        }, $adminMiddlewares);
    }
} 