<?php

namespace App\database;

use Exception;
use PDO;

require_once __DIR__ . '/../../vendor/autoload.php';
class Migration {
    private PDO $pdo;
    private string $logFile = 'migration_log.txt';

    public function __construct() {
        try {
            // Get database connection from the existing Database class
            $database = Database::getInstance();
            $this->pdo = $database->getConnection();

            // Initialize log file
            $this->log("Migration started at " . date('Y-m-d H:i:s'));

        } catch (Exception $e) {
            die("Database connection failed: " . $e->getMessage());
        }
    }

    /**
     * Run the full migration process
     */
    public function run(): void {
        try {
            // Begin transaction for safety
            $this->pdo->beginTransaction();

            // Step 1: Update schema using the existing schema file
            $this->log("Step 1: Updating base schema...");
            $this->updateSchema();

            // Step 2: Add new indexes
            $this->log("Step 2: Adding performance indexes...");
            $this->addIndexes();

            

            // Commit all changes
            $this->pdo->commit();
            $this->log("Migration completed successfully!");
            echo "Migration completed successfully!\n";

        } catch (Exception $e) {
            // Rollback on error
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            $error = "Migration failed: " . $e->getMessage();
            $this->log($error);
            echo $error . "\n";
        }
    }

    /**
     * Update schema by including the schema file
     */
    private function updateSchema(): void {
        try {
            // Use require_once to run the schema creation script
            // This assumes schema.php is in the same directory
            require_once 'schema.php';
            $this->log("Base schema updated successfully");
        } catch (Exception $e) {
            $this->log("Schema update error: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Add performance indexes to the database
     */
    private function addIndexes(): void {
        try {
            // Create indexes for better performance
            $sql = /* language=SQL */ "
            -- Indexes for banks table
            CREATE INDEX idx_bank_code ON banks(bank_code);
            CREATE INDEX idx_swift_code ON banks(swift_code);
            
            -- Indexes for bank_users table
            CREATE INDEX idx_bank_user_email ON bank_users(email);
            CREATE INDEX  idx_bank_user_name ON bank_users(last_name, first_name);
            CREATE INDEX  idx_bank_user_phone ON bank_users(phone_number);
            
            -- Indexes for users table
            CREATE INDEX  idx_user_email ON users(email);
            CREATE INDEX  idx_user_name ON users(last_name, first_name);
            CREATE INDEX  idx_user_phone ON users(phone_number);
            CREATE INDEX  idx_default_account ON users(default_account);
            
            -- Indexes for bank_accounts table
            CREATE INDEX  idx_bank_account_user ON bank_accounts(bank_user_id);
            CREATE INDEX  idx_bank_account_iban ON bank_accounts(iban);
            CREATE INDEX  idx_bank_account_status ON bank_accounts(status);
            CREATE INDEX  idx_bank_account_type ON bank_accounts(type);
            
            -- Indexes for instant_payment_addresses table
            CREATE INDEX  idx_ipa_address ON instant_payment_addresses(ipa_address);
            CREATE INDEX  idx_ipa_user ON instant_payment_addresses(user_id);
            CREATE INDEX  idx_ipa_bank_account ON instant_payment_addresses(bank_id, account_number);
            
            -- Indexes for cards table
            CREATE INDEX  idx_card_bank_user ON cards(bank_user_id);
            CREATE INDEX  idx_card_bank ON cards(bank_id);
            CREATE INDEX  idx_card_number ON cards(card_number);
            CREATE INDEX  idx_card_type ON cards(card_type);
            
            -- Indexes for transactions table
            CREATE INDEX  idx_transaction_sender_user ON transactions(sender_user_id);
            CREATE INDEX  idx_transaction_receiver_user ON transactions(receiver_user_id);
            CREATE INDEX  idx_transaction_sender_account ON transactions(sender_bank_id, sender_account_number);
            CREATE INDEX  idx_transaction_receiver_account ON transactions(receiver_bank_id, receiver_account_number);
            CREATE INDEX  idx_transaction_sender_ipa ON transactions(sender_ipa_address);
            CREATE INDEX  idx_transaction_receiver_ipa ON transactions(receiver_ipa_address);
            CREATE INDEX  idx_transaction_receiver_phone ON transactions(receiver_phone);
            CREATE INDEX  idx_transaction_receiver_card ON transactions(receiver_card);
            CREATE INDEX  idx_transaction_receiver_iban ON transactions(receiver_iban);
            CREATE INDEX  idx_transaction_method ON transactions(transfer_method);
            CREATE INDEX  idx_transaction_time ON transactions(transaction_time);
            ";

            $this->pdo->exec($sql);
            $this->log("Indexes added successfully");
        } catch (Exception $e) {
            $this->log("Index creation error: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Perform any data migrations if needed
     * Add specific data migration logic here
     */
    private function migrateData(): void {
        try {
            // Example data migration (currently no data migrations required)
            // $this->pdo->exec("UPDATE users SET some_field = 'new_value' WHERE condition");
            $this->log("No data migrations needed at this time");
        } catch (Exception $e) {
            $this->log("Data migration error: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Log migration messages to file
     */
    private function log(string $message): void {
        $timestamp = date('Y-m-d H:i:s');
        $logMessage = "[$timestamp] $message\n";
        file_put_contents($this->logFile, $logMessage, FILE_APPEND);
    }
}

// If this script is executed directly, run the migration
if (basename(__FILE__) == basename($_SERVER['SCRIPT_FILENAME'])) {
    // Create and run migration
    $migration = new Migration();
    $migration->run();
}