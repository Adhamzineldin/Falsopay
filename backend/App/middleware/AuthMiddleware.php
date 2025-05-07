<?php

namespace App\middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthMiddleware
{
    private static function getSecretKey(): string
    {
        if (!getenv('JWT_SECRET')) {
            $dotenv = \Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
            $dotenv->load();
        }

        return $_ENV['JWT_SECRET'] ?? throw new \Exception('JWT_SECRET not set in .env');
    }

    public static function generateToken(int $userId): string
    {
        $payload = [
            'user_id' => $userId,
            'iat' => time(),
            'exp' => time() + 3600 // Token expires in 1 hour
        ];

        return JWT::encode($payload, self::getSecretKey(), 'HS256');
    }

    /**
     * Validates the token, and returns the decoded payload if valid.
     * Returns null if token is missing or invalid.
     */
    public static function validateToken(): ?object
    {
        if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
            http_response_code(401);
            error_log("Authorization header missing");
            return null;
        }

        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];

        if (!str_starts_with($authHeader, 'Bearer ')) {
            http_response_code(401);
            error_log("Invalid authorization header format");
            return null;
        }

        $jwt = substr($authHeader, 7);

        try {
            return JWT::decode($jwt, new Key(self::getSecretKey(), 'HS256'));
        } catch (\Exception $e) {
            http_response_code(401);
            error_log("Invalid or expired token: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Instance method for middleware processing
     */
    public function process(array $request = []): array|bool
    {
        $payload = self::validateToken();
        if (!$payload || !isset($payload->user_id)) {
            return false;
        }

        // Add user_id to request
        $request['user_id'] = $payload->user_id;
        
        // Store user ID globally for backward compatibility
        $_SERVER['AUTHENTICATED_USER_ID'] = $payload->user_id;
        
        return $request;
    }

    /**
     * Middleware callable to be used in route:
     * call_user_func([$authMiddleware, 'ensureAuthenticated'])
     */
    public static function ensureAuthenticated(): bool
    {
        $payload = self::validateToken();
        if (!$payload || !isset($payload->user_id)) {
            return false;
        }

        // Optional: store user ID globally or in request context
        $_SERVER['AUTHENTICATED_USER_ID'] = $payload->user_id;
        return true;
    }

    public static function getAuthenticatedUserId(): ?int
    {
        return $_SERVER['AUTHENTICATED_USER_ID'] ?? null;
    }
}
