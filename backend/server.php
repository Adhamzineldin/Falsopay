<?php

// Autoload dependencies
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/App/routes/api/UsersRoute.php';

use App\database\Database;
use App\middleware\AuthMiddleware;
use App\routes\api\UsersRoute;
use App\routes\Router;

// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// Handle pre-flight requests (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection
$database = null;
try {
    $database = Database::getInstance();
    $dbConnection = $database->getConnection();
    $dbStatus = 'Connected to Database';
    $dbStatusClass = 'green';
    $dbReconnectionMessage = '';
} catch (\Exception $e) {
    $dbConnection = false;
    $dbStatus = 'Failed to connect to Database';
    $dbStatusClass = 'red';
    $dbReconnectionMessage = 'Reconnecting...';
    error_log("Database connection error: " . $e->getMessage());
}

// Set up the router
$router = new Router();

//Routes
//UsersRoute::define($router, [[AuthMiddleware::class, 'ensureAuthenticated']]);

UsersRoute::define($router);



// Fallback API route example
$router->add('GET', '/api', function () use ($dbStatus, $dbStatusClass, $dbReconnectionMessage) {
    // Serve dynamic HTML with database status
    $htmlContent = file_get_contents(__DIR__ . '/public/index.html');
    $htmlContent = str_replace('{{db_status}}', $dbStatus, $htmlContent);
    $htmlContent = str_replace('{{db_class}}', $dbStatusClass, $htmlContent);
    $htmlContent = str_replace('{{reconnect_message}}', $dbReconnectionMessage, $htmlContent);
    echo $htmlContent;
    exit();
});

// Handle all requests
$router->handleRequest();
