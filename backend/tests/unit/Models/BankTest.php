<?php

namespace Tests\unit\Models;

use App\models\Bank;
use Tests\unit\TestCase;
use Mockery;
use PDO;
use PDOStatement;

class BankTest extends TestCase
{
    protected $pdo;
    protected $bank;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        // Create mock PDO
        $this->pdo = Mockery::mock(PDO::class);
        
        // Create Bank instance and set PDO using reflection
        $this->bank = new Bank();
        $reflection = new \ReflectionClass($this->bank);
        $property = $reflection->getProperty('pdo');
        $property->setValue($this->bank, $this->pdo);
    }
    
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
    
    public function testGetAllReturnsAllBanks()
    {
        // Expected data
        $expectedBanks = [
            [
                'bank_id' => 1,
                'bank_name' => 'Bank A',
                'bank_code' => 'BA',
                'swift_code' => 'BA001'
            ],
            [
                'bank_id' => 2,
                'bank_name' => 'Bank B',
                'bank_code' => 'BB',
                'swift_code' => 'BB001'
            ]
        ];
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('fetchAll')->once()->with(PDO::FETCH_ASSOC)->andReturn($expectedBanks);
        
        // Mock PDO query
        $this->pdo->shouldReceive('query')
            ->once()
            ->with("SELECT * FROM banks")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->bank->getAll();
        
        // Assert result
        $this->assertEquals($expectedBanks, $result);
        $this->assertCount(2, $result);
    }
    
    public function testGetBankByIdReturnsBankWhenFound()
    {
        // Mock data
        $bankId = 1;
        $expectedBank = [
            'bank_id' => $bankId,
            'bank_name' => 'Bank A',
            'bank_code' => 'BA',
            'swift_code' => 'BA001'
        ];
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(['bank_id' => $bankId])
            ->andReturn(true);
        $stmt->shouldReceive('fetch')->once()->with(PDO::FETCH_ASSOC)->andReturn($expectedBank);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM banks WHERE bank_id = :bank_id")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->bank->getBankById($bankId);
        
        // Assert result
        $this->assertEquals($expectedBank, $result);
    }
    
    public function testGetBankByIdReturnsNullWhenNotFound()
    {
        // Mock data
        $bankId = 999; // Non-existent bank
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(['bank_id' => $bankId])
            ->andReturn(true);
        $stmt->shouldReceive('fetch')->once()->with(PDO::FETCH_ASSOC)->andReturn(false);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM banks WHERE bank_id = :bank_id")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->bank->getBankById($bankId);
        
        // Assert result
        $this->assertNull($result);
    }
    
    public function testCreateBankCreatesSuccessfully()
    {
        // Mock data
        $bankName = 'Bank A';
        $bankCode = 'BA';
        $swiftCode = 'BA001';
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with([
                'bank_name' => $bankName,
                'bank_code' => $bankCode,
                'swift_code' => $swiftCode
            ])
            ->andReturn(true);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("INSERT INTO banks (bank_name, bank_code, swift_code) VALUES (:bank_name, :bank_code, :swift_code)")
            ->andReturn($stmt);
        
        // Call the method
        $this->bank->create($bankName, $bankCode, $swiftCode);
    }
    
    public function testUpdateBankUpdatesSuccessfully()
    {
        // Mock data
        $bankId = 1;
        $bankName = 'Updated Bank A';
        $bankCode = 'UBA';
        $swiftCode = 'UBA001';
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with([
                'bank_name' => $bankName,
                'bank_code' => $bankCode,
                'swift_code' => $swiftCode,
                'bank_id' => $bankId
            ])
            ->andReturn(true);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("UPDATE banks SET bank_name = :bank_name, bank_code = :bank_code, swift_code = :swift_code WHERE bank_id = :bank_id")
            ->andReturn($stmt);
        
        // Call the method
        $this->bank->update($bankId, $bankName, $bankCode, $swiftCode);
    }
} 