<?php

namespace App\middleware;

use App\models\User;
use Exception;

/**
 * This middleware checks if the authenticated user has admin role
 */
class AdminMiddleware
{
    private User $userModel;

    /**
     * @throws Exception
     */
    public function __construct()
    {
        $this->userModel = new User();
    }

    /**
     * Process the request and check for admin role
     *
     * @param array $request Request data
     * @return array|bool Returns the request data if successful, false if not
     */
    public function process(array $request)
    {
        // Check if user ID is in the request (should be added by AuthMiddleware)
        if (!isset($request['user_id'])) {
            http_response_code(401);
            echo json_encode([
                'status' => 'error',
                'message' => 'Authentication required',
                'code' => 401
            ]);
            return false;
        }

        try {
            // Check if the user has admin role
            $isAdmin = $this->userModel->isAdmin($request['user_id']);
            
            if (!$isAdmin) {
                http_response_code(403);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Unauthorized. Admin access required',
                    'code' => 403
                ]);
                return false;
            }

            // Add admin flag to the request
            $request['is_admin'] = true;
            
            return $request;
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Server error: ' . $e->getMessage(),
                'code' => 500
            ]);
            return false;
        }
    }
} 