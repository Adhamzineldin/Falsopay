<?php

// Autoload dependencies
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/App/routes/api/UsersRoute.php';
require_once __DIR__ . '/App/routes/api/MoneyRequestsRoute.php';
require_once __DIR__ . '/App/routes/api/PublicRoute.php';
require_once __DIR__ . '/App/config/ErrorLogger.php';
require_once __DIR__ . '/App/routes/system/SystemRoutes.php';
require_once __DIR__ . '/App/controllers/system/SystemController.php';

use App\config\ErrorLogger;
use App\middleware\AuthMiddleware;
use App\routes\api\BankAccountsRoute;
use App\routes\api\BanksRoute;
use App\routes\api\BankUsersRoute;
use App\routes\api\CardsRoute;
use App\routes\api\InstantPaymentAddressesRoute;
use App\routes\api\TransactionRoutes;
use App\routes\api\UsersRoute;
use App\routes\api\FavoritesRoute;
use App\routes\api\SupportRoute;
use App\routes\api\SystemRoute;
use App\routes\api\UserAdminRoutes;
use App\routes\api\MoneyRequestsRoute;
use App\routes\api\PublicRoute;
use App\routes\auth\AuthRoutes;
use App\routes\system\SystemRoutes;
use core\Router;

// Initialize our custom error logger
$logger = ErrorLogger::getInstance();

// Enable comprehensive error handling
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Define cache directory
$cacheDir = __DIR__ . '/cache';
if (!is_dir($cacheDir)) {
    mkdir($cacheDir, 0755, true);
}

// Custom error handler
set_error_handler(function($errno, $errstr, $errfile, $errline) use ($logger) {
    // Only log errors, not warnings or notices which can flood logs
    if ($errno === E_ERROR || $errno === E_PARSE || $errno === E_CORE_ERROR || $errno === E_COMPILE_ERROR) {
        $logger->log("PHP Error [$errno]: $errstr in $errfile on line $errline", 'ERROR');
    }

    // Don't execute PHP's internal error handler
    return true;
});

// Custom exception handler
set_exception_handler(function($e) use ($logger) {
    $logger->log("Uncaught Exception: " . $e->getMessage() . " in file " . $e->getFile() . " on line " . $e->getLine(), 'ERROR');

    // Send JSON response for API errors
    if (strpos($_SERVER['REQUEST_URI'], '/api/') !== false) {
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'error',
            'message' => 'Server error: ' . $e->getMessage(),
            'code' => 500
        ]);
    } else {
        echo "Server Error: Please try again later.";
    }
});

// Handle CORS and preflight request
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Max-Age: 86400");  // cache OPTIONS for 1 day
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    exit(0);
}

// Set up the router
$router = new Router();

// Define all routes
AuthRoutes::define($router);
SystemRoutes::define($router);

$routes = [
    UsersRoute::class,
    BanksRoute::class,
    BankAccountsRoute::class,
    BankUsersRoute::class,
    CardsRoute::class,
    InstantPaymentAddressesRoute::class,
    TransactionRoutes::class,
    FavoritesRoute::class,
    SupportRoute::class,
    SystemRoute::class,
    UserAdminRoutes::class,
    MoneyRequestsRoute::class,
    PublicRoute::class,
];

$middleware = [[AuthMiddleware::class, 'ensureAuthenticated']];

foreach ($routes as $routeClass) {
    $routeClass::define($router, $middleware);
}

// Handle all requests
$router->handleRequest();