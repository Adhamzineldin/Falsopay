<?php

namespace App\routes\system;

use App\controllers\system\ServerStatusController;
use core\Router;

class ServerStatusRoutes
{
    /**
     * Define system routes
     *
     * @param Router $router Router instance
     * @return void
     */
    public static function define(Router $router): void
    {
        // Fallback API route to serve the status page
        $router->add('GET', '/', function () {
            ServerStatusController::renderHomePage();
        });

        // API route for the root
        $router->add('GET', '/api', function () {
            ServerStatusController::renderHomePage();
        });

       
    }
} 