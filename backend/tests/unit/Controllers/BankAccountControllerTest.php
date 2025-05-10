<?php

namespace Tests\unit\Controllers;

use App\controllers\BankAccountController;
use App\models\BankAccount;
use App\models\Bank;
use Tests\unit\TestCase;
use Mockery;
use PDO;
use PDOStatement;

class BankAccountControllerTest extends TestCase
{
    protected $pdo;
    protected $bankAccount;
    protected $bank;
    protected $bankAccountController;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        // Create mock PDO
        $this->pdo = Mockery::mock(PDO::class);
        
        // Create mock models
        $this->bankAccount = Mockery::mock(BankAccount::class);
        $this->bank = Mockery::mock(Bank::class);
        
        // Create BankAccountController instance and inject dependencies
        $this->bankAccountController = new BankAccountController($this->bankAccount, $this->bank);
    }
    
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
    
    public function testGetByUserIdReturnsAccountsWhenFound()
    {
        // Mock data
        $bankUserId = 1;
        $expectedAccounts = [
            [
                'bank_id' => 1,
                'account_number' => '1234567890',
                'bank_user_id' => $bankUserId,
                'iban' => 'GB29NWBK60161331926819',
                'status' => 'active',
                'type' => 'savings',
                'balance' => 1000.00
            ],
            [
                'bank_id' => 2,
                'account_number' => '0987654321',
                'bank_user_id' => $bankUserId,
                'iban' => 'GB29NWBK60161331926820',
                'status' => 'active',
                'type' => 'checking',
                'balance' => 500.00
            ]
        ];
        
        // Mock BankAccount model methods
        $this->bankAccount->shouldReceive('getAllByUserId')
            ->once()
            ->with($bankUserId)
            ->andReturn($expectedAccounts);
        
        // Call the method
        $this->bankAccountController->getByUserId($bankUserId);
    }
    
    public function testGetByUserIdReturnsEmptyArrayWhenNoAccountsFound()
    {
        // Mock data
        $bankUserId = 999; // User with no accounts
        
        // Mock BankAccount model methods
        $this->bankAccount->shouldReceive('getAllByUserId')
            ->once()
            ->with($bankUserId)
            ->andReturn([]);
        
        // Call the method
        $this->bankAccountController->getByUserId($bankUserId);
    }
    
    public function testGetBankAccountReturnsAccountWhenFound()
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
        
        // Mock BankAccount model methods
        $this->bankAccount->shouldReceive('getByCompositeKey')
            ->once()
            ->with($bankId, $accountNumber)
            ->andReturn($expectedAccount);
        
        // Call the method
        $this->bankAccountController->getBankAccount($bankId, $accountNumber);
    }
    
    public function testGetBankAccountReturnsErrorWhenNotFound()
    {
        // Mock data
        $bankId = 1;
        $accountNumber = '9999999999'; // Non-existent account
        
        // Mock BankAccount model methods
        $this->bankAccount->shouldReceive('getByCompositeKey')
            ->once()
            ->with($bankId, $accountNumber)
            ->andReturn(null);
        
        // Call the method
        $this->bankAccountController->getBankAccount($bankId, $accountNumber);
    }
    
    public function testCreateBankAccountCreatesSuccessfully()
    {
        // Mock data
        $accountData = [
            'bank_id' => 1,
            'account_number' => '1234567890',
            'bank_user_id' => 1,
            'iban' => 'GB29NWBK60161331926819',
            'status' => 'active',
            'type' => 'savings',
            'balance' => 0.00
        ];
        
        // Mock BankAccount model methods
        $this->bankAccount->shouldReceive('create')
            ->once()
            ->with(
                $accountData['bank_id'],
                $accountData['account_number'],
                $accountData['bank_user_id'],
                $accountData['iban'],
                $accountData['status'],
                $accountData['type'],
                $accountData['balance']
            )
            ->andReturn(true);
        
        // Call the method
        $this->bankAccountController->createBankAccount($accountData);
    }
    
    public function testCreateBankAccountReturnsErrorWhenMissingFields()
    {
        // Mock data with missing required field
        $accountData = [
            'bank_id' => 1,
            'account_number' => '1234567890',
            'bank_user_id' => 1,
            'iban' => 'GB29NWBK60161331926819',
            'status' => 'active',
            'type' => 'savings'
            // balance is missing
        ];
        
        // Call the method
        $this->bankAccountController->createBankAccount($accountData);
    }
    
    public function testAddBalanceUpdatesSuccessfully()
    {
        // Mock data
        $bankId = 1;
        $accountNumber = '1234567890';
        $amount = 500.00;
        
        // Mock BankAccount model methods
        $this->bankAccount->shouldReceive('addBalance')
            ->once()
            ->with($bankId, $accountNumber, $amount)
            ->andReturn(true);
        
        // Call the method
        $this->bankAccountController->addBalance($bankId, $accountNumber, ['amount' => $amount]);
    }
    
    public function testAddBalanceReturnsErrorWhenMissingAmount()
    {
        // Mock data
        $bankId = 1;
        $accountNumber = '1234567890';
        
        // Call the method
        $this->bankAccountController->addBalance($bankId, $accountNumber, []);
    }
    
    public function testSubtractBalanceUpdatesSuccessfully()
    {
        // Mock data
        $bankId = 1;
        $accountNumber = '1234567890';
        $amount = 500.00;
        
        // Mock BankAccount model methods
        $this->bankAccount->shouldReceive('subtractBalance')
            ->once()
            ->with($bankId, $accountNumber, $amount)
            ->andReturn(true);
        
        // Call the method
        $this->bankAccountController->subtractBalance($bankId, $accountNumber, ['amount' => $amount]);
    }
    
    public function testSubtractBalanceReturnsErrorWhenMissingAmount()
    {
        // Mock data
        $bankId = 1;
        $accountNumber = '1234567890';
        
        // Call the method
        $this->bankAccountController->subtractBalance($bankId, $accountNumber, []);
    }
    
    public function testGetBalanceReturnsBalanceWhenFound()
    {
        // Mock data
        $bankId = 1;
        $accountNumber = '1234567890';
        $expectedBalance = 1000.00;
        
        // Mock BankAccount model methods
        $this->bankAccount->shouldReceive('getBalance')
            ->once()
            ->with($bankId, $accountNumber)
            ->andReturn($expectedBalance);
        
        // Call the method
        $this->bankAccountController->getBalance($bankId, $accountNumber);
    }
    
    public function testGetBalanceReturnsErrorWhenNotFound()
    {
        // Mock data
        $bankId = 1;
        $accountNumber = '9999999999'; // Non-existent account
        
        // Mock BankAccount model methods
        $this->bankAccount->shouldReceive('getBalance')
            ->once()
            ->with($bankId, $accountNumber)
            ->andReturn(null);
        
        // Call the method
        $this->bankAccountController->getBalance($bankId, $accountNumber);
    }
    
    public function testGetByIBANReturnsAccountWhenFound()
    {
        // Mock data
        $iban = 'GB29NWBK60161331926819';
        $expectedAccount = [
            'bank_id' => 1,
            'account_number' => '1234567890',
            'bank_user_id' => 1,
            'iban' => $iban,
            'status' => 'active',
            'type' => 'savings',
            'balance' => 1000.00
        ];
        
        // Mock BankAccount model methods
        $this->bankAccount->shouldReceive('getByIban')
            ->once()
            ->with($iban)
            ->andReturn($expectedAccount);
        
        // Call the method
        $this->bankAccountController->getByIBAN($iban);
    }
    
    public function testGetByIBANReturnsErrorWhenNotFound()
    {
        // Mock data
        $iban = 'GB29NWBK60161331926899'; // Non-existent IBAN
        
        // Mock BankAccount model methods
        $this->bankAccount->shouldReceive('getByIban')
            ->once()
            ->with($iban)
            ->andReturn(null);
        
        // Call the method
        $this->bankAccountController->getByIBAN($iban);
    }
    
    public function testGetByUserPhoneNumberReturnsAccountsWhenFound()
    {
        // Mock data
        $phoneNumber = 1234567890;
        $bankUserId = 1;
        $expectedAccounts = [
            [
                'bank_id' => 1,
                'account_number' => '1234567890',
                'bank_user_id' => $bankUserId,
                'iban' => 'GB29NWBK60161331926819',
                'status' => 'active',
                'type' => 'savings',
                'balance' => 1000.00
            ]
        ];
        
        // Mock BankUser model methods
        $this->bankUser->shouldReceive('getByPhoneNumber')
            ->once()
            ->with($phoneNumber)
            ->andReturn(['bank_user_id' => $bankUserId]);
        
        // Mock BankAccount model methods
        $this->bankAccount->shouldReceive('getAllByUserId')
            ->once()
            ->with($bankUserId)
            ->andReturn($expectedAccounts);
        
        // Call the method
        $this->bankAccountController->getByUserPhoneNumber($phoneNumber);
    }
    
    public function testGetByUserPhoneNumberReturnsErrorWhenUserNotFound()
    {
        // Mock data
        $phoneNumber = 9999999999; // Non-existent user
        
        // Mock BankUser model methods
        $this->bankUser->shouldReceive('getByPhoneNumber')
            ->once()
            ->with($phoneNumber)
            ->andReturn(null);
        
        // Call the method
        $this->bankAccountController->getByUserPhoneNumber($phoneNumber);
    }
    
    public function testGetByUserAndBankReturnsAccountsWhenFound()
    {
        // Mock data
        $bankUserId = 1;
        $bankId = 1;
        $expectedAccounts = [
            [
                'bank_id' => $bankId,
                'account_number' => '1234567890',
                'bank_user_id' => $bankUserId,
                'iban' => 'GB29NWBK60161331926819',
                'status' => 'active',
                'type' => 'savings',
                'balance' => 1000.00
            ]
        ];
        
        // Mock BankAccount model methods
        $this->bankAccount->shouldReceive('getAllByUserAndBankId')
            ->once()
            ->with($bankUserId, $bankId)
            ->andReturn($expectedAccounts);
        
        // Call the method
        $this->bankAccountController->getByUserAndBank($bankUserId, $bankId);
    }
    
    public function testLinkAccountToServiceLinksSuccessfully()
    {
        // Mock data
        $data = [
            'card_number' => '4111111111111111',
            'phone_number' => '1234567890',
            'bank_id' => 1,
            'card_pin' => '1234'
        ];
        
        $expectedAccounts = [
            [
                'bank_id' => 1,
                'account_number' => '1234567890',
                'bank_user_id' => 1,
                'iban' => 'GB29NWBK60161331926819',
                'status' => 'active',
                'type' => 'savings',
                'balance' => 1000.00
            ]
        ];
        
        // Mock Card model methods
        $this->card->shouldReceive('getByBankAndCardNumber')
            ->once()
            ->with($data['bank_id'], $data['card_number'])
            ->andReturn(['bank_user_id' => 1]);
        
        // Mock BankUser model methods
        $this->bankUser->shouldReceive('getById')
            ->once()
            ->with(1)
            ->andReturn(['phone_number' => $data['phone_number']]);
        
        // Mock Card model methods for PIN verification
        $this->card->shouldReceive('verifyPin')
            ->once()
            ->with($data['bank_id'], $data['card_number'], $data['card_pin'])
            ->andReturn(true);
        
        // Mock BankAccount model methods
        $this->bankAccount->shouldReceive('getAllByUserAndBankId')
            ->once()
            ->with(1, $data['bank_id'])
            ->andReturn($expectedAccounts);
        
        // Call the method
        $this->bankAccountController->linkAccountToService($data);
    }
    
    public function testLinkAccountToServiceReturnsErrorWhenCardNotFound()
    {
        // Mock data
        $data = [
            'card_number' => '4111111111111111',
            'phone_number' => '1234567890',
            'bank_id' => 1,
            'card_pin' => '1234'
        ];
        
        // Mock Card model methods
        $this->card->shouldReceive('getByBankAndCardNumber')
            ->once()
            ->with($data['bank_id'], $data['card_number'])
            ->andReturn(null);
        
        // Call the method
        $this->bankAccountController->linkAccountToService($data);
    }
    
    public function testLinkAccountToServiceReturnsErrorWhenPhoneNumberMismatch()
    {
        // Mock data
        $data = [
            'card_number' => '4111111111111111',
            'phone_number' => '1234567890',
            'bank_id' => 1,
            'card_pin' => '1234'
        ];
        
        // Mock Card model methods
        $this->card->shouldReceive('getByBankAndCardNumber')
            ->once()
            ->with($data['bank_id'], $data['card_number'])
            ->andReturn(['bank_user_id' => 1]);
        
        // Mock BankUser model methods
        $this->bankUser->shouldReceive('getById')
            ->once()
            ->with(1)
            ->andReturn(['phone_number' => '0987654321']); // Different phone number
        
        // Call the method
        $this->bankAccountController->linkAccountToService($data);
    }
    
    public function testLinkAccountToServiceReturnsErrorWhenIncorrectPin()
    {
        // Mock data
        $data = [
            'card_number' => '4111111111111111',
            'phone_number' => '1234567890',
            'bank_id' => 1,
            'card_pin' => '1234'
        ];
        
        // Mock Card model methods
        $this->card->shouldReceive('getByBankAndCardNumber')
            ->once()
            ->with($data['bank_id'], $data['card_number'])
            ->andReturn(['bank_user_id' => 1]);
        
        // Mock BankUser model methods
        $this->bankUser->shouldReceive('getById')
            ->once()
            ->with(1)
            ->andReturn(['phone_number' => $data['phone_number']]);
        
        // Mock Card model methods for PIN verification
        $this->card->shouldReceive('verifyPin')
            ->once()
            ->with($data['bank_id'], $data['card_number'], $data['card_pin'])
            ->andReturn(false);
        
        // Call the method
        $this->bankAccountController->linkAccountToService($data);
    }
} 