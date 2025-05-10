<?php

namespace Tests\unit\Controllers;

use App\controllers\SystemController;
use App\models\SystemSettings;
use Tests\unit\TestCase;
use Mockery;
use PDO;
use PDOStatement;

class SystemControllerTest extends TestCase
{
    protected $pdo;
    protected $systemSettings;
    protected $systemController;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        // Create mock PDO
        $this->pdo = Mockery::mock(PDO::class);
        
        // Create mock models
        $this->systemSettings = Mockery::mock(SystemSettings::class);
        
        // Create SystemController instance and inject dependencies
        $this->systemController = new SystemController($this->systemSettings);
    }
    
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
    
    public function testGetAllSettingsReturnsSettingsWhenFound()
    {
        // Mock data
        $expectedSettings = [
            [
                'setting_id' => 1,
                'key' => 'maintenance_mode',
                'value' => 'false',
                'description' => 'System maintenance mode'
            ],
            [
                'setting_id' => 2,
                'key' => 'max_transaction_amount',
                'value' => '10000',
                'description' => 'Maximum transaction amount'
            ]
        ];
        
        // Mock SystemSettings model methods
        $this->systemSettings->shouldReceive('getAll')
            ->once()
            ->andReturn($expectedSettings);
        
        // Call the method
        $result = $this->systemController->getAllSettings();
        
        // Assert result
        $this->assertTrue($result['success']);
        $this->assertEquals($expectedSettings, $result['settings']);
    }
    
    public function testGetAllSettingsReturnsEmptyArrayWhenNoSettingsFound()
    {
        // Mock SystemSettings model methods
        $this->systemSettings->shouldReceive('getAll')
            ->once()
            ->andReturn([]);
        
        // Call the method
        $result = $this->systemController->getAllSettings();
        
        // Assert result
        $this->assertTrue($result['success']);
        $this->assertEmpty($result['settings']);
    }
    
    public function testGetSettingByKeyReturnsSettingWhenFound()
    {
        // Mock data
        $key = 'maintenance_mode';
        $expectedSetting = [
            'setting_id' => 1,
            'key' => $key,
            'value' => 'false',
            'description' => 'System maintenance mode'
        ];
        
        // Mock SystemSettings model methods
        $this->systemSettings->shouldReceive('getByKey')
            ->once()
            ->with($key)
            ->andReturn($expectedSetting);
        
        // Call the method
        $result = $this->systemController->getSettingByKey($key);
        
        // Assert result
        $this->assertTrue($result['success']);
        $this->assertEquals($expectedSetting, $result['setting']);
    }
    
    public function testGetSettingByKeyReturnsErrorWhenNotFound()
    {
        // Mock data
        $key = 'nonexistent_setting';
        
        // Mock SystemSettings model methods
        $this->systemSettings->shouldReceive('getByKey')
            ->once()
            ->with($key)
            ->andReturn(null);
        
        // Call the method
        $result = $this->systemController->getSettingByKey($key);
        
        // Assert result
        $this->assertFalse($result['success']);
        $this->assertEquals('Setting not found', $result['message']);
    }
    
    public function testUpdateSettingUpdatesSuccessfully()
    {
        // Mock data
        $key = 'maintenance_mode';
        $settingData = [
            'value' => 'true',
            'description' => 'System maintenance mode (updated)'
        ];
        
        // Mock SystemSettings model methods
        $this->systemSettings->shouldReceive('getByKey')
            ->once()
            ->with($key)
            ->andReturn(['key' => $key]);
        
        $this->systemSettings->shouldReceive('update')
            ->once()
            ->with($key, $settingData)
            ->andReturn(true);
        
        // Call the method
        $result = $this->systemController->updateSetting($key, $settingData);
        
        // Assert result
        $this->assertTrue($result['success']);
        $this->assertEquals('Setting updated successfully', $result['message']);
    }
    
    public function testUpdateSettingReturnsErrorWhenNotFound()
    {
        // Mock data
        $key = 'nonexistent_setting';
        $settingData = [
            'value' => 'true',
            'description' => 'System maintenance mode (updated)'
        ];
        
        // Mock SystemSettings model methods
        $this->systemSettings->shouldReceive('getByKey')
            ->once()
            ->with($key)
            ->andReturn(null);
        
        // Call the method
        $result = $this->systemController->updateSetting($key, $settingData);
        
        // Assert result
        $this->assertFalse($result['success']);
        $this->assertEquals('Setting not found', $result['message']);
    }
    
    public function testCreateSettingCreatesSuccessfully()
    {
        // Mock data
        $settingData = [
            'key' => 'new_setting',
            'value' => 'default_value',
            'description' => 'A new system setting'
        ];
        
        // Mock SystemSettings model methods
        $this->systemSettings->shouldReceive('getByKey')
            ->once()
            ->with($settingData['key'])
            ->andReturn(null);
        
        $this->systemSettings->shouldReceive('create')
            ->once()
            ->with($settingData)
            ->andReturn(true);
        
        // Call the method
        $result = $this->systemController->createSetting($settingData);
        
        // Assert result
        $this->assertTrue($result['success']);
        $this->assertEquals('Setting created successfully', $result['message']);
    }
    
    public function testCreateSettingReturnsErrorWhenKeyExists()
    {
        // Mock data
        $settingData = [
            'key' => 'existing_setting',
            'value' => 'default_value',
            'description' => 'A new system setting'
        ];
        
        // Mock SystemSettings model methods
        $this->systemSettings->shouldReceive('getByKey')
            ->once()
            ->with($settingData['key'])
            ->andReturn(['key' => $settingData['key']]);
        
        // Call the method
        $result = $this->systemController->createSetting($settingData);
        
        // Assert result
        $this->assertFalse($result['success']);
        $this->assertEquals('Setting key already exists', $result['message']);
    }
    
    public function testDeleteSettingDeletesSuccessfully()
    {
        // Mock data
        $key = 'maintenance_mode';
        
        // Mock SystemSettings model methods
        $this->systemSettings->shouldReceive('getByKey')
            ->once()
            ->with($key)
            ->andReturn(['key' => $key]);
        
        $this->systemSettings->shouldReceive('delete')
            ->once()
            ->with($key)
            ->andReturn(true);
        
        // Call the method
        $result = $this->systemController->deleteSetting($key);
        
        // Assert result
        $this->assertTrue($result['success']);
        $this->assertEquals('Setting deleted successfully', $result['message']);
    }
    
    public function testDeleteSettingReturnsErrorWhenNotFound()
    {
        // Mock data
        $key = 'nonexistent_setting';
        
        // Mock SystemSettings model methods
        $this->systemSettings->shouldReceive('getByKey')
            ->once()
            ->with($key)
            ->andReturn(null);
        
        // Call the method
        $result = $this->systemController->deleteSetting($key);
        
        // Assert result
        $this->assertFalse($result['success']);
        $this->assertEquals('Setting not found', $result['message']);
    }
    
    public function testIsMaintenanceModeReturnsTrueWhenEnabled()
    {
        // Mock data
        $maintenanceSetting = [
            'key' => 'maintenance_mode',
            'value' => 'true'
        ];
        
        // Mock SystemSettings model methods
        $this->systemSettings->shouldReceive('getByKey')
            ->once()
            ->with('maintenance_mode')
            ->andReturn($maintenanceSetting);
        
        // Call the method
        $result = $this->systemController->isMaintenanceMode();
        
        // Assert result
        $this->assertTrue($result['success']);
        $this->assertTrue($result['maintenance_mode']);
    }
    
    public function testIsMaintenanceModeReturnsFalseWhenDisabled()
    {
        // Mock data
        $maintenanceSetting = [
            'key' => 'maintenance_mode',
            'value' => 'false'
        ];
        
        // Mock SystemSettings model methods
        $this->systemSettings->shouldReceive('getByKey')
            ->once()
            ->with('maintenance_mode')
            ->andReturn($maintenanceSetting);
        
        // Call the method
        $result = $this->systemController->isMaintenanceMode();
        
        // Assert result
        $this->assertTrue($result['success']);
        $this->assertFalse($result['maintenance_mode']);
    }
    
    public function testIsMaintenanceModeReturnsFalseWhenSettingNotFound()
    {
        // Mock SystemSettings model methods
        $this->systemSettings->shouldReceive('getByKey')
            ->once()
            ->with('maintenance_mode')
            ->andReturn(null);
        
        // Call the method
        $result = $this->systemController->isMaintenanceMode();
        
        // Assert result
        $this->assertTrue($result['success']);
        $this->assertFalse($result['maintenance_mode']);
    }
    
    public function testGetSettingsReturnsSettingsWhenFound()
    {
        // Mock data
        $expectedSettings = [
            'transfer_limit_enabled' => false,
            'transfer_limit_amount' => 5000,
            'transactions_blocked' => false,
            'block_message' => '',
            'maintenance_mode' => false,
            'maintenance_message' => '',
            'updated_at' => null,
            'updated_by' => null
        ];
        
        // Mock SystemSettings model methods
        $this->systemSettings->shouldReceive('getSettings')
            ->once()
            ->andReturn($expectedSettings);
        
        // Call the method
        $result = $this->systemController->getSettings();
        
        // Assert result
        $this->assertEquals('success', $result['status']);
        $this->assertEquals($expectedSettings, $result['data']);
        $this->assertEquals(200, $result['code']);
    }
    
    public function testGetSettingsReturnsErrorWhenExceptionOccurs()
    {
        // Mock SystemSettings model methods
        $this->systemSettings->shouldReceive('getSettings')
            ->once()
            ->andThrow(new \Exception('Database error'));
        
        // Call the method
        $result = $this->systemController->getSettings();
        
        // Assert result
        $this->assertEquals('error', $result['status']);
        $this->assertStringContainsString('Failed to retrieve system settings', $result['message']);
        $this->assertEquals(500, $result['code']);
    }
    
    public function testUpdateSettingsUpdatesSuccessfully()
    {
        // Mock data
        $updateData = [
            'transfer_limit_enabled' => true,
            'transfer_limit_amount' => 10000,
            'maintenance_mode' => false
        ];
        
        $userId = 1;
        
        // Mock SystemSettings model methods
        $this->systemSettings->shouldReceive('updateSettings')
            ->once()
            ->with($updateData, $userId)
            ->andReturn(true);
        
        $this->systemSettings->shouldReceive('getSettings')
            ->once()
            ->andReturn($updateData);
        
        // Call the method
        $result = $this->systemController->updateSettings($updateData, $userId);
        
        // Assert result
        $this->assertEquals('success', $result['status']);
        $this->assertEquals('System settings updated successfully', $result['message']);
        $this->assertEquals($updateData, $result['data']);
        $this->assertEquals(200, $result['code']);
    }
    
    public function testUpdateSettingsReturnsErrorWhenNoValidFields()
    {
        // Mock data
        $updateData = [
            'invalid_field' => 'value'
        ];
        
        // Call the method
        $result = $this->systemController->updateSettings($updateData);
        
        // Assert result
        $this->assertEquals('error', $result['status']);
        $this->assertEquals('No valid settings to update', $result['message']);
        $this->assertEquals(400, $result['code']);
    }
    
    public function testUpdateSettingsReturnsErrorWhenInvalidTransferLimit()
    {
        // Mock data
        $updateData = [
            'transfer_limit_amount' => -1000
        ];
        
        // Call the method
        $result = $this->systemController->updateSettings($updateData);
        
        // Assert result
        $this->assertEquals('error', $result['status']);
        $this->assertEquals('Transfer limit amount must be greater than zero', $result['message']);
        $this->assertEquals(400, $result['code']);
    }
    
    public function testGetPublicStatusReturnsStatus()
    {
        // Mock data
        $expectedStatus = [
            'transactions_enabled' => true,
            'message' => null,
            'transfer_limit' => null
        ];
        
        // Mock SystemSettings model methods
        $this->systemSettings->shouldReceive('getPublicStatus')
            ->once()
            ->andReturn($expectedStatus);
        
        // Call the method
        $result = $this->systemController->getPublicStatus();
        
        // Assert result
        $this->assertEquals('success', $result['status']);
        $this->assertEquals($expectedStatus, $result['data']);
        $this->assertEquals(200, $result['code']);
    }
    
    public function testGetAdminSystemStatusReturnsStatus()
    {
        // Mock data
        $expectedStatus = [
            'database' => [
                'status' => 'operational',
                'label' => 'Operational',
                'message' => 'Database connection is working properly',
                'response_time' => '10ms'
            ],
            'server' => [
                'status' => 'operational',
                'label' => 'Operational',
                'message' => 'Server is running normally',
                'memory_usage' => '50MB'
            ],
            'websocket' => [
                'status' => 'operational',
                'label' => 'Operational',
                'message' => 'WebSocket server is running normally',
                'response_time' => '20ms'
            ],
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
        // Mock private methods using reflection
        $reflection = new \ReflectionClass($this->systemController);
        
        $checkDatabaseStatus = $reflection->getMethod('checkDatabaseStatus');
        $checkDatabaseStatus->setAccessible(true);
        $checkDatabaseStatus->shouldReceive('invoke')
            ->andReturn($expectedStatus['database']);
        
        $checkServerStatus = $reflection->getMethod('checkServerStatus');
        $checkServerStatus->setAccessible(true);
        $checkServerStatus->shouldReceive('invoke')
            ->andReturn($expectedStatus['server']);
        
        $checkWebsocketStatus = $reflection->getMethod('checkWebsocketStatus');
        $checkWebsocketStatus->setAccessible(true);
        $checkWebsocketStatus->shouldReceive('invoke')
            ->andReturn($expectedStatus['websocket']);
        
        // Call the method
        $result = $this->systemController->getAdminSystemStatus();
        
        // Assert result
        $this->assertEquals('success', $result['status']);
        $this->assertEquals($expectedStatus, $result['data']);
        $this->assertEquals(200, $result['code']);
    }
} 