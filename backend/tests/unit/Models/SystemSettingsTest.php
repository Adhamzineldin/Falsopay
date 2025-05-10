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
        
        // Create SystemSettings instance and set PDO using reflection
        $this->systemSettings = new SystemSettings();
        $reflection = new \ReflectionClass($this->systemSettings);
        $property = $reflection->getProperty('pdo');
        $property->setAccessible(true);
        $property->setValue($this->systemSettings, $this->pdo);
    }
    
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
    
    public function testGetAllReturnsAllSettings()
    {
        // Mock data
        $expectedSettings = [
            [
                'setting_id' => 1,
                'setting_key' => 'maintenance_mode',
                'setting_value' => 'false',
                'description' => 'System maintenance mode'
            ],
            [
                'setting_id' => 2,
                'setting_key' => 'max_transaction_amount',
                'setting_value' => '10000',
                'description' => 'Maximum transaction amount'
            ],
            [
                'setting_id' => 3,
                'setting_key' => 'transaction_fee',
                'setting_value' => '0.5',
                'description' => 'Transaction fee percentage'
            ]
        ];
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')->once()->andReturn(true);
        $stmt->shouldReceive('fetchAll')->once()->with(PDO::FETCH_ASSOC)->andReturn($expectedSettings);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM system_settings")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->systemSettings->getAll();
        
        // Assert result
        $this->assertEquals($expectedSettings, $result);
    }
    
    public function testGetByKeyReturnsSettingWhenFound()
    {
        // Mock data
        $key = 'maintenance_mode';
        $expectedSetting = [
            'setting_id' => 1,
            'setting_key' => $key,
            'setting_value' => 'false',
            'description' => 'System maintenance mode'
        ];
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(['setting_key' => $key])
            ->andReturn(true);
        $stmt->shouldReceive('fetch')->once()->with(PDO::FETCH_ASSOC)->andReturn($expectedSetting);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM system_settings WHERE setting_key = :setting_key")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->systemSettings->getByKey($key);
        
        // Assert result
        $this->assertEquals($expectedSetting, $result);
    }
    
    public function testGetByKeyReturnsNullWhenNotFound()
    {
        // Mock data
        $key = 'nonexistent_setting';
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(['setting_key' => $key])
            ->andReturn(true);
        $stmt->shouldReceive('fetch')->once()->with(PDO::FETCH_ASSOC)->andReturn(false);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM system_settings WHERE setting_key = :setting_key")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->systemSettings->getByKey($key);
        
        // Assert result
        $this->assertNull($result);
    }
    
    public function testUpdateSettingUpdatesSuccessfully()
    {
        // Mock data
        $key = 'maintenance_mode';
        $value = 'true';
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with([
                'setting_key' => $key,
                'setting_value' => $value
            ])
            ->andReturn(true);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("UPDATE system_settings SET setting_value = :setting_value WHERE setting_key = :setting_key")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->systemSettings->updateSetting($key, $value);
        
        // Assert result
        $this->assertTrue($result);
    }
    
    public function testCreateSettingCreatesSuccessfully()
    {
        // Mock data
        $key = 'new_setting';
        $value = 'new_value';
        $description = 'New system setting';
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with([
                'setting_key' => $key,
                'setting_value' => $value,
                'description' => $description
            ])
            ->andReturn(true);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("INSERT INTO system_settings (setting_key, setting_value, description) VALUES (:setting_key, :setting_value, :description)")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->systemSettings->createSetting($key, $value, $description);
        
        // Assert result
        $this->assertTrue($result);
    }
} 