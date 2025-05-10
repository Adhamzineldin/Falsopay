<?php

namespace Tests\unit\Models;

use App\models\InstantPaymentAddress;
use Tests\unit\TestCase;
use Mockery;
use PDO;
use PDOStatement;

class InstantPaymentAddressTest extends TestCase
{
    protected $pdo;
    protected $ipa;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        // Create mock PDO
        $this->pdo = Mockery::mock(PDO::class);
        
        // Create InstantPaymentAddress instance and set PDO using reflection
        $this->ipa = new InstantPaymentAddress();
        $reflection = new \ReflectionClass($this->ipa);
        $property = $reflection->getProperty('pdo');
        $property->setAccessible(true);
        $property->setValue($this->ipa, $this->pdo);
    }
    
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
    
    public function testGetByUserIdReturnsAddressesWhenFound()
    {
        // Mock data
        $userId = 1;
        $expectedAddresses = [
            [
                'ipa_id' => 1,
                'user_id' => $userId,
                'address' => 'user1@falsopay.com',
                'is_active' => true
            ],
            [
                'ipa_id' => 2,
                'user_id' => $userId,
                'address' => 'user1.business@falsopay.com',
                'is_active' => true
            ]
        ];
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(['user_id' => $userId])
            ->andReturn(true);
        $stmt->shouldReceive('fetchAll')->once()->with(PDO::FETCH_ASSOC)->andReturn($expectedAddresses);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM instant_payment_addresses WHERE user_id = :user_id")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->ipa->getByUserId($userId);
        
        // Assert result
        $this->assertEquals($expectedAddresses, $result);
    }
    
    public function testGetByUserIdReturnsEmptyArrayWhenNoAddressesFound()
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
            ->with("SELECT * FROM instant_payment_addresses WHERE user_id = :user_id")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->ipa->getByUserId($userId);
        
        // Assert result
        $this->assertEmpty($result);
    }
    
    public function testGetByAddressReturnsAddressWhenFound()
    {
        // Mock data
        $address = 'user1@falsopay.com';
        $expectedAddress = [
            'ipa_id' => 1,
            'user_id' => 1,
            'address' => $address,
            'is_active' => true
        ];
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(['address' => $address])
            ->andReturn(true);
        $stmt->shouldReceive('fetch')->once()->with(PDO::FETCH_ASSOC)->andReturn($expectedAddress);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM instant_payment_addresses WHERE address = :address")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->ipa->getByAddress($address);
        
        // Assert result
        $this->assertEquals($expectedAddress, $result);
    }
    
    public function testGetByAddressReturnsNullWhenNotFound()
    {
        // Mock data
        $address = 'nonexistent@falsopay.com';
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(['address' => $address])
            ->andReturn(true);
        $stmt->shouldReceive('fetch')->once()->with(PDO::FETCH_ASSOC)->andReturn(false);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM instant_payment_addresses WHERE address = :address")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->ipa->getByAddress($address);
        
        // Assert result
        $this->assertNull($result);
    }
    
    public function testCreateAddressCreatesSuccessfully()
    {
        // Mock data
        $userId = 1;
        $address = 'new.user@falsopay.com';
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with([
                'user_id' => $userId,
                'address' => $address,
                'is_active' => true
            ])
            ->andReturn(true);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("INSERT INTO instant_payment_addresses (user_id, address, is_active) VALUES (:user_id, :address, :is_active)")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->ipa->createAddress($userId, $address);
        
        // Assert result
        $this->assertTrue($result);
    }
    
    public function testDeactivateAddressDeactivatesSuccessfully()
    {
        // Mock data
        $addressId = 1;
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(['ipa_id' => $addressId])
            ->andReturn(true);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("UPDATE instant_payment_addresses SET is_active = false WHERE ipa_id = :ipa_id")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->ipa->deactivateAddress($addressId);
        
        // Assert result
        $this->assertTrue($result);
    }
} 