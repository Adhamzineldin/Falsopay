<?php

namespace Tests\unit\Models;

use App\models\SystemSettings;
use Tests\unit\TestCase;
use Mockery;
use PDO;
use PDOStatement;

class SystemSettingsTest extends TestCase
{
    protected $pdo;
    protected $systemSettings;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        // Create mock PDO
        $this->pdo = Mockery::mock(PDO::class);
        
        // Mock Database::getInstance()->getConnection()
        $database = Mockery::mock('overload:App\database\Database');
        $database->shouldReceive('getInstance')
            ->andReturnSelf();
        $database->shouldReceive('getConnection')
            ->andReturn($this->pdo);
        
        // Create SystemSettings instance
        $this->systemSettings = new SystemSettings();
    }
    
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
    
    public function testGetAllReturnsAllSettings()
    {
        // Mock data
        $expectedData = [
            'transfer_limit_enabled' => false,
            'transfer_limit_amount' => 5000,
            'transactions_blocked' => false,
            'block_message' => '',
            'maintenance_mode' => false,
            'maintenance_message' => '',
            'updated_at' => null,
            'updated_by' => null
        ];
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->andReturn(true);
        $stmt->shouldReceive('fetch')
            ->once()
            ->with(PDO::FETCH_ASSOC)
            ->andReturn(false);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM system_settings ORDER BY setting_id LIMIT 1")
            ->andReturn($stmt);
        
        // Mock createDefaultSettings
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("INSERT INTO system_settings 
                (transfer_limit_enabled, transfer_limit_amount, transactions_blocked, maintenance_mode) 
                VALUES 
                (FALSE, 5000.00, FALSE, FALSE)")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->systemSettings->getSettings();
        
        // Assert
        $this->assertEquals($expectedData, $result);
    }
    
    public function testGetByKeyReturnsSettingWhenFound()
    {
        // Mock data
        $expectedData = [
            'transfer_limit_enabled' => false,
            'transfer_limit_amount' => 5000,
            'transactions_blocked' => false,
            'block_message' => '',
            'maintenance_mode' => false,
            'maintenance_message' => '',
            'updated_at' => null,
            'updated_by' => null
        ];
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->andReturn(true);
        $stmt->shouldReceive('fetch')
            ->once()
            ->with(PDO::FETCH_ASSOC)
            ->andReturn($expectedData);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM system_settings ORDER BY setting_id LIMIT 1")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->systemSettings->getSettings();
        
        // Assert
        $this->assertEquals($expectedData['transfer_limit_enabled'], $result['transfer_limit_enabled']);
    }
    
    public function testGetByKeyReturnsNullWhenNotFound()
    {
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->andReturn(true);
        $stmt->shouldReceive('fetch')
            ->once()
            ->with(PDO::FETCH_ASSOC)
            ->andReturn(false);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM system_settings ORDER BY setting_id LIMIT 1")
            ->andReturn($stmt);
        
        // Mock createDefaultSettings
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("INSERT INTO system_settings 
                (transfer_limit_enabled, transfer_limit_amount, transactions_blocked, maintenance_mode) 
                VALUES 
                (FALSE, 5000.00, FALSE, FALSE)")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->systemSettings->getSettings();
        
        // Assert
        $this->assertEquals([
            'transfer_limit_enabled' => false,
            'transfer_limit_amount' => 5000,
            'transactions_blocked' => false,
            'block_message' => '',
            'maintenance_mode' => false,
            'maintenance_message' => '',
            'updated_at' => null,
            'updated_by' => null
        ], $result);
    }
    
    public function testUpdateSettingUpdatesSuccessfully()
    {
        // Mock data
        $settings = [
            'transfer_limit_enabled' => true,
            'transfer_limit_amount' => 10000.00
        ];
        $userId = 1;
        
        // Mock statement for getSettings
        $getStmt = Mockery::mock(PDOStatement::class);
        $getStmt->shouldReceive('execute')
            ->once()
            ->andReturn(true);
        $getStmt->shouldReceive('fetch')
            ->once()
            ->with(PDO::FETCH_ASSOC)
            ->andReturn([
                'setting_id' => 1,
                'transfer_limit_enabled' => false,
                'transfer_limit_amount' => 5000.00,
                'transactions_blocked' => false,
                'block_message' => '',
                'maintenance_mode' => false,
                'maintenance_message' => '',
                'updated_at' => null,
                'updated_by' => null
            ]);
        
        // Mock PDO prepare for getSettings
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM system_settings ORDER BY setting_id LIMIT 1")
            ->andReturn($getStmt);
        
        // Mock statement for update
        $updateStmt = Mockery::mock(PDOStatement::class);
        $updateStmt->shouldReceive('execute')
            ->once()
            ->with(Mockery::on(function($params) use ($settings, $userId) {
                return $params['transfer_limit_enabled'] === 1 &&
                       $params['transfer_limit_amount'] === 10000.00 &&
                       $params['updated_by'] === $userId &&
                       $params['setting_id'] === 1;
            }))
            ->andReturn(true);
        
        // Mock PDO prepare for update
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("UPDATE system_settings SET transfer_limit_enabled = :transfer_limit_enabled, transfer_limit_amount = :transfer_limit_amount, updated_by = :updated_by WHERE setting_id = :setting_id")
            ->andReturn($updateStmt);
        
        // Call the method
        $result = $this->systemSettings->updateSettings($settings, $userId);
        
        // Assert
        $this->assertTrue($result);
    }
    
    public function testCreateDefaultSettingsCreatesSuccessfully()
    {
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->andReturn(true);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("INSERT INTO system_settings 
                (transfer_limit_enabled, transfer_limit_amount, transactions_blocked, maintenance_mode) 
                VALUES 
                (FALSE, 5000.00, FALSE, FALSE)")
            ->andReturn($stmt);
        
        // Call getSettings which will trigger createDefaultSettings internally
        $result = $this->systemSettings->getSettings();
        
        // Assert
        $this->assertEquals([
            'transfer_limit_enabled' => false,
            'transfer_limit_amount' => 5000,
            'transactions_blocked' => false,
            'block_message' => '',
            'maintenance_mode' => false,
            'maintenance_message' => '',
            'updated_at' => null,
            'updated_by' => null
        ], $result);
    }
} 