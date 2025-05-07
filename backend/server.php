<?php

// Autoload dependencies
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/App/routes/api/UsersRoute.php';

use App\database\Database;
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
use App\routes\auth\AuthRoutes;
use core\Router;
use JetBrains\PhpStorm\NoReturn;

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


// Check WebSocket status (running on localhost:4100)
function checkWebSocketStatus(): array {
    $wsAddress = 'localhost';
    $wsPort = 4100;
    $warningThreshold = 150; // in ms

    $startTime = microtime(true);
    $socket = @fsockopen($wsAddress, $wsPort, $errno, $errstr, 3);
    $endTime = microtime(true);

    $responseTime = round(($endTime - $startTime) * 1000); // ms

    if ($socket) {
        fclose($socket);

        if ($responseTime > $warningThreshold) {
            return [
                'status' => 'warning',
                'label' => 'Degraded',
                'message' => 'WebSocket is reachable but responding slower than expected.',
                'response_time' => $responseTime . 'ms'
            ];
        }

        return [
            'status' => 'operational',
            'label' => 'Operational',
            'message' => 'WebSocket connection is active and running smoothly.',
            'response_time' => $responseTime . 'ms'
        ];
    } else {
        return [
            'status' => 'error',
            'label' => 'Outage',
            'message' => 'WebSocket connection is down. Reconnection attempts in progress.',
            'response_time' => 'null'
        ];
    }
}

function checkDatabaseStatus(): array {
    $warningThreshold = 200; // ms

    try {
        $dbConnection =  Database::getInstance()->getConnection();
        $startTime = microtime(true);
        // Lightweight test query
        $stmt = $dbConnection->query('SELECT 1');
        $stmt->fetch();

        $endTime = microtime(true);
        $responseTime = round(($endTime - $startTime) * 1000);

        if ($responseTime > $warningThreshold) {
            return [
                'status' => 'warning',
                'label' => 'Degraded',
                'message' => 'Database is reachable, but query execution is slow.',
                'response_time' => $responseTime . 'ms'
            ];
        }

        return [
            'status' => 'operational',
            'label' => 'Operational',
            'message' => 'Database is responsive with good query performance.',
            'response_time' => $responseTime . 'ms'
        ];
    } catch (\Exception $e) {
        error_log("Database health check error: " . $e->getMessage());
        return [
            'status' => 'error',
            'label' => 'Outage',
            'message' => 'Database is down or unreachable.',
            'response_time' => 'null'
        ];
    }
}


// Check database status
$dbStatusInfo = checkDatabaseStatus();

// Get WebSocket status
$wsStatusInfo = checkWebSocketStatus();

// Set up the router
$router = new Router();

// Routes
AuthRoutes::define($router);
$routes = [
    UsersRoute::class,
    BanksRoute::class,
    BankAccountsRoute::class,
    BankUsersRoute::class,
    CardsRoute::class,
    InstantPaymentAddressesRoute::class,
    TransactionRoutes::class,
    FavoritesRoute::class,
    SupportRoute::class
];

$middleware = [[AuthMiddleware::class, 'ensureAuthenticated']];

foreach ($routes as $routeClass) {
    $routeClass::define($router, $middleware);
}


#[NoReturn] function home($dbStatusInfo, $wsStatusInfo) {
    // Get status page HTML template
    $htmlContent = file_get_contents(__DIR__ . '/public/index.html');

    // Current datetime for last updated
    date_default_timezone_set('Africa/Cairo');
    $currentDateTime = date('Y-m-d h:i:s A');

    // Replace database status placeholders
    $htmlContent = str_replace('id="db-status" class="status-icon operational"',
        'id="db-status" class="status-icon ' . $dbStatusInfo['status'] . '"',
        $htmlContent);
    $htmlContent = str_replace('id="db-label" class="status-label operational">Operational<',
        'id="db-label" class="status-label ' . $dbStatusInfo['status'] . '">' . $dbStatusInfo['label'] . '<',
        $htmlContent);
    $htmlContent = str_replace('id="db-message" class="status-message">Database connections are stable with normal query times.<',
        'id="db-message" class="status-message">' . $dbStatusInfo['message'] . '<',
        $htmlContent);
    $htmlContent = str_replace('Response time: 56ms',
        'Response time: ' . $dbStatusInfo['response_time'],
        $htmlContent);

    // Replace WebSocket status placeholders
    $htmlContent = str_replace('id="websocket-status" class="status-icon operational"',
        'id="websocket-status" class="status-icon ' . $wsStatusInfo['status'] . '"',
        $htmlContent);
    $htmlContent = str_replace('id="websocket-label" class="status-label operational">Operational<',
        'id="websocket-label" class="status-label ' . $wsStatusInfo['status'] . '">' . $wsStatusInfo['label'] . '<',
        $htmlContent);
    $htmlContent = str_replace('id="websocket-message" class="status-message">WebSocket connection is active and running smoothly.<',
        'id="websocket-message" class="status-message">' . $wsStatusInfo['message'] . '<',
        $htmlContent);
    $htmlContent = str_replace('Response time: 42ms',
        'Response time: ' . $wsStatusInfo['response_time'],
        $htmlContent);

    // Update pulse rings
    $htmlContent = str_replace('class="pulse-ring operational"',
        'class="pulse-ring ' . $dbStatusInfo['status'] . '"',
        $htmlContent);
    $htmlContent = str_replace('class="pulse-ring operational"',
        'class="pulse-ring ' . $wsStatusInfo['status'] . '"',
        $htmlContent);

    // Replace last updated time
    $htmlContent = str_replace('<span id="last-updated">Just now</span>',
        '<span id="last-updated">' . $currentDateTime . '</span>',
        $htmlContent);

    // Disable the random status updates from JavaScript
    $htmlContent = str_replace("updateStatus(\"websocket\", getRandomStatus());",
        "// Status is updated by PHP",
        $htmlContent);
    $htmlContent = str_replace("updateStatus(\"db\", getRandomStatus());",
        "// Status is updated by PHP",
        $htmlContent);

    // Remove random status generation on refresh button click
    $htmlContent = str_replace("updateStatus(\"websocket\", getRandomStatus());\n                updateStatus(\"db\", getRandomStatus());",
        "location.reload();",
        $htmlContent);

    echo $htmlContent;
    exit();
}


// Fallback API route to serve the status page
$router->add('GET', '/', function () use ($dbStatusInfo, $wsStatusInfo) {
    home($dbStatusInfo, $wsStatusInfo);
});

$router->add('GET', '/api', function () use ($dbStatusInfo, $wsStatusInfo) {
    home($dbStatusInfo, $wsStatusInfo);
});


// Handle all requests
$router->handleRequest();
