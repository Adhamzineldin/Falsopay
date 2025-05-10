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
        $expectedData = [
            [
                'request_id' => 1,
                'requester_user_id' => 1,
                'requested_user_id' => 2,
                'requester_name' => 'John Doe',
                'requested_name' => 'Jane Smith',
                'amount' => 100.00,
                'requester_ipa_address' => 'john@falsopay.com',
                'requested_ipa_address' => 'jane@falsopay.com',
                'message' => 'Test request',
                'status' => 'pending',
                'created_at' => '2024-03-20 10:00:00'
            ]
        ];
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with([':user_id' => $userId])
            ->andReturn(true);
        $stmt->shouldReceive('fetchAll')
            ->once()
            ->with(PDO::FETCH_ASSOC)
            ->andReturn($expectedData);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with(Mockery::type('string'))
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->moneyRequest->getAllRequestsForUser($userId);
        
        // Assert
        $this->assertEquals($expectedData, $result);
    }
    
    public function testGetByUserIdReturnsEmptyArrayWhenNoRequestsFound()
    {
        // Mock data
        $userId = 1;
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with([':user_id' => $userId])
            ->andReturn(true);
        $stmt->shouldReceive('fetchAll')
            ->once()
            ->with(PDO::FETCH_ASSOC)
            ->andReturn([]);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with(Mockery::type('string'))
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->moneyRequest->getAllRequestsForUser($userId);
        
        // Assert
        $this->assertEquals([], $result);
    }
    
    public function testGetByIdReturnsRequestWhenFound()
    {
        // Mock data
        $requestId = 1;
        $expectedData = [
            'request_id' => 1,
            'requester_user_id' => 1,
            'requested_user_id' => 2,
            'requester_name' => 'John Doe',
            'requested_name' => 'Jane Smith',
            'amount' => 100.00,
            'requester_ipa_address' => 'john@falsopay.com',
            'requested_ipa_address' => 'jane@falsopay.com',
            'message' => 'Test request',
            'status' => 'pending',
            'created_at' => '2024-03-20 10:00:00'
        ];
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with([':request_id' => $requestId])
            ->andReturn(true);
        $stmt->shouldReceive('fetch')
            ->once()
            ->with(PDO::FETCH_ASSOC)
            ->andReturn($expectedData);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with(Mockery::type('string'))
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->moneyRequest->getRequestById($requestId);
        
        // Assert
        $this->assertEquals($expectedData, $result);
    }
    
    public function testGetByIdReturnsNullWhenNotFound()
    {
        // Mock data
        $requestId = 1;
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with([':request_id' => $requestId])
            ->andReturn(true);
        $stmt->shouldReceive('fetch')
            ->once()
            ->with(PDO::FETCH_ASSOC)
            ->andReturn(false);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with(Mockery::type('string'))
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->moneyRequest->getRequestById($requestId);
        
        // Assert
        $this->assertFalse($result);
    }
    
    public function testCreateRequestCreatesSuccessfully()
    {
        // Mock data
        $requestData = [
            'requester_user_id' => 1,
            'requested_user_id' => 2,
            'requester_name' => 'John Doe',
            'requested_name' => 'Jane Smith',
            'amount' => 100.00,
            'requester_ipa_address' => 'john@falsopay.com',
            'requested_ipa_address' => 'jane@falsopay.com',
            'message' => 'Test request'
        ];
        
        // Mock statement for insert
        $insertStmt = Mockery::mock(PDOStatement::class);
        $insertStmt->shouldReceive('execute')
            ->once()
            ->with([
                ':requester_user_id' => $requestData['requester_user_id'],
                ':requested_user_id' => $requestData['requested_user_id'],
                ':requester_name' => $requestData['requester_name'],
                ':requested_name' => $requestData['requested_name'],
                ':amount' => $requestData['amount'],
                ':requester_ipa_address' => $requestData['requester_ipa_address'],
                ':requested_ipa_address' => $requestData['requested_ipa_address'],
                ':message' => $requestData['message']
            ])
            ->andReturn(true);
        
        // Mock PDO prepare for insert
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with(Mockery::type('string'))
            ->andReturn($insertStmt);
        
        // Mock lastInsertId
        $this->pdo->shouldReceive('lastInsertId')
            ->once()
            ->andReturn(1);
        
        // Mock statement for getRequestById
        $selectStmt = Mockery::mock(PDOStatement::class);
        $selectStmt->shouldReceive('execute')
            ->once()
            ->with([':request_id' => 1])
            ->andReturn(true);
        $selectStmt->shouldReceive('fetch')
            ->once()
            ->with(PDO::FETCH_ASSOC)
            ->andReturn(array_merge($requestData, ['request_id' => 1, 'status' => 'pending']));
        
        // Mock PDO prepare for select
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with(Mockery::type('string'))
            ->andReturn($selectStmt);
        
        // Call the method
        $result = $this->moneyRequest->createRequest($requestData);
        
        // Assert
        $this->assertIsArray($result);
        $this->assertEquals(1, $result['request_id']);
        $this->assertEquals('pending', $result['status']);
    }
    
    public function testUpdateStatusUpdatesSuccessfully()
    {
        // Mock data
        $requestId = 1;
        $status = 'completed';
        $transactionId = 123;
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with([$status, $transactionId, $requestId])
            ->andReturn(true);
        $stmt->shouldReceive('rowCount')
            ->once()
            ->andReturn(1);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with(Mockery::type('string'))
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->moneyRequest->updateRequestStatus($requestId, $status, $transactionId);
        
        // Assert
        $this->assertTrue($result);
    }
} 