<?php

namespace Tests\unit\Controllers;

use App\controllers\CardController;
use App\models\Card;
use App\models\Bank;
use Tests\unit\TestCase;
use Mockery;
use PDO;
use PDOStatement;

class CardControllerTest extends TestCase
{
    protected $pdo;
    protected $card;
    protected $bank;
    protected $cardController;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        // Create mock PDO
        $this->pdo = Mockery::mock(PDO::class);
        
        // Create mock models
        $this->card = Mockery::mock(Card::class);
        $this->bank = Mockery::mock(Bank::class);
        
        // Create CardController instance and inject dependencies
        $this->cardController = new CardController($this->card, $this->bank);
    }
    
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
    
    public function testGetAllCardsReturnsAllCards()
    {
        // Mock data
        $expectedCards = [
            [
                'bank_id' => 1,
                'card_number' => '4111111111111111',
                'expiration_date' => '2025-12-31',
                'cvv' => '123',
                'card_type' => 'credit',
                'pin' => '1234'
            ],
            [
                'bank_id' => 2,
                'card_number' => '5555555555554444',
                'expiration_date' => '2026-12-31',
                'cvv' => '456',
                'card_type' => 'debit',
                'pin' => '5678'
            ]
        ];
        
        // Mock Card model methods
        $this->card->shouldReceive('getAll')
            ->once()
            ->andReturn($expectedCards);
        
        // Start output buffering
        ob_start();
        
        // Call the method
        $this->cardController->getAllCards();
        
        // Get the output
        $output = ob_get_clean();
        
        // Assert the output
        $this->assertEquals(json_encode($expectedCards), $output);
    }
    
    public function testGetAllCardsByBankReturnsCardsWhenFound()
    {
        // Mock data
        $bankId = 1;
        $expectedCards = [
            [
                'bank_id' => $bankId,
                'card_number' => '4111111111111111',
                'expiration_date' => '2025-12-31',
                'cvv' => '123',
                'card_type' => 'credit',
                'pin' => '1234'
            ],
            [
                'bank_id' => $bankId,
                'card_number' => '5555555555554444',
                'expiration_date' => '2026-12-31',
                'cvv' => '456',
                'card_type' => 'debit',
                'pin' => '5678'
            ]
        ];
        
        // Mock Card model methods
        $this->card->shouldReceive('getAllByBank')
            ->once()
            ->with($bankId)
            ->andReturn($expectedCards);
        
        // Start output buffering
        ob_start();
        
        // Call the method
        $this->cardController->getAllCardsByBank($bankId);
        
        // Get the output
        $output = ob_get_clean();
        
        // Assert the output
        $this->assertEquals(json_encode($expectedCards), $output);
    }
    
    public function testGetCardReturnsCardWhenFound()
    {
        // Mock data
        $bankId = 1;
        $cardNumber = '4111111111111111';
        $expectedCard = [
            'bank_id' => $bankId,
            'card_number' => $cardNumber,
            'expiration_date' => '2025-12-31',
            'cvv' => '123',
            'card_type' => 'credit',
            'pin' => '1234'
        ];
        
        // Mock Card model methods
        $this->card->shouldReceive('getByBankAndCardNumber')
            ->once()
            ->with($bankId, $cardNumber)
            ->andReturn($expectedCard);
        
        // Start output buffering
        ob_start();
        
        // Call the method
        $this->cardController->getCard($bankId, $cardNumber);
        
        // Get the output
        $output = ob_get_clean();
        
        // Assert the output
        $this->assertEquals(json_encode($expectedCard), $output);
    }
    
    public function testGetCardReturnsErrorWhenNotFound()
    {
        // Mock data
        $bankId = 1;
        $cardNumber = '9999999999999999'; // Non-existent card
        
        // Mock Card model methods
        $this->card->shouldReceive('getByBankAndCardNumber')
            ->once()
            ->with($bankId, $cardNumber)
            ->andReturn(null);
        
        // Start output buffering
        ob_start();
        
        // Call the method
        $this->cardController->getCard($bankId, $cardNumber);
        
        // Get the output
        $output = ob_get_clean();
        
        // Assert the output
        $this->assertEquals(json_encode(['error' => 'Card not found']), $output);
    }
    
    public function testCreateCardCreatesSuccessfully()
    {
        // Mock data
        $cardData = [
            'bank_id' => 1,
            'card_number' => '4111111111111111',
            'expiration_date' => '2025-12-31',
            'cvv' => '123',
            'card_type' => 'credit',
            'pin' => '1234'
        ];
        
        // Mock Card model methods
        $this->card->shouldReceive('create')
            ->once()
            ->with(
                $cardData['bank_id'],
                $cardData['card_number'],
                $cardData['expiration_date'],
                $cardData['cvv'],
                $cardData['card_type'],
                $cardData['pin']
            )
            ->andReturn(true);
        
        // Start output buffering
        ob_start();
        
        // Call the method
        $this->cardController->createCard($cardData);
        
        // Get the output
        $output = ob_get_clean();
        
        // Assert the output
        $this->assertEquals(json_encode(['success' => true]), $output);
    }
    
    public function testCreateCardReturnsErrorWhenMissingFields()
    {
        // Mock data with missing required field
        $cardData = [
            'bank_id' => 1,
            'card_number' => '4111111111111111',
            'expiration_date' => '2025-12-31',
            'cvv' => '123',
            'card_type' => 'credit'
            // pin is missing
        ];
        
        // Start output buffering
        ob_start();
        
        // Call the method
        $this->cardController->createCard($cardData);
        
        // Get the output
        $output = ob_get_clean();
        
        // Assert the output
        $this->assertEquals(json_encode(['error' => 'Missing required field: pin']), $output);
    }
    
    public function testUpdateCardUpdatesSuccessfully()
    {
        // Mock data
        $bankId = 1;
        $cardNumber = '4111111111111111';
        $cardData = [
            'expiration_date' => '2026-12-31',
            'cvv' => '456',
            'card_type' => 'debit',
            'pin' => '5678'
        ];
        
        // Mock Card model methods
        $this->card->shouldReceive('update')
            ->once()
            ->with($bankId, $cardNumber, $cardData)
            ->andReturn(true);
        
        // Start output buffering
        ob_start();
        
        // Call the method
        $this->cardController->updateCard($bankId, $cardNumber, $cardData);
        
        // Get the output
        $output = ob_get_clean();
        
        // Assert the output
        $this->assertEquals(json_encode(['success' => true]), $output);
    }
    
    public function testDeleteCardDeletesSuccessfully()
    {
        // Mock data
        $bankId = 1;
        $cardNumber = '4111111111111111';
        
        // Mock Card model methods
        $this->card->shouldReceive('delete')
            ->once()
            ->with($bankId, $cardNumber)
            ->andReturn(true);
        
        // Start output buffering
        ob_start();
        
        // Call the method
        $this->cardController->deleteCard($bankId, $cardNumber);
        
        // Get the output
        $output = ob_get_clean();
        
        // Assert the output
        $this->assertEquals(json_encode(['success' => true]), $output);
    }
    
    public function testVerifyCardPinReturnsTrueWhenCorrect()
    {
        // Mock data
        $data = [
            'bank_id' => 1,
            'card_number' => '4111111111111111',
            'pin' => '1234'
        ];
        
        // Mock Card model methods
        $this->card->shouldReceive('verifyPin')
            ->once()
            ->with($data['bank_id'], $data['card_number'], $data['pin'])
            ->andReturn(true);
        
        // Start output buffering
        ob_start();
        
        // Call the method
        $this->cardController->verifyCardPin($data);
        
        // Get the output
        $output = ob_get_clean();
        
        // Assert the output
        $this->assertEquals(json_encode(['valid' => true]), $output);
    }
    
    public function testVerifyCardPinReturnsFalseWhenIncorrect()
    {
        // Mock data
        $data = [
            'bank_id' => 1,
            'card_number' => '4111111111111111',
            'pin' => '9999' // Incorrect PIN
        ];
        
        // Mock Card model methods
        $this->card->shouldReceive('verifyPin')
            ->once()
            ->with($data['bank_id'], $data['card_number'], $data['pin'])
            ->andReturn(false);
        
        // Start output buffering
        ob_start();
        
        // Call the method
        $this->cardController->verifyCardPin($data);
        
        // Get the output
        $output = ob_get_clean();
        
        // Assert the output
        $this->assertEquals(json_encode(['valid' => false]), $output);
    }
    
    public function testVerifyCardPinReturnsErrorWhenMissingFields()
    {
        // Mock data with missing required field
        $data = [
            'bank_id' => 1,
            'card_number' => '4111111111111111'
            // pin is missing
        ];
        
        // Start output buffering
        ob_start();
        
        // Call the method
        $this->cardController->verifyCardPin($data);
        
        // Get the output
        $output = ob_get_clean();
        
        // Assert the output
        $this->assertEquals(json_encode(['error' => 'Missing required field: pin']), $output);
    }
} 