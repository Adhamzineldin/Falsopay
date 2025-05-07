<?php

namespace App\config;

class ErrorLogger
{
    private static ?ErrorLogger $instance = null;
    private string $logFile;
    private bool $initialized = false;

    private function __construct()
    {
        // Set the log file path
        $this->logFile = dirname(dirname(__DIR__)) . '/logs/error.log';
        $this->initializeLogger();
    }

    /**
     * Get the singleton instance
     * 
     * @return ErrorLogger The ErrorLogger instance
     */
    public static function getInstance(): ErrorLogger
    {
        if (self::$instance === null) {
            self::$instance = new ErrorLogger();
        }
        
        return self::$instance;
    }

    /**
     * Initialize the error logger
     * 
     * @return void
     */
    private function initializeLogger(): void
    {
        if ($this->initialized) {
            return;
        }

        // Create logs directory if it doesn't exist
        $logsDir = dirname($this->logFile);
        if (!file_exists($logsDir)) {
            mkdir($logsDir, 0777, true);
        }

        // Make sure log file is writable
        if (!file_exists($this->logFile)) {
            touch($this->logFile);
            chmod($this->logFile, 0666);
        }

        // Set PHP error_log to our file
        ini_set('error_log', $this->logFile);
        ini_set('log_errors', 1);
        
        // Override the default error_log function
        $originalErrorLog = 'error_log';
        if (function_exists($originalErrorLog)) {
            // Define our custom error log handler
            set_error_handler(function($errno, $errstr, $errfile, $errline) {
                // Format the error message
                $message = date('[Y-m-d H:i:s]') . " PHP Error [$errno]: $errstr in $errfile on line $errline";
                
                // Write to our log file
                file_put_contents($this->logFile, $message . PHP_EOL, FILE_APPEND);
                
                // Return false to allow PHP's internal error handler to continue
                return false;
            });
        }
        
        $this->initialized = true;
    }

    /**
     * Log an error message
     * 
     * @param string $message The error message
     * @param string $level The error level (ERROR, WARNING, INFO)
     * @return void
     */
    public function log(string $message, string $level = 'ERROR'): void
    {
        $formattedMessage = date('[Y-m-d H:i:s]') . " [$level]: $message";
        file_put_contents($this->logFile, $formattedMessage . PHP_EOL, FILE_APPEND);
    }

    /**
     * Log an error message
     * 
     * @param string $message The error message
     * @return void
     */
    public function error(string $message): void
    {
        $this->log($message, 'ERROR');
    }

    /**
     * Log a warning message
     * 
     * @param string $message The warning message
     * @return void
     */
    public function warning(string $message): void
    {
        $this->log($message, 'WARNING');
    }

    /**
     * Log an info message
     * 
     * @param string $message The info message
     * @return void
     */
    public function info(string $message): void
    {
        $this->log($message, 'INFO');
    }
} 