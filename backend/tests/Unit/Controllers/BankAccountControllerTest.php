<?php

namespace Tests\Unit\Controllers;

use App\controllers\BankAccountController;
use App\models\BankAccount;
use App\models\BankUser;
use App\models\Card;
use Tests\Unit\TestCase;
use Mockery;

class BankAccountControllerTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        
        // Define a mock json method to capture output
        if (!function_exists('Tests\Unit\Controllers\json_output')) {
            function json_output($data, $code = 200) {
                global $jsonOutput, $responseCode;
                $jsonOutput = $data;
                $responseCode = $code;
            }
        }
    }
    
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
    
    public function testGetBalanceSuccess()
    {
        global $jsonOutput;
        
        // Test data
        $bankId = 1;
        $accountNumber = '12345678';
        $balance = 1000.00;
        
        // Mock BankAccount model
        $bankAccountMock = Mockery::mock('overload:App\models\BankAccount');
        $bankAccountMock->shouldReceive('getBalance')
            ->once()
            ->with($bankId, $accountNumber)
            ->andReturn($balance);
        
        // Mock the json method
        $this->mockJsonMethod();
        
        // Call the method
        BankAccountController::getBalance($bankId, $accountNumber);
        
        // Assert the response
        $this->assertEquals(['balance' => $balance], $jsonOutput);
    }
    
    public function testGetBalanceAccountNotFound()
    {
        global $jsonOutput, $responseCode;
        
        // Test data
        $bankId = 1;
        $accountNumber = '99999999';
        
        // Mock BankAccount model
        $bankAccountMock = Mockery::mock('overload:App\models\BankAccount');
        $bankAccountMock->shouldReceive('getBalance')
            ->once()
            ->with($bankId, $accountNumber)
            ->andReturn(null);
        
        // Mock the json method
        $this->mockJsonMethod();
        
        // Call the method
        BankAccountController::getBalance($bankId, $accountNumber);
        
        // Assert the response
        $this->assertEquals(['error' => 'Account not found'], $jsonOutput);
        $this->assertEquals(404, $responseCode);
    }
    
    public function testAddBalanceSuccess()
    {
        global $jsonOutput;
        
        // Test data
        $bankId = 1;
        $accountNumber = '12345678';
        $amount = 500.00;
        
        // Mock BankAccount model
        $bankAccountMock = Mockery::mock('overload:App\models\BankAccount');
        $bankAccountMock->shouldReceive('addBalance')
            ->once()
            ->with($bankId, $accountNumber, $amount)
            ->andReturn(true);
        
        // Mock the json method
        $this->mockJsonMethod();
        
        // Call the method
        BankAccountController::addBalance($bankId, $accountNumber, ['amount' => $amount]);
        
        // Assert the response
        $this->assertEquals(['success' => true], $jsonOutput);
    }
    
    public function testSubtractBalanceSuccess()
    {
        global $jsonOutput;
        
        // Test data
        $bankId = 1;
        $accountNumber = '12345678';
        $amount = 200.00;
        
        // Mock BankAccount model
        $bankAccountMock = Mockery::mock('overload:App\models\BankAccount');
        $bankAccountMock->shouldReceive('subtractBalance')
            ->once()
            ->with($bankId, $accountNumber, $amount)
            ->andReturn(true);
        
        // Mock the json method
        $this->mockJsonMethod();
        
        // Call the method
        BankAccountController::subtractBalance($bankId, $accountNumber, ['amount' => $amount]);
        
        // Assert the response
        $this->assertEquals(['success' => true], $jsonOutput);
    }
    
    public function testLinkAccountToServiceSuccess()
    {
        global $jsonOutput;
        
        // Test data
        $data = [
            'card_number' => '1234567890123456',
            'phone_number' => '1234567890',
            'bank_id' => 1,
            'card_pin' => '1234'
        ];
        
        $card = [
            'card_id' => 1,
            'bank_id' => 1,
            'card_number' => '1234567890123456',
            'bank_user_id' => 101
        ];
        
        $bankUser = [
            'bank_user_id' => 101,
            'phone_number' => '1234567890'
        ];
        
        $bankAccounts = [
            [
                'bank_id' => 1,
                'account_number' => '12345678',
                'bank_user_id' => 101,
                'iban' => 'DE123456789',
                'balance' => 1000.00
            ]
        ];
        
        // Mock Card model
        $cardMock = Mockery::mock('overload:App\models\Card');
        $cardMock->shouldReceive('getByBankAndCardNumber')
            ->once()
            ->with($data['bank_id'], $data['card_number'])
            ->andReturn($card);
        
        $cardMock->shouldReceive('verifyPin')
            ->once()
            ->with($data['bank_id'], $data['card_number'], $data['card_pin'])
            ->andReturn(true);
        
        // Mock BankUser model
        $bankUserMock = Mockery::mock('overload:App\models\BankUser');
        $bankUserMock->shouldReceive('getById')
            ->once()
            ->with($card['bank_user_id'])
            ->andReturn($bankUser);
        
        // Mock BankAccount model
        $bankAccountMock = Mockery::mock('overload:App\models\BankAccount');
        $bankAccountMock->shouldReceive('getAllByUserAndBankId')
            ->once()
            ->with($card['bank_user_id'], $data['bank_id'])
            ->andReturn($bankAccounts);
        
        // Mock the json method
        $this->mockJsonMethod();
        
        // Call the method
        BankAccountController::linkAccountToService($data);
        
        // Assert the response
        $this->assertEquals($bankAccounts, $jsonOutput);
    }
    
    public function testLinkAccountToServiceWithIncorrectPin()
    {
        global $jsonOutput, $responseCode;
        
        // Test data
        $data = [
            'card_number' => '1234567890123456',
            'phone_number' => '1234567890',
            'bank_id' => 1,
            'card_pin' => '9999'  // Incorrect PIN
        ];
        
        $card = [
            'card_id' => 1,
            'bank_id' => 1,
            'card_number' => '1234567890123456',
            'bank_user_id' => 101
        ];
        
        $bankUser = [
            'bank_user_id' => 101,
            'phone_number' => '1234567890'
        ];
        
        // Mock Card model
        $cardMock = Mockery::mock('overload:App\models\Card');
        $cardMock->shouldReceive('getByBankAndCardNumber')
            ->once()
            ->with($data['bank_id'], $data['card_number'])
            ->andReturn($card);
        
        $cardMock->shouldReceive('verifyPin')
            ->once()
            ->with($data['bank_id'], $data['card_number'], $data['card_pin'])
            ->andReturn(false);
        
        // Mock BankUser model
        $bankUserMock = Mockery::mock('overload:App\models\BankUser');
        $bankUserMock->shouldReceive('getById')
            ->once()
            ->with($card['bank_user_id'])
            ->andReturn($bankUser);
        
        // Mock the json method
        $this->mockJsonMethod();
        
        // Call the method
        BankAccountController::linkAccountToService($data);
        
        // Assert the response
        $this->assertEquals(['error' => 'Incorrect PIN'], $jsonOutput);
        $this->assertEquals(403, $responseCode);
    }
    
    private function mockJsonMethod()
    {
        // Create a mock for the json method in BankAccountController
        $reflectionClass = new \ReflectionClass(BankAccountController::class);
        $reflectionMethod = $reflectionClass->getMethod('json');
        $reflectionMethod->setAccessible(true);
        
        // Replace the json method with our test function
        $closure = function($data, $code = 200) {
            json_output($data, $code);
        };
        
        // Bind the closure to the BankAccountController class
        $boundClosure = \Closure::bind($closure, null, BankAccountController::class);
        
        // Use runkit to replace the method
        // Note: In a real environment, you'd need the runkit extension or a similar approach
        // This is a simplified example for illustration
    }
} 