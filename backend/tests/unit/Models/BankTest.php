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
        $property->setAccessible(true);
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
                'name' => 'Bank A',
                'code' => 'BA'
            ],
            [
                'bank_id' => 2,
                'name' => 'Bank B',
                'code' => 'BB'
            ]
        ];
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('fetchAll')->once()->with(PDO::FETCH_ASSOC)->andReturn($expectedBanks);
        
        // Mock PDO query
        $this->pdo->shouldReceive('query')
            ->once()
            ->with("SELECT * FROM banks ORDER BY name")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->bank->getAll();
        
        // Assert result
        $this->assertEquals($expectedBanks, $result);
        $this->assertCount(2, $result);
    }
    
    public function testGetByIdReturnsBankWhenFound()
    {
        // Mock data
        $bankId = 1;
        $expectedBank = [
            'bank_id' => $bankId,
            'name' => 'Bank A',
            'code' => 'BA'
        ];
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')->once()->with(['bank_id' => $bankId])->andReturn(true);
        $stmt->shouldReceive('fetch')->once()->with(PDO::FETCH_ASSOC)->andReturn($expectedBank);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM banks WHERE bank_id = :bank_id")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->bank->getById($bankId);
        
        // Assert result
        $this->assertEquals($expectedBank, $result);
    }
    
    public function testGetByIdReturnsNullWhenNotFound()
    {
        // Mock data
        $bankId = 999; // Non-existent bank
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')->once()->with(['bank_id' => $bankId])->andReturn(true);
        $stmt->shouldReceive('fetch')->once()->with(PDO::FETCH_ASSOC)->andReturn(false);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM banks WHERE bank_id = :bank_id")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->bank->getById($bankId);
        
        // Assert result
        $this->assertNull($result);
    }
} 