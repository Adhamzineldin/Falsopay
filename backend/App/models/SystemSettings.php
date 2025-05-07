<?php

namespace App\models;

use App\database\Database;
use PDO;
use Exception;

class SystemSettings
{
    private PDO $pdo;
    private static array $cache = [];
    private const DEFAULT_SETTINGS = [
        'transfer_limit_enabled' => false,
        'transfer_limit_amount' => 5000,
        'transactions_blocked' => false,
        'block_message' => '',
        'last_updated' => null,
        'updated_by' => null
    ];

    public function __construct()
    {
        $this->pdo = Database::getInstance()->getConnection();
        $this->initTable();
    }

    /**
     * Initialize the settings table if it doesn't exist
     */
    private function initTable(): void
    {
        try {
            $sql = "
            CREATE TABLE IF NOT EXISTS system_settings (
                setting_key VARCHAR(255) PRIMARY KEY,
                setting_value TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                updated_by INT NULL,
                FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL
            )
            ";
            $this->pdo->exec($sql);

            // Check if we need to insert default settings
            $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM system_settings");
            $stmt->execute();
            if ($stmt->fetchColumn() == 0) {
                $this->initDefaultSettings();
            }
        } catch (Exception $e) {
            error_log("Error initializing system settings table: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Initialize default settings values
     */
    private function initDefaultSettings(): void
    {
        try {
            $settings = self::DEFAULT_SETTINGS;
            $settings['last_updated'] = date('Y-m-d H:i:s');
            
            $stmt = $this->pdo->prepare("
                INSERT INTO system_settings (setting_key, setting_value) 
                VALUES ('transfer_settings', :settings)
            ");
            $stmt->execute([
                'settings' => json_encode($settings)
            ]);
        } catch (Exception $e) {
            error_log("Error initializing default settings: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get all system settings
     */
    public function getSettings(): array
    {
        try {
            // Check cache first
            if (!empty(self::$cache)) {
                return self::$cache;
            }

            $stmt = $this->pdo->prepare("
                SELECT setting_key, setting_value, updated_at, updated_by 
                FROM system_settings
                WHERE setting_key = 'transfer_settings'
            ");
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($result) {
                $settings = json_decode($result['setting_value'], true);
                $settings['updated_at'] = $result['updated_at'];
                // Cache the result
                self::$cache = $settings;
                return $settings;
            }

            // If no settings found, create default settings and return them
            $this->initDefaultSettings();
            self::$cache = self::DEFAULT_SETTINGS;
            return self::DEFAULT_SETTINGS;
        } catch (Exception $e) {
            error_log("Error getting system settings: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update system settings
     */
    public function updateSettings(array $settings, int $userId = null): bool
    {
        try {
            // Get current settings
            $currentSettings = $this->getSettings();
            
            // Merge with new settings (only update provided fields)
            $newSettings = array_merge($currentSettings, $settings);
            $newSettings['last_updated'] = date('Y-m-d H:i:s');
            $newSettings['updated_by'] = $userId;
            
            // Update in database - handle case when userId is null
            if ($userId !== null) {
                $stmt = $this->pdo->prepare("
                    UPDATE system_settings 
                    SET setting_value = :settings, updated_by = :userId
                    WHERE setting_key = 'transfer_settings'
                ");
                $result = $stmt->execute([
                    'settings' => json_encode($newSettings),
                    'userId' => $userId
                ]);
            } else {
                // If userId is null, don't update the updated_by field
                $stmt = $this->pdo->prepare("
                    UPDATE system_settings 
                    SET setting_value = :settings
                    WHERE setting_key = 'transfer_settings'
                ");
                $result = $stmt->execute([
                    'settings' => json_encode($newSettings)
                ]);
            }
            
            // Update cache
            self::$cache = $newSettings;
            
            return $result;
        } catch (Exception $e) {
            error_log("Error updating system settings: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Clear the settings cache
     */
    public static function clearCache(): void
    {
        self::$cache = [];
    }
} 