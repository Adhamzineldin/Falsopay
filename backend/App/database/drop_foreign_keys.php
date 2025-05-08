<?php

require_once __DIR__ . '/vendor/autoload.php';
use App\database\Database;
use App\config\ErrorLogger;

// Initialize logger
$logger = ErrorLogger::getInstance();

// Connect to the database
try {
    $dbConnection = Database::getInstance()->getConnection();
    echo "Connected to database. Dropping foreign keys...\n";
    $logger->info("Starting to drop foreign key constraints");

    // Disable foreign key checks temporarily
    $dbConnection->exec("SET FOREIGN_KEY_CHECKS = 0;");

    // First, get all foreign key constraints for system_settings
    $stmt = $dbConnection->query("
        SELECT CONSTRAINT_NAME 
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'system_settings' 
        AND REFERENCED_TABLE_NAME IS NOT NULL
    ");
    
    $constraints = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Drop each constraint
    foreach ($constraints as $constraint) {
        $dbConnection->exec("ALTER TABLE system_settings DROP FOREIGN KEY `$constraint`;");
        echo "Dropped constraint $constraint from system_settings table\n";
        $logger->info("Dropped constraint $constraint from system_settings table");
    }
    
    // Get all foreign key constraints for favorites
    $stmt = $dbConnection->query("
        SELECT CONSTRAINT_NAME 
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'favorites' 
        AND REFERENCED_TABLE_NAME IS NOT NULL
    ");
    
    $constraints = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Drop each constraint
    foreach ($constraints as $constraint) {
        $dbConnection->exec("ALTER TABLE favorites DROP FOREIGN KEY `$constraint`;");
        echo "Dropped constraint $constraint from favorites table\n";
        $logger->info("Dropped constraint $constraint from favorites table");
    }
    
    // Get all foreign key constraints for support_tickets and support_replies
    $stmt = $dbConnection->query("
        SELECT TABLE_NAME, CONSTRAINT_NAME 
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME IN ('support_tickets', 'support_replies') 
        AND REFERENCED_TABLE_NAME IS NOT NULL
    ");
    
    $ticketConstraints = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Drop each constraint
    foreach ($ticketConstraints as $constraint) {
        $tableName = $constraint['TABLE_NAME'];
        $constraintName = $constraint['CONSTRAINT_NAME'];
        $dbConnection->exec("ALTER TABLE `$tableName` DROP FOREIGN KEY `$constraintName`;");
        echo "Dropped constraint $constraintName from $tableName table\n";
        $logger->info("Dropped constraint $constraintName from $tableName table");
    }
    
    // Also check for any other constraints referencing the users table
    $stmt = $dbConnection->query("
        SELECT TABLE_NAME, CONSTRAINT_NAME 
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND REFERENCED_TABLE_NAME = 'users'
    ");
    
    $userConstraints = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Drop each constraint
    foreach ($userConstraints as $constraint) {
        $tableName = $constraint['TABLE_NAME'];
        $constraintName = $constraint['CONSTRAINT_NAME'];
        $dbConnection->exec("ALTER TABLE `$tableName` DROP FOREIGN KEY `$constraintName`;");
        echo "Dropped constraint $constraintName from $tableName table (referencing users)\n";
        $logger->info("Dropped constraint $constraintName from $tableName table (referencing users)");
    }
    
    // Re-enable foreign key checks
    $dbConnection->exec("SET FOREIGN_KEY_CHECKS = 1;");

    echo "All specified foreign key constraints dropped successfully.\n";
    echo "You can now drop tables without foreign key constraint errors.\n";
    $logger->info("Successfully dropped all specified foreign key constraints");
} catch (\Exception $e) {
    $errorMsg = "Error: " . $e->getMessage();
    echo $errorMsg . "\n";
    $logger->error($errorMsg);
    
    // Make sure to re-enable foreign key checks even on error
    try {
        $dbConnection->exec("SET FOREIGN_KEY_CHECKS = 1;");
    } catch (\Exception $ex) {
        $errorMsg = "Error resetting foreign key checks: " . $ex->getMessage();
        echo $errorMsg . "\n";
        $logger->error($errorMsg);
    }
} 