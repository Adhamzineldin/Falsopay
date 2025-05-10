<?php

namespace Tests\unit\Controllers;

use App\controllers\MoneyRequestController;
use App\models\MoneyRequest;
use App\models\User;
use Tests\unit\TestCase;
use Mockery;
use PDO;
use PDOStatement;

class MoneyRequestControllerTest extends TestCase
{
    protected $pdo;
    protected $moneyRequest;
    protected $user;
    protected $moneyRequestController;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        // Create mock PDO
        $this->pdo = Mockery::mock(PDO::class);
        
        // Create mock models
        $this->moneyRequest = Mockery::mock(MoneyRequest::class);
        $this->user = Mockery::mock(User::class);
        
        // Create MoneyRequestController instance and inject dependencies
        $this->moneyRequestController = new MoneyRequestController($this->moneyRequest, $this->user);
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
                'sender_id' => 2,
                'receiver_id' => $userId,
                'amount' => 50.00,
                'status' => 'completed',
                'created_at' => '2024-03-20 11:00:00'
            ]
        ];
        
        // Mock MoneyRequest model methods
        $this->moneyRequest->shouldReceive('getByUserId')
            ->once()
            ->with($userId)
            ->andReturn($expectedRequests);
        
        // Call the method
        $result = $this->moneyRequestController->getByUserId($userId);
        
        // Assert result
        $this->assertTrue($result['success']);
        $this->assertEquals($expectedRequests, $result['requests']);
    }
    
    public function testGetByUserIdReturnsEmptyArrayWhenNoRequestsFound()
    {
        // Mock data
        $userId = 999; // User with no requests
        
        // Mock MoneyRequest model methods
        $this->moneyRequest->shouldReceive('getByUserId')
            ->once()
            ->with($userId)
            ->andReturn([]);
        
        // Call the method
        $result = $this->moneyRequestController->getByUserId($userId);
        
        // Assert result
        $this->assertTrue($result['success']);
        $this->assertEmpty($result['requests']);
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
        
        // Mock MoneyRequest model methods
        $this->moneyRequest->shouldReceive('getById')
            ->once()
            ->with($requestId)
            ->andReturn($expectedRequest);
        
        // Call the method
        $result = $this->moneyRequestController->getRequestById($requestId);
        
        // Assert result
        $this->assertTrue($result['success']);
        $this->assertEquals($expectedRequest, $result['request']);
    }
    
    public function testGetByIdReturnsErrorWhenNotFound()
    {
        // Mock data
        $requestId = 999; // Non-existent request
        
        // Mock MoneyRequest model methods
        $this->moneyRequest->shouldReceive('getById')
            ->once()
            ->with($requestId)
            ->andReturn(null);
        
        // Call the method
        $result = $this->moneyRequestController->getRequestById($requestId);
        
        // Assert result
        $this->assertFalse($result['success']);
        $this->assertEquals('Request not found', $result['message']);
    }
    
    public function testGetAllRequestsReturnsRequestsWhenFound()
    {
        // Mock data
        $userId = 1;
        $expectedRequests = [
            [
                'id' => 1,
                'requester_user_id' => 2,
                'requested_user_id' => $userId,
                'amount' => 100.00,
                'status' => 'pending',
                'message' => 'Test request'
            ],
            [
                'id' => 2,
                'requester_user_id' => $userId,
                'requested_user_id' => 3,
                'amount' => 200.00,
                'status' => 'completed',
                'message' => 'Another test request'
            ]
        ];
        
        // Mock MoneyRequest model methods
        $this->moneyRequest->shouldReceive('getAllRequestsForUser')
            ->once()
            ->with($userId)
            ->andReturn($expectedRequests);
        
        // Call the method
        $result = $this->moneyRequestController->getAllRequests(['user_id' => $userId]);
        
        // Assert the result
        $this->assertEquals('success', $result['status']);
        $this->assertEquals($expectedRequests, $result['data']);
        $this->assertEquals(200, $result['code']);
    }
    
    public function testGetAllRequestsReturnsEmptyArrayWhenNoRequestsFound()
    {
        // Mock data
        $userId = 1;
        $expectedRequests = [];
        
        // Mock MoneyRequest model methods
        $this->moneyRequest->shouldReceive('getAllRequestsForUser')
            ->once()
            ->with($userId)
            ->andReturn($expectedRequests);
        
        // Call the method
        $result = $this->moneyRequestController->getAllRequests(['user_id' => $userId]);
        
        // Assert the result
        $this->assertEquals('success', $result['status']);
        $this->assertEquals($expectedRequests, $result['data']);
        $this->assertEquals(200, $result['code']);
    }
    
    public function testGetRequestByIdReturnsRequestWhenFound()
    {
        // Mock data
        $requestId = 1;
        $expectedRequest = [
            'id' => $requestId,
            'requester_user_id' => 2,
            'requested_user_id' => 1,
            'amount' => 100.00,
            'status' => 'pending',
            'message' => 'Test request'
        ];
        
        // Mock MoneyRequest model methods
        $this->moneyRequest->shouldReceive('getRequestById')
            ->once()
            ->with($requestId)
            ->andReturn($expectedRequest);
        
        // Call the method
        $result = $this->moneyRequestController->getRequestById(['id' => $requestId]);
        
        // Assert the result
        $this->assertEquals('success', $result['status']);
        $this->assertEquals($expectedRequest, $result['data']);
        $this->assertEquals(200, $result['code']);
    }
    
    public function testGetRequestByIdReturnsErrorWhenNotFound()
    {
        // Mock data
        $requestId = 999; // Non-existent request
        
        // Mock MoneyRequest model methods
        $this->moneyRequest->shouldReceive('getRequestById')
            ->once()
            ->with($requestId)
            ->andReturn(null);
        
        // Call the method
        $result = $this->moneyRequestController->getRequestById(['id' => $requestId]);
        
        // Assert the result
        $this->assertEquals('error', $result['status']);
        $this->assertEquals('Money request not found', $result['message']);
        $this->assertEquals(404, $result['code']);
    }
    
    public function testCreateRequestCreatesSuccessfully()
    {
        // Mock data
        $requestData = [
            'amount' => 100.00,
            'requested_ipa_address' => 'test@example.com',
            'message' => 'Test request'
        ];
        
        $userId = 1;
        $_SERVER['AUTHENTICATED_USER_ID'] = $userId;
        
        // Mock User model methods
        $this->user->shouldReceive('getUserById')
            ->with($userId)
            ->andReturn([
                'user_id' => $userId,
                'first_name' => 'John',
                'last_name' => 'Doe'
            ]);
        
        // Mock IPA model methods
        $this->ipa = Mockery::mock('App\models\InstantPaymentAddress');
        $this->ipa->shouldReceive('getDefaultIPAByUserId')
            ->with($userId)
            ->andReturn([
                'user_id' => $userId,
                'ipa_address' => 'john@example.com'
            ]);
        
        $this->ipa->shouldReceive('getIPAByAddress')
            ->with('test@example.com')
            ->andReturn([
                'user_id' => 2,
                'ipa_address' => 'test@example.com'
            ]);
        
        // Mock MoneyRequest model methods
        $this->moneyRequest->shouldReceive('createRequest')
            ->once()
            ->andReturn([
                'id' => 1,
                'requester_user_id' => $userId,
                'requested_user_id' => 2,
                'amount' => 100.00,
                'status' => 'pending',
                'message' => 'Test request'
            ]);
        
        // Call the method
        $result = $this->moneyRequestController->createRequest($requestData);
        
        // Assert the result
        $this->assertEquals('success', $result['status']);
        $this->assertEquals('Money request sent successfully', $result['message']);
        $this->assertEquals(201, $result['code']);
    }
    
    public function testCreateRequestReturnsErrorWhenReceiverNotFound()
    {
        // Mock data
        $requestData = [
            'amount' => 100.00,
            'requested_ipa_address' => 'nonexistent@example.com',
            'message' => 'Test request'
        ];
        
        $userId = 1;
        $_SERVER['AUTHENTICATED_USER_ID'] = $userId;
        
        // Mock User model methods
        $this->user->shouldReceive('getUserById')
            ->with($userId)
            ->andReturn([
                'user_id' => $userId,
                'first_name' => 'John',
                'last_name' => 'Doe'
            ]);
        
        // Mock IPA model methods
        $this->ipa = Mockery::mock('App\models\InstantPaymentAddress');
        $this->ipa->shouldReceive('getDefaultIPAByUserId')
            ->with($userId)
            ->andReturn([
                'user_id' => $userId,
                'ipa_address' => 'john@example.com'
            ]);
        
        $this->ipa->shouldReceive('getIPAByAddress')
            ->with('nonexistent@example.com')
            ->andReturn(null);
        
        // Call the method
        $result = $this->moneyRequestController->createRequest($requestData);
        
        // Assert the result
        $this->assertEquals('error', $result['status']);
        $this->assertEquals('Recipient IPA address not found', $result['message']);
        $this->assertEquals(404, $result['code']);
    }
    
    public function testGetPendingRequestsReturnsRequestsWhenFound()
    {
        // Mock data
        $userId = 1;
        $expectedRequests = [
            [
                'id' => 1,
                'requester_user_id' => 2,
                'requested_user_id' => $userId,
                'amount' => 100.00,
                'status' => 'pending',
                'message' => 'Test request'
            ]
        ];
        
        // Mock MoneyRequest model methods
        $this->moneyRequest->shouldReceive('getPendingRequestsForUser')
            ->once()
            ->with($userId)
            ->andReturn($expectedRequests);
        
        // Call the method
        $result = $this->moneyRequestController->getPendingRequests(['user_id' => $userId]);
        
        // Assert the result
        $this->assertEquals('success', $result['status']);
        $this->assertEquals($expectedRequests, $result['data']);
        $this->assertEquals(200, $result['code']);
    }
    
    public function testGetPendingRequestsReturnsEmptyArrayWhenNoRequestsFound()
    {
        // Mock data
        $userId = 1;
        $expectedRequests = [];
        
        // Mock MoneyRequest model methods
        $this->moneyRequest->shouldReceive('getPendingRequestsForUser')
            ->once()
            ->with($userId)
            ->andReturn($expectedRequests);
        
        // Call the method
        $result = $this->moneyRequestController->getPendingRequests(['user_id' => $userId]);
        
        // Assert the result
        $this->assertEquals('success', $result['status']);
        $this->assertEquals($expectedRequests, $result['data']);
        $this->assertEquals(200, $result['code']);
    }
} 