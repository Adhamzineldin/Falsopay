<?php

namespace App\models;

use App\database\Database;
use App\config\ErrorLogger;
use PDO;
use Exception;

class SystemSettings
{
    private PDO $pdo;
    private static ?array $cache = null;
    private ErrorLogger $logger;
    private const DEFAULT_SETTINGS = [
        'transfer_limit_enabled' => false,
        'transfer_limit_amount' => 5000,
        'transactions_blocked' => false,
        'block_message' => '',
        'maintenance_mode' => false,
        'maintenance_message' => '',
        'updated_at' => null,
        'updated_by' => null
    ];

    public function __construct()
    {
        $this->pdo = Database::getInstance()->getConnection();
        $this->logger = ErrorLogger::getInstance();
    }

    /**
     * Get all system settings
     * @return array The system settings
     */
    public function getSettings(): array
    {
        try {
            // Check cache first
            if (self::$cache !== null) {
                return self::$cache;
            }

            $stmt = $this->pdo->prepare("
                SELECT * FROM system_settings ORDER BY setting_id LIMIT 1
            ");
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($result) {
                $settings = [
                    'transfer_limit_enabled' => (bool)$result['transfer_limit_enabled'],
                    'transfer_limit_amount' => (float)$result['transfer_limit_amount'],
                    'transactions_blocked' => (bool)$result['transactions_blocked'],
                    'block_message' => $result['block_message'],
                    'maintenance_mode' => (bool)$result['maintenance_mode'],
                    'maintenance_message' => $result['maintenance_message'],
                    'updated_at' => $result['updated_at'],
                    'updated_by' => $result['updated_by'],
                    'setting_id' => $result['setting_id']
                ];
                
                // Cache the result
                self::$cache = $settings;
                return $settings;
            }

            // If no settings found, create default settings
            $this->createDefaultSettings();
            
            // Try to get settings again
            return $this->getSettings();
        } catch (Exception $e) {
            $this->logger->log("Error getting system settings: " . $e->getMessage());
            // Return default settings if error
            return self::DEFAULT_SETTINGS;
        }
    }

    /**
     * Create default system settings if none exist
     * @return bool Whether the operation was successful
     */
    private function createDefaultSettings(): bool
    {
        try {
            $stmt = $this->pdo->prepare("
                INSERT INTO system_settings 
                (transfer_limit_enabled, transfer_limit_amount, transactions_blocked, maintenance_mode) 
                VALUES 
                (FALSE, 5000.00, FALSE, FALSE)
            ");
            $result = $stmt->execute();
            
            // Clear cache
            self::$cache = null;
            
            return $result;
        } catch (Exception $e) {
            $this->logger->log("Error creating default system settings: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Update system settings
     * @param array $settings The settings to update
     * @param int|null $userId The ID of the user making the update
     * @return bool Whether the operation was successful
     */
    public function updateSettings(array $settings, ?int $userId = null): bool
    {
        try {
            // Get current settings to get the setting_id
            $currentSettings = $this->getSettings();
            $settingId = $currentSettings['setting_id'] ?? 1;
            
            // Build SQL query dynamically based on provided fields
            $updateFields = [];
            $params = [];
            
            foreach ($settings as $key => $value) {
                // Only update fields that exist in the table
                if (in_array($key, [
                    'transfer_limit_enabled', 
                    'transfer_limit_amount', 
                    'transactions_blocked', 
                    'block_message',
                    'maintenance_mode',
                    'maintenance_message'
                ])) {
                    $updateFields[] = "{$key} = :{$key}";
                    $params[$key] = $value;
                }
            }
            
            if (empty($updateFields)) {
                $this->logger->warning("System settings update failed: No valid fields to update");
                return false; // Nothing to update
            }
            
            // Add the user ID if provided
            if ($userId !== null) {
                $updateFields[] = "updated_by = :updated_by";
                $params['updated_by'] = $userId;
            }
            
            $params['setting_id'] = $settingId;
            
            $sql = "UPDATE system_settings SET " . implode(", ", $updateFields) . " WHERE setting_id = :setting_id";
            $stmt = $this->pdo->prepare($sql);
            $result = $stmt->execute($params);
            
            // Clear cache to force a refresh
            self::$cache = null;
            
            if ($result) {
                $this->logger->info("System settings updated successfully");
            } else {
                $this->logger->error("System settings update failed: Database update returned false");
            }
            
            return $result;
        } catch (Exception $e) {
            $this->logger->error("Error updating system settings: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get public-facing system status
     * @return array The public system status
     */
    public function getPublicStatus(): array
    {
        try {
            $settings = $this->getSettings();
            
            $result = [
                'transactions_enabled' => !$settings['transactions_blocked'] && !$settings['maintenance_mode'],
                'message' => $settings['transactions_blocked'] 
                    ? $settings['block_message'] 
                    : ($settings['maintenance_mode'] ? $settings['maintenance_message'] : null),
                'transfer_limit' => $settings['transfer_limit_enabled'] ? $settings['transfer_limit_amount'] : null
            ];
            
            $this->logger->info("Public system status retrieved: " . json_encode($result));
            return $result;
        } catch (Exception $e) {
            $this->logger->error("Error getting public system status: " . $e->getMessage());
            
            // Return a default status that allows the system to function
            // This prevents maintenance mode from being triggered for transient errors
            return [
                'transactions_enabled' => true,
                'message' => null,
                'transfer_limit' => null
            ];
        }
    }

    /**
     * Clear the settings cache
     */
    public static function clearCache(): void
    {
        self::$cache = null;
    }
    
    /**
     * Get the PDO connection for system status checks
     * 
     * @return PDO The database connection
     */
    public function getPdo(): PDO
    {
        return $this->pdo;
    }
} 