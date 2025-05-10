<?php

namespace Tests\unit\Models;

use App\models\BankAccount;
use Tests\unit\TestCase;
use Mockery;
use PDO;
use PDOStatement;

class BankAccountTest extends TestCase
{
    protected $pdo;
    protected $bankAccount;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        // Create mock PDO
        $this->pdo = Mockery::mock(PDO::class);
        
        // Create BankAccount instance and set PDO using reflection
        $this->bankAccount = new BankAccount();
        $reflection = new \ReflectionClass($this->bankAccount);
        $property = $reflection->getProperty('pdo');
        $property->setAccessible(true);
        $property->setValue($this->bankAccount, $this->pdo);
    }
    
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
    
    public function testGetByUserIdReturnsAccountsWhenFound()
    {
        // Mock data
        $userId = 1;
        $expectedAccounts = [
            [
                'account_id' => 1,
                'user_id' => $userId,
                'bank_id' => 1,
                'account_number' => '1234567890',
                'balance' => 1000.00
            ],
            [
                'account_id' => 2,
                'user_id' => $userId,
                'bank_id' => 2,
                'account_number' => '0987654321',
                'balance' => 500.00
            ]
        ];
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(['user_id' => $userId])
            ->andReturn(true);
        $stmt->shouldReceive('fetchAll')->once()->with(PDO::FETCH_ASSOC)->andReturn($expectedAccounts);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM bank_accounts WHERE user_id = :user_id")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->bankAccount->getByUserId($userId);
        
        // Assert result
        $this->assertEquals($expectedAccounts, $result);
    }
    
    public function testGetByUserIdReturnsEmptyArrayWhenNoAccountsFound()
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
            ->with("SELECT * FROM bank_accounts WHERE user_id = :user_id")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->bankAccount->getByUserId($userId);
        
        // Assert result
        $this->assertEmpty($result);
    }
    
    public function testGetByIdReturnsAccountWhenFound()
    {
        // Mock data
        $accountId = 1;
        $expectedAccount = [
            'account_id' => $accountId,
            'user_id' => 1,
            'bank_id' => 1,
            'account_number' => '1234567890',
            'balance' => 1000.00
        ];
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(['account_id' => $accountId])
            ->andReturn(true);
        $stmt->shouldReceive('fetch')->once()->with(PDO::FETCH_ASSOC)->andReturn($expectedAccount);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM bank_accounts WHERE account_id = :account_id")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->bankAccount->getById($accountId);
        
        // Assert result
        $this->assertEquals($expectedAccount, $result);
    }
    
    public function testGetByIdReturnsNullWhenNotFound()
    {
        // Mock data
        $accountId = 999; // Non-existent account
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(['account_id' => $accountId])
            ->andReturn(true);
        $stmt->shouldReceive('fetch')->once()->with(PDO::FETCH_ASSOC)->andReturn(false);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM bank_accounts WHERE account_id = :account_id")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->bankAccount->getById($accountId);
        
        // Assert result
        $this->assertNull($result);
    }
    
    public function testUpdateBalanceUpdatesSuccessfully()
    {
        // Mock data
        $accountId = 1;
        $newBalance = 1500.00;
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(['account_id' => $accountId, 'balance' => $newBalance])
            ->andReturn(true);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("UPDATE bank_accounts SET balance = :balance WHERE account_id = :account_id")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->bankAccount->updateBalance($accountId, $newBalance);
        
        // Assert result
        $this->assertTrue($result);
    }
} 