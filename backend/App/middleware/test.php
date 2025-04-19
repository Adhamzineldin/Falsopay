<?php

require_once __DIR__ . '/../../vendor/autoload.php';

use App\middleware\AuthMiddleware;

// Simulate user ID for testing
$userId = 1;

// 🔐 Generate token for the test user
echo "Generating token for user $userId...\n";
$token = AuthMiddleware::generateToken($userId);
echo "Generated Token: $token\n\n";

// Set the Authorization header manually for testing
// Normally this would be sent by the client, but we're simulating here
$_SERVER['HTTP_AUTHORIZATION'] = 'Bearer ' . $token; // Set the authorization header

// ✅ Test token validation and authorization
echo "Testing authorization with valid token...\n";
if (AuthMiddleware::ensureAuthenticated()) {
    echo "✅ Authorized user ID: " . AuthMiddleware::getAuthenticatedUserId() . "\n\n";
} else {
    echo "❌ Unauthorized\n\n";

// Now simulate a scenario where the token is invalid or missing
    echo "Testing authorization with invalid token...\n";

// Clear the Authorization header (simulating an invalid request)
    unset($_SERVER['HTTP_AUTHORIZATION']);

    if (AuthMiddleware::ensureAuthenticated()) {
        echo "✅ Authorized\n\n";
    } else {
        echo "❌ Unauthorized: Token missing or invalid\n\n";

// Simulate a wrong token by setting an invalid token
        $_SERVER['HTTP_AUTHORIZATION'] = 'Bearer InvalidToken123';

        echo "Testing authorization with an invalid token...\n";
        if (AuthMiddleware::ensureAuthenticated()) {
            echo "✅ Authorized\n\n";
        } else {
            echo "❌ Unauthorized: Invalid token\n\n";
        }
    }
    }