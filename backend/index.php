<?php

require_once __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;
use Firebase\JWT\JWT;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        // Process API POST request (e.g., login, transfer)
        handlePostRequest();
        break;
    case 'GET':
        // Handle GET requests (e.g., balance, transactions)
        handleGetRequest();
        break;
    default:
        echo json_encode(['error' => 'Method Not Allowed']);
        http_response_code(405);
}

function handlePostRequest() {
    // Logic to handle POST requests (login, etc.)
    // For example, validate JWT or process a payment
    echo json_encode(['message' => 'Post request processed']);
}

function handleGetRequest() {
    // Logic to handle GET requests (get account info, transactions, etc.)
    echo json_encode(['message' => 'Get request processed']);
}
