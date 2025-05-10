<?php

namespace Tests\unit\Controllers;

use App\controllers\UserController;
use App\models\User;
use App\models\BankAccount;
use App\models\Card;
use App\models\InstantPaymentAddress;
use App\models\MoneyRequest;
use App\models\SupportTicket;
use App\models\Transaction;
use Tests\unit\TestCase;
use Mockery;
use PDO;
use PDOStatement;

class UserControllerTest extends TestCase
{
    protected $pdo;
    protected $user;
    protected $bankAccount;
    protected $card;
    protected $instantPaymentAddress;
    protected $moneyRequest;
    protected $supportTicket;
    protected $transaction;
    protected $userController;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        // Create mock PDO
        $this->pdo = Mockery::mock(PDO::class);
        
        // Create mock models
        $this->user = Mockery::mock(User::class);
        $this->bankAccount = Mockery::mock(BankAccount::class);
        $this->card = Mockery::mock(Card::class);
        $this->instantPaymentAddress = Mockery::mock(InstantPaymentAddress::class);
        $this->moneyRequest = Mockery::mock(MoneyRequest::class);
        $this->supportTicket = Mockery::mock(SupportTicket::class);
        $this->transaction = Mockery::mock(Transaction::class);
        
        // Create UserController instance and inject dependencies
        $this->userController = new UserController(
            $this->user,
            $this->bankAccount,
            $this->card,
            $this->instantPaymentAddress,
            $this->moneyRequest,
            $this->supportTicket,
            $this->transaction
        );
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
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@example.com',
            'phone_number' => '1234567890'
        ];
        
        // Mock User model methods
        $this->user->shouldReceive('getUserById')
            ->once()
            ->with($userId)
            ->andReturn($expectedUser);
        
        // Call the method
        $result = $this->userController->getUserById($userId);
        
        // Assert result
        $this->assertTrue($result['success']);
        $this->assertEquals($expectedUser, $result['user']);
    }
    
    public function testGetUserByIdReturnsErrorWhenNotFound()
    {
        // Mock data
        $userId = 999; // Non-existent user
        
        // Mock User model methods
        $this->user->shouldReceive('getUserById')
            ->once()
            ->with($userId)
            ->andReturn(null);
        
        // Call the method
        $result = $this->userController->getUserById($userId);
        
        // Assert result
        $this->assertFalse($result['success']);
        $this->assertEquals('User not found', $result['message']);
    }
    
    public function testGetUserByEmailReturnsUserWhenFound()
    {
        // Mock data
        $email = 'john.doe@example.com';
        $expectedUser = [
            'user_id' => 1,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => $email,
            'phone_number' => '1234567890'
        ];
        
        // Mock User model methods
        $this->user->shouldReceive('getUserByEmail')
            ->once()
            ->with($email)
            ->andReturn($expectedUser);
        
        // Call the method
        $result = $this->userController->getUserByEmail($email);
        
        // Assert result
        $this->assertTrue($result['success']);
        $this->assertEquals($expectedUser, $result['user']);
    }
    
    public function testGetUserByEmailReturnsErrorWhenNotFound()
    {
        // Mock data
        $email = 'nonexistent@example.com';
        
        // Mock User model methods
        $this->user->shouldReceive('getUserByEmail')
            ->once()
            ->with($email)
            ->andReturn(null);
        
        // Call the method
        $result = $this->userController->getUserByEmail($email);
        
        // Assert result
        $this->assertFalse($result['success']);
        $this->assertEquals('User not found', $result['message']);
    }
    
    public function testGetUserByPhoneNumberReturnsUserWhenFound()
    {
        // Mock data
        $phoneNumber = '1234567890';
        $expectedUser = [
            'user_id' => 1,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@example.com',
            'phone_number' => $phoneNumber
        ];
        
        // Mock User model methods
        $this->user->shouldReceive('getUserByPhoneNumber')
            ->once()
            ->with($phoneNumber)
            ->andReturn($expectedUser);
        
        // Call the method
        $result = $this->userController->getUserByPhoneNumber($phoneNumber);
        
        // Assert result
        $this->assertTrue($result['success']);
        $this->assertEquals($expectedUser, $result['user']);
    }
    
    public function testGetUserByPhoneNumberReturnsErrorWhenNotFound()
    {
        // Mock data
        $phoneNumber = '9999999999';
        
        // Mock User model methods
        $this->user->shouldReceive('getUserByPhoneNumber')
            ->once()
            ->with($phoneNumber)
            ->andReturn(null);
        
        // Call the method
        $result = $this->userController->getUserByPhoneNumber($phoneNumber);
        
        // Assert result
        $this->assertFalse($result['success']);
        $this->assertEquals('User not found', $result['message']);
    }
    
    public function testUpdateUserUpdatesSuccessfully()
    {
        // Mock data
        $userId = 1;
        $userData = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'phone_number' => '+1234567890'
        ];
        
        // Mock User model methods
        $this->user->shouldReceive('getById')
            ->once()
            ->with($userId)
            ->andReturn(['user_id' => $userId]);
        
        $this->user->shouldReceive('update')
            ->once()
            ->with($userId, $userData)
            ->andReturn(true);
        
        // Call the method
        $result = $this->userController->updateUser($userId, $userData);
        
        // Assert result
        $this->assertTrue($result['success']);
        $this->assertEquals('User updated successfully', $result['message']);
    }
    
    public function testUpdateUserReturnsErrorWhenNotFound()
    {
        // Mock data
        $userId = 999;
        $userData = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'phone_number' => '+1234567890'
        ];
        
        // Mock User model methods
        $this->user->shouldReceive('getById')
            ->once()
            ->with($userId)
            ->andReturn(null);
        
        // Call the method
        $result = $this->userController->updateUser($userId, $userData);
        
        // Assert result
        $this->assertFalse($result['success']);
        $this->assertEquals('User not found', $result['message']);
    }
    
    public function testDeleteUserDeletesSuccessfully()
    {
        // Mock data
        $userId = 1;
        
        // Mock User model methods
        $this->user->shouldReceive('getById')
            ->once()
            ->with($userId)
            ->andReturn(['user_id' => $userId]);
        
        // Mock related model methods
        $this->bankAccount->shouldReceive('deleteByUserId')
            ->once()
            ->with($userId)
            ->andReturn(true);
        
        $this->card->shouldReceive('deleteByUserId')
            ->once()
            ->with($userId)
            ->andReturn(true);
        
        $this->instantPaymentAddress->shouldReceive('deleteByUserId')
            ->once()
            ->with($userId)
            ->andReturn(true);
        
        $this->moneyRequest->shouldReceive('deleteByUserId')
            ->once()
            ->with($userId)
            ->andReturn(true);
        
        $this->supportTicket->shouldReceive('deleteByUserId')
            ->once()
            ->with($userId)
            ->andReturn(true);
        
        $this->transaction->shouldReceive('deleteByUserId')
            ->once()
            ->with($userId)
            ->andReturn(true);
        
        $this->user->shouldReceive('delete')
            ->once()
            ->with($userId)
            ->andReturn(true);
        
        // Call the method
        $result = $this->userController->deleteUser($userId);
        
        // Assert result
        $this->assertTrue($result['success']);
        $this->assertEquals('User and all associated data deleted successfully', $result['message']);
    }
    
    public function testDeleteUserReturnsErrorWhenNotFound()
    {
        // Mock data
        $userId = 999;
        
        // Mock User model methods
        $this->user->shouldReceive('getById')
            ->once()
            ->with($userId)
            ->andReturn(null);
        
        // Call the method
        $result = $this->userController->deleteUser($userId);
        
        // Assert result
        $this->assertFalse($result['success']);
        $this->assertEquals('User not found', $result['message']);
    }
    
    public function testGetUserDashboardReturnsAllData()
    {
        // Mock data
        $userId = 1;
        $expectedData = [
            'user' => [
                'user_id' => $userId,
                'email' => 'test@example.com',
                'phone_number' => '+1234567890',
                'first_name' => 'John',
                'last_name' => 'Doe'
            ],
            'accounts' => [
                ['account_id' => 1, 'balance' => 1000.00],
                ['account_id' => 2, 'balance' => 500.00]
            ],
            'cards' => [
                ['card_id' => 1, 'card_number' => '****1234'],
                ['card_id' => 2, 'card_number' => '****5678']
            ],
            'payment_addresses' => [
                ['address_id' => 1, 'address' => 'john.doe@falsopay'],
                ['address_id' => 2, 'address' => 'johndoe@falsopay']
            ],
            'pending_requests' => [
                ['request_id' => 1, 'amount' => 50.00],
                ['request_id' => 2, 'amount' => 75.00]
            ],
            'open_tickets' => [
                ['ticket_id' => 1, 'subject' => 'Issue 1'],
                ['ticket_id' => 2, 'subject' => 'Issue 2']
            ],
            'recent_transactions' => [
                ['transaction_id' => 1, 'amount' => 100.00],
                ['transaction_id' => 2, 'amount' => 200.00]
            ]
        ];
        
        // Mock User model methods
        $this->user->shouldReceive('getById')
            ->once()
            ->with($userId)
            ->andReturn($expectedData['user']);
        
        // Mock related model methods
        $this->bankAccount->shouldReceive('getByUserId')
            ->once()
            ->with($userId)
            ->andReturn($expectedData['accounts']);
        
        $this->card->shouldReceive('getByUserId')
            ->once()
            ->with($userId)
            ->andReturn($expectedData['cards']);
        
        $this->instantPaymentAddress->shouldReceive('getByUserId')
            ->once()
            ->with($userId)
            ->andReturn($expectedData['payment_addresses']);
        
        $this->moneyRequest->shouldReceive('getPendingByUserId')
            ->once()
            ->with($userId)
            ->andReturn($expectedData['pending_requests']);
        
        $this->supportTicket->shouldReceive('getOpenByUserId')
            ->once()
            ->with($userId)
            ->andReturn($expectedData['open_tickets']);
        
        $this->transaction->shouldReceive('getRecentByUserId')
            ->once()
            ->with($userId)
            ->andReturn($expectedData['recent_transactions']);
        
        // Call the method
        $result = $this->userController->getUserDashboard($userId);
        
        // Assert result
        $this->assertTrue($result['success']);
        $this->assertEquals($expectedData, $result['dashboard']);
    }
    
    public function testGetUserDashboardReturnsErrorWhenUserNotFound()
    {
        // Mock data
        $userId = 999;
        
        // Mock User model methods
        $this->user->shouldReceive('getById')
            ->once()
            ->with($userId)
            ->andReturn(null);
        
        // Call the method
        $result = $this->userController->getUserDashboard($userId);
        
        // Assert result
        $this->assertFalse($result['success']);
        $this->assertEquals('User not found', $result['message']);
    }
} 