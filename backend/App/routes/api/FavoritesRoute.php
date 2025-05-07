<?php

namespace App\routes\api;

use App\controllers\FavoriteController;
use App\middleware\AuthMiddleware;
use App\routes\Route;

class FavoritesRoute extends Route
{
    public static function define($router, array $middlewares = []): void
    {
        // Create a controller instance to use in routes
        $controller = new FavoriteController();
        
        // Route for creating a new favorite
        $router->add('POST', '/api/favorites', function($body) use ($controller) {
            return $controller->createFavorite($body);
        }, $middlewares);
        
        // Route for getting all favorites for a user
        $router->add('GET', '/api/users/{id}/favorites', function($id) use ($controller) {
            return $controller->getUserFavorites((int)$id);
        }, $middlewares);
        
        // Route for getting favorites by method
        $router->add('GET', '/api/users/{id}/favorites/{method}', function($id, $method) use ($controller) {
            return $controller->getUserFavoritesByMethod((int)$id, $method);
        }, $middlewares);
        
        // Route for deleting a favorite
        $router->add('DELETE', '/api/favorites/{id}/{user_id}', function($id, $user_id) use ($controller) {
            return $controller->deleteFavorite((int)$id, (int)$user_id);
        }, $middlewares);
    }
} 