<?php


// Enable CORS (for React frontend access)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");



if (php_sapi_name() === 'cli') {
    echo "Run this with: php -S localhost:4000 server.php\n";
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Autoload your app
require_once __DIR__ . '/config/database/db.php';
require_once __DIR__ . '/app/routes/api.php'; // Or api.php

// Simple router based on request URI
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Very basic example route handler
if ($uri === '/api' && $method === 'GET') {
    echo "Welcome to falsopay Backend API";
    exit;
}

// If no route matched
http_response_code(404);
echo "Route not found";
