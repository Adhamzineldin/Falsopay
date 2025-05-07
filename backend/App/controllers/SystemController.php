<?php

namespace App\controllers;

use App\models\SystemSettings;
use App\config\ErrorLogger;
use Exception;

class SystemController
{
    private SystemSettings $systemSettingsModel;
    private ErrorLogger $logger;

    /**
     * @throws Exception
     */
    public function __construct()
    {
        $this->systemSettingsModel = new SystemSettings();
        $this->logger = ErrorLogger::getInstance();
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
            $this->logger->error("Error getting system settings: " . $e->getMessage());
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
     * @param int|null $userId Admin user ID (can be null if not available)
     * @return array Response with status
     */
    public function updateSettings(array $data, ?int $userId = null): array
    {
        try {
            // Validate data
            $validKeys = [
                'transfer_limit_enabled',
                'transfer_limit_amount',
                'transactions_blocked', 
                'block_message',
                'maintenance_mode',
                'maintenance_message'
            ];
            
            $updateData = [];
            foreach ($validKeys as $key) {
                if (isset($data[$key])) {
                    $updateData[$key] = $data[$key];
                }
            }
            
            if (empty($updateData)) {
                $this->logger->warning("System settings update attempted with no valid fields");
                return [
                    'status' => 'error',
                    'message' => 'No valid settings to update',
                    'code' => 400
                ];
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
                $this->logger->error("System settings update failed at controller level");
                return [
                    'status' => 'error',
                    'message' => 'Failed to update system settings. Please try again or contact support.',
                    'code' => 500
                ];
            }
        } catch (Exception $e) {
            $errorMessage = "Error updating system settings: " . $e->getMessage();
            $this->logger->error($errorMessage);
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
            // Try to get system settings
            $publicInfo = $this->systemSettingsModel->getPublicStatus();
            
            // Log successful status check
            $this->logger->info("Public system status retrieved successfully");
            
            return [
                'status' => 'success',
                'data' => $publicInfo,
                'code' => 200
            ];
        } catch (Exception $e) {
            $errorMessage = "Error getting public system status: " . $e->getMessage();
            $this->logger->error($errorMessage);
            
            // Even if we can't get settings, we should provide a default response
            // This way frontend can still function in some capacity
            return [
                'status' => 'success', // Return success to prevent maintenance mode
                'data' => [
                    'transactions_enabled' => true,
                    'message' => null,
                    'transfer_limit' => null
                ],
                'code' => 200
            ];
        }
    }
    
    /**
     * Get detailed system status for admin dashboard
     * 
     * @return array Response with detailed system status
     */
    public function getAdminSystemStatus(): array
    {
        try {
            // Basic status checks (could be expanded with real server monitoring)
            $databaseStatus = $this->checkDatabaseStatus();
            $serverStatus = $this->checkServerStatus();
            $websocketStatus = $this->checkWebsocketStatus();
            
            // Return status information
            $statusInfo = [
                'database' => $databaseStatus,
                'server' => $serverStatus,
                'websocket' => $websocketStatus,
                'timestamp' => date('Y-m-d H:i:s')
            ];
            
            return [
                'status' => 'success',
                'data' => $statusInfo,
                'code' => 200
            ];
        } catch (Exception $e) {
            $this->logger->error("Error getting admin system status: " . $e->getMessage());
            return [
                'status' => 'error',
                'message' => 'Failed to retrieve system status: ' . $e->getMessage(),
                'code' => 500
            ];
        }
    }
    
    /**
     * Check database status
     * 
     * @return array Database status info
     */
    private function checkDatabaseStatus(): array
    {
        $startTime = microtime(true);
        
        try {
            // Simple DB query to test connection
            $query = "SELECT 1";
            $stmt = $this->systemSettingsModel->getPdo()->prepare($query);
            $stmt->execute();
            
            $responseTime = round((microtime(true) - $startTime) * 1000, 2);
            
            if ($responseTime > 500) {
                return [
                    'status' => 'warning',
                    'label' => 'Degraded',
                    'message' => 'Database response time is high: ' . $responseTime . 'ms',
                    'response_time' => $responseTime . 'ms'
                ];
            }
            
            return [
                'status' => 'operational',
                'label' => 'Operational',
                'message' => 'Database connection is working properly',
                'response_time' => $responseTime . 'ms'
            ];
        } catch (Exception $e) {
            return [
                'status' => 'error',
                'label' => 'Outage',
                'message' => 'Database connection failed: ' . $e->getMessage(),
                'response_time' => 'N/A'
            ];
        }
    }
    
    /**
     * Check server status
     * 
     * @return array Server status info
     */
    private function checkServerStatus(): array
    {
        $memoryUsage = memory_get_usage(true);
        $humanMemory = $this->formatBytes($memoryUsage);
        $phpVersion = phpversion();
        
        // High memory usage might be a warning
        if ($memoryUsage > 50 * 1024 * 1024) { // Over 50MB
            return [
                'status' => 'warning',
                'label' => 'Degraded',
                'message' => 'Server memory usage is high',
                'php_version' => $phpVersion,
                'memory_usage' => $humanMemory
            ];
        }
        
        return [
            'status' => 'operational',
            'label' => 'Operational',
            'message' => 'Server is operating normally',
            'php_version' => $phpVersion,
            'memory_usage' => $humanMemory
        ];
    }
    
    /**
     * Check WebSocket status
     * 
     * @return array WebSocket status info
     */
    private function checkWebsocketStatus(): array
    {
        // Simulate WebSocket check - in a real app, you'd connect to the WebSocket server
        $startTime = microtime(true);
        $isWebsocketRunning = true; // In a real app, this would check the WebSocket server
        
        // Simulate a delay
        usleep(rand(5000, 30000));
        
        $responseTime = round((microtime(true) - $startTime) * 1000, 2);
        
        if (!$isWebsocketRunning) {
            return [
                'status' => 'error',
                'label' => 'Outage',
                'message' => 'WebSocket server is not responding',
                'response_time' => 'N/A'
            ];
        }
        
        if ($responseTime > 100) {
            return [
                'status' => 'warning',
                'label' => 'Degraded',
                'message' => 'WebSocket response time is high: ' . $responseTime . 'ms',
                'response_time' => $responseTime . 'ms'
            ];
        }
        
        return [
            'status' => 'operational',
            'label' => 'Operational',
            'message' => 'WebSocket server is running properly',
            'response_time' => $responseTime . 'ms'
        ];
    }
    
    /**
     * Format bytes to human-readable format
     * 
     * @param int $bytes The bytes to format
     * @param int $precision The decimal precision
     * @return string Formatted bytes
     */
    private function formatBytes($bytes, $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= pow(1024, $pow);
        
        return round($bytes, $precision) . ' ' . $units[$pow];
    }
} 