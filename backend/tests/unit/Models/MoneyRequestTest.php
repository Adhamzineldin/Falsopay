<?php

namespace Tests\unit\Models;

use App\models\MoneyRequest;
use Tests\unit\TestCase;
use Mockery;
use PDO;
use PDOStatement;

class MoneyRequestTest extends TestCase
{
    protected $pdo;
    protected $moneyRequest;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        // Create mock PDO
        $this->pdo = Mockery::mock(PDO::class);
        
        // Create MoneyRequest instance and set PDO using reflection
        $this->moneyRequest = new MoneyRequest();
        $reflection = new \ReflectionClass($this->moneyRequest);
        $property = $reflection->getProperty('pdo');
        $property->setAccessible(true);
        $property->setValue($this->moneyRequest, $this->pdo);
    }
    
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
    
    public function testGetByUserIdReturnsRequestsWhenFound()
    {
        // Mock data
        $userId = 1;
        $expectedRequests = [
            [
                'request_id' => 1,
                'sender_id' => $userId,
                'receiver_id' => 2,
                'amount' => 100.00,
                'status' => 'pending',
                'created_at' => '2024-03-20 10:00:00'
            ],
            [
                'request_id' => 2,
                'sender_id' => 3,
                'receiver_id' => $userId,
                'amount' => 50.00,
                'status' => 'pending',
                'created_at' => '2024-03-20 11:00:00'
            ]
        ];
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(['user_id' => $userId])
            ->andReturn(true);
        $stmt->shouldReceive('fetchAll')->once()->with(PDO::FETCH_ASSOC)->andReturn($expectedRequests);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM money_requests WHERE sender_id = :user_id OR receiver_id = :user_id")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->moneyRequest->getByUserId($userId);
        
        // Assert result
        $this->assertEquals($expectedRequests, $result);
    }
    
    public function testGetByUserIdReturnsEmptyArrayWhenNoRequestsFound()
    {
        // Mock data
        $userId = 999; // Non-existent user
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(['user_id' => $userId])
            ->andReturn(true);
        $stmt->shouldReceive('fetchAll')->once()->with(PDO::FETCH_ASSOC)->andReturn([]);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM money_requests WHERE sender_id = :user_id OR receiver_id = :user_id")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->moneyRequest->getByUserId($userId);
        
        // Assert result
        $this->assertEmpty($result);
    }
    
    public function testGetByIdReturnsRequestWhenFound()
    {
        // Mock data
        $requestId = 1;
        $expectedRequest = [
            'request_id' => $requestId,
            'sender_id' => 1,
            'receiver_id' => 2,
            'amount' => 100.00,
            'status' => 'pending',
            'created_at' => '2024-03-20 10:00:00'
        ];
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(['request_id' => $requestId])
            ->andReturn(true);
        $stmt->shouldReceive('fetch')->once()->with(PDO::FETCH_ASSOC)->andReturn($expectedRequest);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM money_requests WHERE request_id = :request_id")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->moneyRequest->getById($requestId);
        
        // Assert result
        $this->assertEquals($expectedRequest, $result);
    }
    
    public function testGetByIdReturnsNullWhenNotFound()
    {
        // Mock data
        $requestId = 999; // Non-existent request
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(['request_id' => $requestId])
            ->andReturn(true);
        $stmt->shouldReceive('fetch')->once()->with(PDO::FETCH_ASSOC)->andReturn(false);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM money_requests WHERE request_id = :request_id")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->moneyRequest->getById($requestId);
        
        // Assert result
        $this->assertNull($result);
    }
    
    public function testCreateRequestCreatesSuccessfully()
    {
        // Mock data
        $senderId = 1;
        $receiverId = 2;
        $amount = 100.00;
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with([
                'sender_id' => $senderId,
                'receiver_id' => $receiverId,
                'amount' => $amount,
                'status' => 'pending'
            ])
            ->andReturn(true);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("INSERT INTO money_requests (sender_id, receiver_id, amount, status) VALUES (:sender_id, :receiver_id, :amount, :status)")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->moneyRequest->createRequest($senderId, $receiverId, $amount);
        
        // Assert result
        $this->assertTrue($result);
    }
    
    public function testUpdateStatusUpdatesSuccessfully()
    {
        // Mock data
        $requestId = 1;
        $status = 'accepted';
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with([
                'request_id' => $requestId,
                'status' => $status
            ])
            ->andReturn(true);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("UPDATE money_requests SET status = :status WHERE request_id = :request_id")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->moneyRequest->updateStatus($requestId, $status);
        
        // Assert result
        $this->assertTrue($result);
    }
} 