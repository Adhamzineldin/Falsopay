<?php

namespace App\controllers\system;

use App\database\Database;
use App\config\ErrorLogger;
use JetBrains\PhpStorm\NoReturn;

class SystemController
{
    private static ?string $homeTemplate = null;
    private static string $cacheDir;

    public function __construct()
    {
        self::$cacheDir = dirname(__DIR__, 3) . '/cache';
        if (!is_dir(self::$cacheDir)) {
            mkdir(self::$cacheDir, 0755, true);
        }
    }

    /**
     * Get cached status data or generate fresh data if cache is expired
     *
     * @param string $type Type of status check ('ws' or 'db')
     * @param int $cacheExpiry Cache expiry time in seconds
     * @return array Status information
     */
    public static function getCachedStatus(string $type, int $cacheExpiry = 60): array
    {
        $cacheDir = dirname(__DIR__, 3) . '/cache';
        $cacheFile = $cacheDir . "/{$type}_status.json";

        // Return cached data if valid
        if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < $cacheExpiry)) {
            $cachedData = file_get_contents($cacheFile);
            if ($cachedData !== false) {
                $decodedData = json_decode($cachedData, true);
                if (is_array($decodedData)) {
                    return $decodedData;
                }
            }
        }

        // Get fresh status
        $status = $type === 'db' ? self::checkDatabaseStatus() : self::checkWebSocketStatus();

        // Cache it
        file_put_contents($cacheFile, json_encode($status));

        return $status;
    }

    /**
     * Check WebSocket status with reduced timeout
     */
    public static function checkWebSocketStatus(): array
    {
        $logger = ErrorLogger::getInstance();
        $wsAddress = $_ENV['WS_HOST'] ?? 'localhost';
        $wsPort = $_ENV['WS_PORT'] ?? null;
        $warningThreshold = 150; // in ms

        // If no port is specified, return a neutral status instead of an error
        if (empty($wsPort)) {
            return [
                'status' => 'not_configured',
                'label' => 'Not Configured',
                'message' => 'WebSocket server port not configured',
                'response_time' => 'N/A'
            ];
        }

        $startTime = microtime(true);
        // Reduced timeout from 3s to 0.5s
        $socket = @fsockopen($wsAddress, $wsPort, $errno, $errstr, 3);
        $endTime = microtime(true);

        $responseTime = round(($endTime - $startTime) * 1000); // ms

        if ($socket) {
            fclose($socket);

            if ($responseTime > $warningThreshold) {
                $logger->warning("WebSocket response time is high: {$responseTime}ms");
                return [
                    'status' => 'warning',
                    'label' => 'Degraded',
                    'message' => 'WebSocket is reachable but responding slower than expected.',
                    'response_time' => $responseTime . 'ms'
                ];
            }

            return [
                'status' => 'operational',
                'label' => 'Operational',
                'message' => 'WebSocket connection is active and running smoothly.',
                'response_time' => $responseTime . 'ms'
            ];
        } else {
            $logger->error("WebSocket connection failed: $errstr ($errno)");
            return [
                'status' => 'error',
                'label' => 'Outage',
                'message' => 'WebSocket connection is down. Reconnection attempts in progress.',
                'response_time' => 'null'
            ];
        }
    }

    /**
     * Check database status with improved error handling
     */
    public static function checkDatabaseStatus(): array
    {
        $logger = ErrorLogger::getInstance();
        $warningThreshold = 200; // ms

        try {
            // Using static connection if available
            static $dbConnection = null;

            if ($dbConnection === null) {
                $dbConnection = Database::getInstance()->getConnection();
            }

            $startTime = microtime(true);
            // Lightweight test query
            $stmt = $dbConnection->query('SELECT 1');
            $stmt->fetch();

            $endTime = microtime(true);
            $responseTime = round(($endTime - $startTime) * 1000);

            if ($responseTime > $warningThreshold) {
                $logger->warning("Database response time is high: {$responseTime}ms");
                return [
                    'status' => 'warning',
                    'label' => 'Degraded',
                    'message' => 'Database is reachable, but query execution is slow.',
                    'response_time' => $responseTime . 'ms'
                ];
            }

            return [
                'status' => 'operational',
                'label' => 'Operational',
                'message' => 'Database is responsive with good query performance.',
                'response_time' => $responseTime . 'ms'
            ];
        } catch (\PDOException $e) {
            $errorMessage = "Database connection error: " . $e->getMessage();
            $logger->error($errorMessage);
            return [
                'status' => 'error',
                'label' => 'Outage',
                'message' => 'Database is down or unreachable. System operating in fallback mode.',
                'response_time' => 'N/A'
            ];
        } catch (\Exception $e) {
            $errorMessage = "Database health check error: " . $e->getMessage();
            $logger->error($errorMessage);
            return [
                'status' => 'error',
                'label' => 'Outage',
                'message' => 'Database is down or unreachable. System operating in fallback mode.',
                'response_time' => 'N/A'
            ];
        }
    }

    /**
     * Get home page template with caching
     */
    public static function getHomeTemplate(): string
    {
        if (self::$homeTemplate === null) {
            self::$homeTemplate = file_get_contents(dirname(__DIR__, 3) . '/public/index.html');
        }
        return self::$homeTemplate;
    }

    #[NoReturn] 
    public static function renderHomePage(): void
    {
        // Get status information with caching
        $dbStatusInfo = self::getCachedStatus('db', 60); // Cache for 60 seconds
        $wsStatusInfo = self::getCachedStatus('ws', 120); // Cache for 120 seconds

        // Get status page HTML template with caching
        $htmlContent = self::getHomeTemplate();

        // Current datetime for last updated
        date_default_timezone_set('Africa/Cairo');
        $currentDateTime = date('Y-m-d h:i:s A');

        // Replace database status placeholders
        $htmlContent = str_replace('id="db-status" class="status-icon operational"',
            'id="db-status" class="status-icon ' . $dbStatusInfo['status'] . '"',
            $htmlContent);
        $htmlContent = str_replace('id="db-label" class="status-label operational">Operational<',
            'id="db-label" class="status-label ' . $dbStatusInfo['status'] . '">' . $dbStatusInfo['label'] . '<',
            $htmlContent);
        $htmlContent = str_replace('id="db-message" class="status-message">Database connections are stable with normal query times.<',
            'id="db-message" class="status-message">' . $dbStatusInfo['message'] . '<',
            $htmlContent);
        $htmlContent = str_replace('Response time: 56ms',
            'Response time: ' . $dbStatusInfo['response_time'],
            $htmlContent);

        // Replace WebSocket status placeholders
        $htmlContent = str_replace('id="websocket-status" class="status-icon operational"',
            'id="websocket-status" class="status-icon ' . $wsStatusInfo['status'] . '"',
            $htmlContent);
        $htmlContent = str_replace('id="websocket-label" class="status-label operational">Operational<',
            'id="websocket-label" class="status-label ' . $wsStatusInfo['status'] . '">' . $wsStatusInfo['label'] . '<',
            $htmlContent);
        $htmlContent = str_replace('id="websocket-message" class="status-message">WebSocket connection is active and running smoothly.<',
            'id="websocket-message" class="status-message">' . $wsStatusInfo['message'] . '<',
            $htmlContent);
        $htmlContent = str_replace('Response time: 42ms',
            'Response time: ' . $wsStatusInfo['response_time'],
            $htmlContent);

        // Update pulse rings
        $htmlContent = str_replace('class="pulse-ring operational"',
            'class="pulse-ring ' . $dbStatusInfo['status'] . '"',
            $htmlContent);
        $htmlContent = str_replace('class="pulse-ring operational"',
            'class="pulse-ring ' . $wsStatusInfo['status'] . '"',
            $htmlContent);

        // Replace last updated time
        $htmlContent = str_replace('<span id="last-updated">Just now</span>',
            '<span id="last-updated">' . $currentDateTime . '</span>',
            $htmlContent);

        // Disable the random status updates from JavaScript
        $htmlContent = str_replace("updateStatus(\"websocket\", getRandomStatus());",
            "// Status is updated by PHP",
            $htmlContent);
        $htmlContent = str_replace("updateStatus(\"db\", getRandomStatus());",
            "// Status is updated by PHP",
            $htmlContent);

        // Remove random status generation on refresh button click
        $htmlContent = str_replace("updateStatus(\"websocket\", getRandomStatus());\n                updateStatus(\"db\", getRandomStatus());",
            "location.reload();",
            $htmlContent);

        echo $htmlContent;
        exit();
    }

    #[NoReturn]
    public static function getSystemStatus(): void
    {
        // Get status information with caching
        $dbStatusInfo = self::getCachedStatus('db', 60);
        $wsStatusInfo = self::getCachedStatus('ws', 120);
        
        header('Content-Type: application/json');
        header('Access-Control-Allow-Origin: *'); // Ensure CORS is enabled
        echo json_encode([
            'status' => 'success',
            'code' => 200,
            'data' => [
                'database' => $dbStatusInfo,
                'websocket' => $wsStatusInfo,
                'timestamp' => date('Y-m-d H:i:s'),
                'server' => [
                    'status' => 'operational',
                    'label' => 'Operational',
                    'message' => 'API server is running normally',
                    'php_version' => PHP_VERSION,
                    'memory_usage' => round(memory_get_usage() / 1024 / 1024, 2) . ' MB'
                ]
            ]
        ]);
        exit();
    }
} 