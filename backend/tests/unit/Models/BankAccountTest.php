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
    
    public function testGetAllByUserIdReturnsAccountsWhenFound()
    {
        // Mock data
        $userId = 1;
        $expectedAccounts = [
            [
                'bank_id' => 1,
                'account_number' => '1234567890',
                'bank_user_id' => $userId,
                'iban' => 'GB29NWBK60161331926819',
                'status' => 'active',
                'type' => 'savings',
                'balance' => 1000.00
            ],
            [
                'bank_id' => 2,
                'account_number' => '0987654321',
                'bank_user_id' => $userId,
                'iban' => 'GB29NWBK60161331926820',
                'status' => 'active',
                'type' => 'checking',
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
            ->with("SELECT * FROM bank_accounts WHERE bank_user_id = :user_id")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->bankAccount->getAllByUserId($userId);
        
        // Assert result
        $this->assertEquals($expectedAccounts, $result);
    }
    
    public function testGetAllByUserIdReturnsEmptyArrayWhenNoAccountsFound()
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
            ->with("SELECT * FROM bank_accounts WHERE bank_user_id = :user_id")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->bankAccount->getAllByUserId($userId);
        
        // Assert result
        $this->assertEmpty($result);
    }
    
    public function testGetByCompositeKeyReturnsAccountWhenFound()
    {
        // Mock data
        $bankId = 1;
        $accountNumber = '1234567890';
        $expectedAccount = [
            'bank_id' => $bankId,
            'account_number' => $accountNumber,
            'bank_user_id' => 1,
            'iban' => 'GB29NWBK60161331926819',
            'status' => 'active',
            'type' => 'savings',
            'balance' => 1000.00
        ];
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(['bank_id' => $bankId, 'account_number' => $accountNumber])
            ->andReturn(true);
        $stmt->shouldReceive('fetch')->once()->with(PDO::FETCH_ASSOC)->andReturn($expectedAccount);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM bank_accounts WHERE bank_id = :bank_id AND account_number = :account_number")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->bankAccount->getByCompositeKey($bankId, $accountNumber);
        
        // Assert result
        $this->assertEquals($expectedAccount, $result);
    }
    
    public function testGetByCompositeKeyReturnsNullWhenNotFound()
    {
        // Mock data
        $bankId = 1;
        $accountNumber = '9999999999'; // Non-existent account
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(['bank_id' => $bankId, 'account_number' => $accountNumber])
            ->andReturn(true);
        $stmt->shouldReceive('fetch')->once()->with(PDO::FETCH_ASSOC)->andReturn(false);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM bank_accounts WHERE bank_id = :bank_id AND account_number = :account_number")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->bankAccount->getByCompositeKey($bankId, $accountNumber);
        
        // Assert result
        $this->assertNull($result);
    }
    
    public function testAddBalanceUpdatesSuccessfully()
    {
        // Mock data
        $bankId = 1;
        $accountNumber = '1234567890';
        $amount = 500.00;
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(['bank_id' => $bankId, 'account_number' => $accountNumber, 'amount' => $amount])
            ->andReturn(true);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("UPDATE bank_accounts SET balance = balance + :amount WHERE bank_id = :bank_id AND account_number = :account_number")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->bankAccount->addBalance($bankId, $accountNumber, $amount);
        
        // Assert result
        $this->assertTrue($result);
    }
    
    public function testSubtractBalanceUpdatesSuccessfully()
    {
        // Mock data
        $bankId = 1;
        $accountNumber = '1234567890';
        $amount = 500.00;
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(['bank_id' => $bankId, 'account_number' => $accountNumber, 'amount' => $amount])
            ->andReturn(true);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("UPDATE bank_accounts SET balance = balance - :amount WHERE bank_id = :bank_id AND account_number = :account_number")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->bankAccount->subtractBalance($bankId, $accountNumber, $amount);
        
        // Assert result
        $this->assertTrue($result);
    }
} 