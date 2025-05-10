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
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@example.com',
            'phone_number' => '1234567890',
            'date_of_birth' => '1990-01-01',
            'created_at' => '2024-01-01 00:00:00'
        ];
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('bindParam')
            ->once()
            ->with(':id', $bankUserId)
            ->andReturn(true);
        $stmt->shouldReceive('execute')
            ->once()
            ->andReturn(true);
        $stmt->shouldReceive('fetch')
            ->once()
            ->with(PDO::FETCH_ASSOC)
            ->andReturn($expectedBankUser);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM bank_users WHERE bank_user_id = :id")
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
        $stmt->shouldReceive('bindParam')
            ->once()
            ->with(':id', $bankUserId)
            ->andReturn(true);
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
            ->with("SELECT * FROM bank_users WHERE bank_user_id = :id")
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
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@example.com',
            'phone_number' => $phoneNumber,
            'date_of_birth' => '1990-01-01',
            'created_at' => '2024-01-01 00:00:00'
        ];
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('bindParam')
            ->once()
            ->with(':phoneNumber', $phoneNumber)
            ->andReturn(true);
        $stmt->shouldReceive('execute')
            ->once()
            ->andReturn(true);
        $stmt->shouldReceive('fetch')
            ->once()
            ->with(PDO::FETCH_ASSOC)
            ->andReturn($expectedBankUser);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM bank_users WHERE phone_number = :phoneNumber")
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
        $stmt->shouldReceive('bindParam')
            ->once()
            ->with(':phoneNumber', $phoneNumber)
            ->andReturn(true);
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
            ->with("SELECT * FROM bank_users WHERE phone_number = :phoneNumber")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->bankUser->getByPhoneNumber($phoneNumber);
        
        // Assert result
        $this->assertNull($result);
    }
} 