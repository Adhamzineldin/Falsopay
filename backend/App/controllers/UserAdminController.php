<?php

namespace App\controllers;

use App\models\User;
use JetBrains\PhpStorm\NoReturn;

class UserAdminController
{
    private User $userModel;
    
    public function __construct()
    {
        $this->userModel = new User();
    }
    
    /**
     * Get all users (for admin dashboard)
     */
    #[NoReturn] public function getAllUsers(): array
    {
        $users = $this->userModel->getAllUsers();
        return [
            'status' => 'success',
            'data' => $users,
            'code' => 200
        ];
    }
    
    /**
     * Block a user
     */
    #[NoReturn] public function blockUser(array $data): array
    {
        if (!isset($data['user_id']) || !is_numeric($data['user_id'])) {
            return [
                'status' => 'error',
                'message' => 'Invalid user ID',
                'code' => 400
            ];
        }
        
        $userId = (int)$data['user_id'];
        $reason = $data['reason'] ?? null;
        
        // Check if user exists
        $user = $this->userModel->getUserById($userId);
        if (!$user) {
            return [
                'status' => 'error',
                'message' => 'User not found',
                'code' => 404
            ];
        }
        
        // Don't allow blocking admin users
        if ($user['role'] === 'admin') {
            return [
                'status' => 'error',
                'message' => 'Cannot block admin users',
                'code' => 403
            ];
        }
        
        // Block the user
        $success = $this->userModel->blockUser($userId, $reason);
        
        if ($success) {
            return [
                'status' => 'success',
                'message' => 'User blocked successfully',
                'code' => 200
            ];
        } else {
            return [
                'status' => 'error',
                'message' => 'Failed to block user',
                'code' => 500
            ];
        }
    }
    
    /**
     * Unblock a user
     */
    #[NoReturn] public function unblockUser(array $data): array
    {
        if (!isset($data['user_id']) || !is_numeric($data['user_id'])) {
            return [
                'status' => 'error',
                'message' => 'Invalid user ID',
                'code' => 400
            ];
        }
        
        $userId = (int)$data['user_id'];
        
        // Check if user exists
        $user = $this->userModel->getUserById($userId);
        if (!$user) {
            return [
                'status' => 'error',
                'message' => 'User not found',
                'code' => 404
            ];
        }
        
        // Unblock the user
        $success = $this->userModel->unblockUser($userId);
        
        if ($success) {
            return [
                'status' => 'success',
                'message' => 'User unblocked successfully',
                'code' => 200
            ];
        } else {
            return [
                'status' => 'error',
                'message' => 'Failed to unblock user',
                'code' => 500
            ];
        }
    }
    
    /**
     * Get all blocked users
     */
    #[NoReturn] public function getBlockedUsers(): array
    {
        $users = $this->userModel->getBlockedUsers();
        return [
            'status' => 'success',
            'data' => $users,
            'code' => 200
        ];
    }
} 