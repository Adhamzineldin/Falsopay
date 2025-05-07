<?php

namespace App\controllers;

use App\models\SystemSettings;
use Exception;

class SystemController
{
    private SystemSettings $systemSettingsModel;

    /**
     * @throws Exception
     */
    public function __construct()
    {
        $this->systemSettingsModel = new SystemSettings();
    }

    /**
     * Get system settings
     * 
     * @return array Response with system settings
     */
    public function getSettings(): array
    {
        try {
            $settings = $this->systemSettingsModel->getSettings();
            
            return [
                'status' => 'success',
                'data' => $settings,
                'code' => 200
            ];
        } catch (Exception $e) {
            error_log("Error getting system settings: " . $e->getMessage());
            return [
                'status' => 'error',
                'message' => 'Failed to retrieve system settings: ' . $e->getMessage(),
                'code' => 500
            ];
        }
    }

    /**
     * Update system settings
     * 
     * @param array $data New settings data
     * @param int $userId Admin user ID
     * @return array Response with status
     */
    public function updateSettings(array $data, int $userId): array
    {
        try {
            // Validate data
            $validKeys = [
                'transfer_limit_enabled',
                'transfer_limit_amount',
                'transactions_blocked', 
                'block_message'
            ];
            
            $updateData = [];
            foreach ($validKeys as $key) {
                if (isset($data[$key])) {
                    $updateData[$key] = $data[$key];
                }
            }

            // Validate transfer_limit_amount is a positive number if set
            if (isset($updateData['transfer_limit_amount'])) {
                $amount = floatval($updateData['transfer_limit_amount']);
                if ($amount <= 0) {
                    return [
                        'status' => 'error',
                        'message' => 'Transfer limit amount must be greater than zero',
                        'code' => 400
                    ];
                }
                $updateData['transfer_limit_amount'] = $amount;
            }

            // Update settings
            $result = $this->systemSettingsModel->updateSettings($updateData, $userId);
            
            if ($result) {
                return [
                    'status' => 'success',
                    'message' => 'System settings updated successfully',
                    'data' => $this->systemSettingsModel->getSettings(),
                    'code' => 200
                ];
            } else {
                return [
                    'status' => 'error',
                    'message' => 'Failed to update system settings',
                    'code' => 500
                ];
            }
        } catch (Exception $e) {
            error_log("Error updating system settings: " . $e->getMessage());
            return [
                'status' => 'error',
                'message' => 'Failed to update system settings: ' . $e->getMessage(),
                'code' => 500
            ];
        }
    }

    /**
     * Get system status for public API
     * 
     * @return array Response with system status
     */
    public function getPublicStatus(): array
    {
        try {
            $settings = $this->systemSettingsModel->getSettings();
            
            // Only return public-facing information
            $publicInfo = [
                'transactions_enabled' => !$settings['transactions_blocked'],
                'message' => $settings['transactions_blocked'] ? $settings['block_message'] : null,
                'transfer_limit' => $settings['transfer_limit_enabled'] ? $settings['transfer_limit_amount'] : null
            ];
            
            return [
                'status' => 'success',
                'data' => $publicInfo,
                'code' => 200
            ];
        } catch (Exception $e) {
            error_log("Error getting public system status: " . $e->getMessage());
            return [
                'status' => 'error',
                'message' => 'Failed to retrieve system status',
                'code' => 500
            ];
        }
    }
} 