<?php

namespace App\routes\system;

use App\controllers\system\SystemController;
use core\Router;

class SystemRoutes
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
            SystemController::renderHomePage();
        });

        // API route for the root
        $router->add('GET', '/api', function () {
            SystemController::renderHomePage();
        });

        // API endpoint for system status in JSON format (for admin dashboard)
        $router->add('GET', '/api/admin/system/status', function () {
            SystemController::getSystemStatus();
        });
    }
} 