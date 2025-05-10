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
    
    public function testGetAllByUserIdReturnsAddressesWhenFound()
    {
        // Mock data
        $userId = 1;
        $expectedAddresses = [
            [
                'ipa_id' => 1,
                'bank_id' => 1,
                'account_number' => '1234567890',
                'ipa_address' => 'user1@falsopay.com',
                'user_id' => $userId,
                'pin' => 'hashed_pin',
                'created_at' => '2024-01-01 00:00:00'
            ],
            [
                'ipa_id' => 2,
                'bank_id' => 1,
                'account_number' => '0987654321',
                'ipa_address' => 'user1.business@falsopay.com',
                'user_id' => $userId,
                'pin' => 'hashed_pin',
                'created_at' => '2024-01-01 00:00:00'
            ]
        ];
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(['user_id' => $userId])
            ->andReturn(true);
        $stmt->shouldReceive('fetchAll')
            ->once()
            ->with(PDO::FETCH_ASSOC)
            ->andReturn($expectedAddresses);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM instant_payment_addresses WHERE user_id = :user_id")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->ipa->getAllByUserId($userId);
        
        // Assert result
        $this->assertEquals($expectedAddresses, $result);
    }
    
    public function testGetAllByUserIdReturnsEmptyArrayWhenNoAddressesFound()
    {
        // Mock data
        $userId = 999; // Non-existent user
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(['user_id' => $userId])
            ->andReturn(true);
        $stmt->shouldReceive('fetchAll')
            ->once()
            ->with(PDO::FETCH_ASSOC)
            ->andReturn([]);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM instant_payment_addresses WHERE user_id = :user_id")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->ipa->getAllByUserId($userId);
        
        // Assert result
        $this->assertEmpty($result);
    }
    
    public function testGetHashedPinReturnsPinWhenFound()
    {
        // Mock data
        $ipaAddress = 'user1@falsopay.com';
        $hashedPin = password_hash('1234', PASSWORD_BCRYPT);
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(['ipa_address' => $ipaAddress])
            ->andReturn(true);
        $stmt->shouldReceive('fetch')
            ->once()
            ->with(PDO::FETCH_ASSOC)
            ->andReturn(['pin' => $hashedPin]);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT pin FROM instant_payment_addresses WHERE ipa_address = :ipa_address")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->ipa->getHashedPin($ipaAddress);
        
        // Assert result
        $this->assertEquals($hashedPin, $result);
    }
    
    public function testGetHashedPinReturnsNullWhenNotFound()
    {
        // Mock data
        $ipaAddress = 'nonexistent@falsopay.com';
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(['ipa_address' => $ipaAddress])
            ->andReturn(true);
        $stmt->shouldReceive('fetch')
            ->once()
            ->with(PDO::FETCH_ASSOC)
            ->andReturn(false);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT pin FROM instant_payment_addresses WHERE ipa_address = :ipa_address")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->ipa->getHashedPin($ipaAddress);
        
        // Assert result
        $this->assertNull($result);
    }
    
    public function testCreateCreatesSuccessfully()
    {
        // Mock data
        $bankId = 1;
        $accountNumber = '1234567890';
        $ipaAddress = 'new.user@falsopay.com';
        $userId = 1;
        $pin = '1234';
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(Mockery::on(function($params) use ($bankId, $accountNumber, $ipaAddress, $userId, $pin) {
                // Verify all parameters except pin
                if ($params['bank_id'] !== $bankId ||
                    $params['account_number'] !== $accountNumber ||
                    $params['ipa_address'] !== $ipaAddress ||
                    $params['user_id'] !== $userId) {
                    return false;
                }
                
                // Verify that pin is a valid bcrypt hash
                return password_verify($pin, $params['pin']);
            }))
            ->andReturn(true);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with(Mockery::type('string'))
            ->andReturn($stmt);
        
        // Call the method
        $this->ipa->create($bankId, $accountNumber, $ipaAddress, $userId, $pin);
        
        // No assertion needed as method is void
    }
    
    public function testDeleteDeletesSuccessfully()
    {
        // Mock data
        $bankId = 1;
        $accountNumber = '1234567890';
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with([
                'bank_id' => $bankId,
                'account_number' => $accountNumber
            ])
            ->andReturn(true);
        $stmt->shouldReceive('rowCount')
            ->once()
            ->andReturn(1);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("DELETE FROM instant_payment_addresses WHERE bank_id = :bank_id AND account_number = :account_number")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->ipa->delete($bankId, $accountNumber);
        
        // Assert result
        $this->assertTrue($result);
    }
} 