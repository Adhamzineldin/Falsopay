<?php

namespace Tests\unit\Models;

use App\models\Card;
use Tests\unit\TestCase;
use Mockery;
use PDO;
use PDOStatement;

class CardTest extends TestCase
{
    protected $pdo;
    protected $card;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        // Create mock PDO
        $this->pdo = Mockery::mock(PDO::class);
        
        // Create Card instance and set PDO using reflection
        $this->card = new Card();
        $reflection = new \ReflectionClass($this->card);
        $property = $reflection->getProperty('pdo');
        $property->setAccessible(true);
        $property->setValue($this->card, $this->pdo);
    }
    
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
    
    public function testGetByBankAndCardNumberReturnsCardWhenFound()
    {
        // Mock data
        $bankId = 1;
        $cardNumber = '1234567890123456';
        $expectedCard = [
            'card_id' => 1,
            'bank_id' => $bankId,
            'card_number' => $cardNumber,
            'bank_user_id' => 1,
            'pin_hash' => 'hashed_pin'
        ];
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(['bank_id' => $bankId, 'card_number' => $cardNumber])
            ->andReturn(true);
        $stmt->shouldReceive('fetch')->once()->with(PDO::FETCH_ASSOC)->andReturn($expectedCard);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM cards WHERE bank_id = :bank_id AND card_number = :card_number")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->card->getByBankAndCardNumber($bankId, $cardNumber);
        
        // Assert result
        $this->assertEquals($expectedCard, $result);
    }
    
    public function testGetByBankAndCardNumberReturnsNullWhenNotFound()
    {
        // Mock data
        $bankId = 1;
        $cardNumber = '9999999999999999'; // Non-existent card
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(['bank_id' => $bankId, 'card_number' => $cardNumber])
            ->andReturn(true);
        $stmt->shouldReceive('fetch')->once()->with(PDO::FETCH_ASSOC)->andReturn(false);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM cards WHERE bank_id = :bank_id AND card_number = :card_number")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->card->getByBankAndCardNumber($bankId, $cardNumber);
        
        // Assert result
        $this->assertNull($result);
    }
    
    public function testVerifyPinReturnsTrueWhenPinIsCorrect()
    {
        // Mock data
        $bankId = 1;
        $cardNumber = '1234567890123456';
        $pin = '1234';
        $hashedPin = password_hash($pin, PASSWORD_DEFAULT);
        
        $card = [
            'card_id' => 1,
            'bank_id' => $bankId,
            'card_number' => $cardNumber,
            'bank_user_id' => 1,
            'pin_hash' => $hashedPin
        ];
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(['bank_id' => $bankId, 'card_number' => $cardNumber])
            ->andReturn(true);
        $stmt->shouldReceive('fetch')->once()->with(PDO::FETCH_ASSOC)->andReturn($card);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM cards WHERE bank_id = :bank_id AND card_number = :card_number")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->card->verifyPin($bankId, $cardNumber, $pin);
        
        // Assert result
        $this->assertTrue($result);
    }
    
    public function testVerifyPinReturnsFalseWhenPinIsIncorrect()
    {
        // Mock data
        $bankId = 1;
        $cardNumber = '1234567890123456';
        $correctPin = '1234';
        $incorrectPin = '9999';
        $hashedPin = password_hash($correctPin, PASSWORD_DEFAULT);
        
        $card = [
            'card_id' => 1,
            'bank_id' => $bankId,
            'card_number' => $cardNumber,
            'bank_user_id' => 1,
            'pin_hash' => $hashedPin
        ];
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(['bank_id' => $bankId, 'card_number' => $cardNumber])
            ->andReturn(true);
        $stmt->shouldReceive('fetch')->once()->with(PDO::FETCH_ASSOC)->andReturn($card);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM cards WHERE bank_id = :bank_id AND card_number = :card_number")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->card->verifyPin($bankId, $cardNumber, $incorrectPin);
        
        // Assert result
        $this->assertFalse($result);
    }
} 