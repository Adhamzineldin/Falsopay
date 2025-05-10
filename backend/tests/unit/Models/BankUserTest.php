<?php

namespace Tests\unit\Models;

use App\models\BankUser;
use Tests\unit\TestCase;
use Mockery;
use PDO;
use PDOStatement;

class BankUserTest extends TestCase
{
    protected $pdo;
    protected $bankUser;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        // Create mock PDO
        $this->pdo = Mockery::mock(PDO::class);
        
        // Create BankUser instance and set PDO using reflection
        $this->bankUser = new BankUser();
        $reflection = new \ReflectionClass($this->bankUser);
        $property = $reflection->getProperty('pdo');
        $property->setAccessible(true);
        $property->setValue($this->bankUser, $this->pdo);
    }
    
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
    
    public function testGetByIdReturnsBankUserWhenFound()
    {
        // Mock data
        $bankUserId = 1;
        $expectedBankUser = [
            'bank_user_id' => $bankUserId,
            'bank_id' => 1,
            'phone_number' => '1234567890',
            'name' => 'John Doe'
        ];
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')->once()->with(['bank_user_id' => $bankUserId])->andReturn(true);
        $stmt->shouldReceive('fetch')->once()->with(PDO::FETCH_ASSOC)->andReturn($expectedBankUser);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM bank_users WHERE bank_user_id = :bank_user_id")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->bankUser->getById($bankUserId);
        
        // Assert result
        $this->assertEquals($expectedBankUser, $result);
    }
    
    public function testGetByIdReturnsNullWhenNotFound()
    {
        // Mock data
        $bankUserId = 999; // Non-existent bank user
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')->once()->with(['bank_user_id' => $bankUserId])->andReturn(true);
        $stmt->shouldReceive('fetch')->once()->with(PDO::FETCH_ASSOC)->andReturn(false);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM bank_users WHERE bank_user_id = :bank_user_id")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->bankUser->getById($bankUserId);
        
        // Assert result
        $this->assertNull($result);
    }
    
    public function testGetByPhoneNumberReturnsBankUserWhenFound()
    {
        // Mock data
        $phoneNumber = '1234567890';
        $expectedBankUser = [
            'bank_user_id' => 1,
            'bank_id' => 1,
            'phone_number' => $phoneNumber,
            'name' => 'John Doe'
        ];
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')->once()->with(['phone_number' => $phoneNumber])->andReturn(true);
        $stmt->shouldReceive('fetch')->once()->with(PDO::FETCH_ASSOC)->andReturn($expectedBankUser);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM bank_users WHERE phone_number = :phone_number")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->bankUser->getByPhoneNumber($phoneNumber);
        
        // Assert result
        $this->assertEquals($expectedBankUser, $result);
    }
    
    public function testGetByPhoneNumberReturnsNullWhenNotFound()
    {
        // Mock data
        $phoneNumber = '9999999999'; // Non-existent phone number
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')->once()->with(['phone_number' => $phoneNumber])->andReturn(true);
        $stmt->shouldReceive('fetch')->once()->with(PDO::FETCH_ASSOC)->andReturn(false);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM bank_users WHERE phone_number = :phone_number")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->bankUser->getByPhoneNumber($phoneNumber);
        
        // Assert result
        $this->assertNull($result);
    }
} 