<?php

namespace App\middleware;


class AuthMiddleware {
    public static function check(): void {
        if (empty($_SERVER['HTTP_AUTHORIZATION'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit;
        }

        // Validate JWT or session (you can plug this in later)
    }
}
