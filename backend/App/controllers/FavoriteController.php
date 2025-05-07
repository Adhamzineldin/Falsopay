<?php

namespace App\controllers;

use App\models\Favorite;
use Exception;

class FavoriteController
{
    private Favorite $favoriteModel;

    /**
     * @throws Exception
     */
    public function __construct()
    {
        $this->favoriteModel = new Favorite();
    }

    /**
     * Create a new favorite
     * 
     * @param array $data The request data
     * @return array Response data
     */
    public function createFavorite(array $data): array
    {
        try {
            // Validate required fields
            $requiredFields = ['user_id', 'recipient_identifier', 'recipient_name', 'method'];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field]) || empty($data[$field])) {
                    return [
                        'status' => 'error',
                        'message' => "Missing required field: $field",
                        'code' => 400
                    ];
                }
            }

            // Check if favorite already exists for this user with the same identifier and method
            if ($this->favoriteModel->favoriteExists(
                (int)$data['user_id'],
                $data['recipient_identifier'],
                $data['method']
            )) {
                return [
                    'status' => 'error',
                    'message' => 'This recipient is already in your favorites',
                    'code' => 409
                ];
            }

            // Create the favorite
            $favorite = $this->favoriteModel->createFavorite(
                (int)$data['user_id'],
                $data['recipient_identifier'],
                $data['recipient_name'],
                $data['method'],
                isset($data['bank_id']) ? (int)$data['bank_id'] : null
            );

            return [
                'status' => 'success',
                'message' => 'Favorite added successfully',
                'data' => $favorite,
                'code' => 201
            ];

        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Failed to add favorite: ' . $e->getMessage(),
                'code' => 500
            ];
        }
    }

    /**
     * Get all favorites for a user
     * 
     * @param int $userId The user ID
     * @return array Response data
     */
    public function getUserFavorites(int $userId): array
    {
        try {
            $favorites = $this->favoriteModel->getFavoritesByUserId($userId);

            return [
                'status' => 'success',
                'data' => $favorites,
                'code' => 200
            ];

        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Failed to retrieve favorites: ' . $e->getMessage(),
                'code' => 500
            ];
        }
    }

    /**
     * Get favorites for a user filtered by method
     * 
     * @param int $userId The user ID
     * @param string $method The transfer method
     * @return array Response data
     */
    public function getUserFavoritesByMethod(int $userId, string $method): array
    {
        try {
            $favorites = $this->favoriteModel->getFavoritesByMethod($userId, $method);

            return [
                'status' => 'success',
                'data' => $favorites,
                'code' => 200
            ];

        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Failed to retrieve favorites: ' . $e->getMessage(),
                'code' => 500
            ];
        }
    }

    /**
     * Delete a favorite
     * 
     * @param int $favoriteId The favorite ID
     * @param int $userId The user ID (for authorization)
     * @return array Response data
     */
    public function deleteFavorite(int $favoriteId, int $userId): array
    {
        try {
            // First, get the favorite to check ownership
            $favorite = $this->favoriteModel->getFavoriteById($favoriteId);
            
            if (!$favorite) {
                return [
                    'status' => 'error',
                    'message' => 'Favorite not found',
                    'code' => 404
                ];
            }

            // Ensure the favorite belongs to the user
            if ((int)$favorite['user_id'] !== $userId) {
                return [
                    'status' => 'error',
                    'message' => 'Unauthorized access to this favorite',
                    'code' => 403
                ];
            }

            // Delete the favorite
            $result = $this->favoriteModel->deleteFavorite($favoriteId);

            if ($result) {
                return [
                    'status' => 'success',
                    'message' => 'Favorite deleted successfully',
                    'code' => 200
                ];
            } else {
                return [
                    'status' => 'error',
                    'message' => 'Failed to delete favorite',
                    'code' => 500
                ];
            }

        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Failed to delete favorite: ' . $e->getMessage(),
                'code' => 500
            ];
        }
    }

    /**
     * Update a favorite
     * 
     * @param int $favoriteId The favorite ID
     * @param array $data The updated data
     * @return array Response data
     */
    public function updateFavorite(int $favoriteId, array $data): array
    {
        try {
            // First, get the favorite to check if it exists
            $favorite = $this->favoriteModel->getFavoriteById($favoriteId);
            
            if (!$favorite) {
                return [
                    'status' => 'error',
                    'message' => 'Favorite not found',
                    'code' => 404
                ];
            }

            // Ensure the favorite belongs to the user making the request
            if (isset($data['user_id']) && (int)$favorite['user_id'] !== (int)$data['user_id']) {
                return [
                    'status' => 'error',
                    'message' => 'Unauthorized access to this favorite',
                    'code' => 403
                ];
            }

            // Update the favorite
            $result = $this->favoriteModel->updateFavorite($favoriteId, $data);

            if ($result) {
                // Get the updated favorite
                $updatedFavorite = $this->favoriteModel->getFavoriteById($favoriteId);
                
                return [
                    'status' => 'success',
                    'message' => 'Favorite updated successfully',
                    'data' => $updatedFavorite,
                    'code' => 200
                ];
            } else {
                return [
                    'status' => 'error',
                    'message' => 'Failed to update favorite',
                    'code' => 500
                ];
            }

        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Failed to update favorite: ' . $e->getMessage(),
                'code' => 500
            ];
        }
    }
} 