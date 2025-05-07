<?php

namespace App\database;

use Exception;
use PDO;
use PDOException;

require_once __DIR__ . '/../../vendor/autoload.php';

class Database {
    private static ?Database $instance = null;
    private ?PDO $conn = null;

 
    private function __construct() {
        $this->loadEnv();
        $this->connect();
    }

   
    public static function getInstance(): Database {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

   
    private function loadEnv(): void {
        if (!file_exists(__DIR__ . '/../../.env')) {
            throw new Exception('.env file not found');
        }

        // Load only once
        if (!isset($_ENV['DB_HOST'])) {
            $dotenv = \Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
            $dotenv->load();
        }
    }

    /**
     * Create the database connection
     * @throws Exception
     */
    private function connect(): void {
        try {
            $host = $_ENV['DB_HOST'] ?? '';
            $port = $_ENV['DB_PORT'] ?? '3306';
            $dbName = $_ENV['DB_NAME'] ?? '';
            $username = $_ENV['DB_USER'] ?? '';
            $password = $_ENV['DB_PASS'] ?? '';

            if (!$host || !$dbName || !$username || !$password) {
                throw new Exception('Database credentials not found in .env');
            }
            
            // Build DSN with proper formatting
            if ($port) {
                $dsn = "mysql:host={$host};port={$port};dbname={$dbName}";
            } else {
                $dsn = "mysql:host={$host};dbname={$dbName}";
            }
            
            // Simpler options without performance optimizations
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ];
           
            $this->conn = new PDO($dsn, $username, $password, $options);
        } catch (PDOException $e) {
            error_log("Database connection error: " . $e->getMessage());
            throw new Exception('Database connection failed: ' . $e->getMessage());
        }
    }

    /**
     * Get the database connection
     */
    public function getConnection(): ?PDO {
        return $this->conn;
    }
}
