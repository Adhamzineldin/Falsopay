<?php

namespace Tests\Unit\Models;

use App\models\User;
use Tests\Unit\TestCase;
use Mockery;
use PDO;
use PDOStatement;

class UserTest extends TestCase
{
    protected $pdo;
    protected $user;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        // Create mock PDO and PDOStatement
        $this->pdo = Mockery::mock(PDO::class);
        $this->user = $this->createPartialMock(User::class, ['__construct']);
        
        // Set the mocked PDO using reflection
        $reflection = new \ReflectionClass($this->user);
        $property = $reflection->getProperty('pdo');
        $property->setAccessible(true);
        $property->setValue($this->user, $this->pdo);
    }
    
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
    
    public function testGetUserByIdReturnsUserWhenFound()
    {
        // Mock data
        $userId = 1;
        $expectedUser = [
            'user_id' => $userId,
            'first_name' => ' John ',  // With spaces to test trimming
            'last_name' => ' Doe ',    // With spaces to test trimming
            'email' => 'john.doe@example.com',
            'phone_number' => '1234567890',
            'default_account' => 1,
            'role' => 'user'
        ];
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')->once()->with(['user_id' => $userId])->andReturn(true);
        $stmt->shouldReceive('fetch')->once()->with(PDO::FETCH_ASSOC)->andReturn($expectedUser);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM users WHERE user_id = :user_id")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->user->getUserById($userId);
        
        // Assert result
        $this->assertEquals($userId, $result['user_id']);
        $this->assertEquals('John', $result['first_name']); // Should be trimmed
        $this->assertEquals('Doe', $result['last_name']);   // Should be trimmed
        $this->assertEquals('john.doe@example.com', $result['email']);
    }
    
    public function testGetUserByIdReturnsNullWhenNotFound()
    {
        // Mock data
        $userId = 999; // Non-existent user
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')->once()->with(['user_id' => $userId])->andReturn(true);
        $stmt->shouldReceive('fetch')->once()->with(PDO::FETCH_ASSOC)->andReturn(false);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM users WHERE user_id = :user_id")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->user->getUserById($userId);
        
        // Assert result
        $this->assertNull($result);
    }
    
    public function testExistsByPhoneNumberReturnsTrueWhenUserExists()
    {
        $phoneNumber = '1234567890';
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')->once()->with(['phone_number' => $phoneNumber])->andReturn(true);
        $stmt->shouldReceive('fetchColumn')->once()->andReturn(1);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT COUNT(*) FROM users WHERE phone_number = :phone_number")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->user->existsByPhoneNumber($phoneNumber);
        
        // Assert result
        $this->assertTrue($result);
    }
    
    public function testExistsByPhoneNumberReturnsFalseWhenUserDoesNotExist()
    {
        $phoneNumber = '9999999999';
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')->once()->with(['phone_number' => $phoneNumber])->andReturn(true);
        $stmt->shouldReceive('fetchColumn')->once()->andReturn(0);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT COUNT(*) FROM users WHERE phone_number = :phone_number")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->user->existsByPhoneNumber($phoneNumber);
        
        // Assert result
        $this->assertFalse($result);
    }
} 