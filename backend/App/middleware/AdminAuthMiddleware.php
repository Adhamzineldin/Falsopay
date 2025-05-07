<?php

namespace App\middleware;

class AdminAuthMiddleware
{
    // Flag to enable test mode (bypass authentication)
    private static $testMode = true; // Set to true for testing

    /**
     * Middleware to ensure admin user is authenticated
     */
    public static function ensureAdminAuthenticated(): ?string
    {
        // Bypass authentication if test mode is enabled
        if (self::$testMode) {
            return null; // Skip authentication check
        }

        $headers = getallheaders();
        $auth = isset($headers['Authorization']) ? $headers['Authorization'] : null;

        if (!$auth) {
            http_response_code(401);
            return json_encode([
                'success' => false,
                'message' => 'Unauthorized: Authentication token is required.'
            ]);
        }

        if (strpos($auth, 'Bearer ') !== 0) {
            http_response_code(401);
            return json_encode([
                'success' => false,
                'message' => 'Unauthorized: Invalid token format.'
            ]);
        }

        $token = substr($auth, 7);
        
        // In a real application, you would verify the token against a database
        // or use JWT tokens. This is a simplified example.
        // For now, we'll just make sure it exists and meets minimum length.
        if (strlen($token) < 32) {
            http_response_code(401);
            return json_encode([
                'success' => false,
                'message' => 'Unauthorized: Invalid token.'
            ]);
        }

        // Token is valid, continue to the handler
        return null;
    }
} 