<?php

namespace Tests\Unit\Models;

use App\models\Transaction;
use Tests\Unit\TestCase;
use Mockery;
use PDO;
use PDOStatement;

class TransactionTest extends TestCase
{
    protected $pdo;
    protected $transaction;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        // Create mock PDO
        $this->pdo = Mockery::mock(PDO::class);
        $this->transaction = $this->createPartialMock(Transaction::class, ['__construct']);
        
        // Set the mocked PDO using reflection
        $reflection = new \ReflectionClass($this->transaction);
        $property = $reflection->getProperty('pdo');
        $property->setAccessible(true);
        $property->setValue($this->transaction, $this->pdo);
    }
    
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
    
    public function testCreateTransaction()
    {
        // Test data
        $transactionData = [
            'sender_user_id' => 1,
            'receiver_user_id' => 2,
            'sender_name' => 'John Doe',
            'receiver_name' => 'Jane Smith',
            'amount' => 100.00,
            'transfer_method' => 'IPA'
        ];
        
        $expectedId = 123;
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')->once()->andReturn(true);
        
        // Mock PDO prepare and lastInsertId
        $this->pdo->shouldReceive('prepare')->once()->andReturn($stmt);
        $this->pdo->shouldReceive('lastInsertId')->once()->andReturn($expectedId);
        
        // Call the method
        $result = $this->transaction->createTransaction($transactionData);
        
        // Assert result
        $this->assertEquals($expectedId, $result);
    }
    
    public function testGetAllReturnsAllTransactions()
    {
        // Expected data
        $expectedTransactions = [
            [
                'transaction_id' => 1,
                'sender_user_id' => 1,
                'receiver_user_id' => 2,
                'amount' => 100.00,
                'transaction_time' => '2023-04-01 12:00:00'
            ],
            [
                'transaction_id' => 2,
                'sender_user_id' => 2,
                'receiver_user_id' => 3,
                'amount' => 50.00,
                'transaction_time' => '2023-04-01 13:00:00'
            ]
        ];
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('fetchAll')->once()->with(PDO::FETCH_ASSOC)->andReturn($expectedTransactions);
        
        // Mock PDO query
        $this->pdo->shouldReceive('query')
            ->once()
            ->with("SELECT * FROM transactions ORDER BY transaction_time DESC")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->transaction->getAll();
        
        // Assert result
        $this->assertEquals($expectedTransactions, $result);
        $this->assertCount(2, $result);
    }
    
    public function testGetAllByUserIdReturnsUserTransactions()
    {
        // Test data
        $userId = 1;
        $expectedTransactions = [
            [
                'transaction_id' => 1,
                'sender_user_id' => 1,
                'receiver_user_id' => 2,
                'amount' => 100.00,
                'transaction_time' => '2023-04-01 12:00:00'
            ],
            [
                'transaction_id' => 3,
                'sender_user_id' => 3,
                'receiver_user_id' => 1,
                'amount' => 75.00,
                'transaction_time' => '2023-04-02 10:00:00'
            ]
        ];
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')->once()->with(['user_id' => $userId])->andReturn(true);
        $stmt->shouldReceive('fetchAll')->once()->with(PDO::FETCH_ASSOC)->andReturn($expectedTransactions);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM transactions 
                WHERE sender_user_id = :user_id OR receiver_user_id = :user_id 
                ORDER BY transaction_time DESC")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->transaction->getAllByUserId($userId);
        
        // Assert result
        $this->assertEquals($expectedTransactions, $result);
        $this->assertCount(2, $result);
    }
} 