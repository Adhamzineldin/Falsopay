<?php

namespace Tests\unit\Controllers;

use App\controllers\TransactionController;
use App\models\Transaction;
use App\models\BankAccount;
use App\models\Card;
use App\models\SystemSettings;
use Tests\unit\TestCase;
use Mockery;
use PDO;
use PDOStatement;

class TransactionControllerTest extends TestCase
{
    protected $pdo;
    protected $transaction;
    protected $bankAccount;
    protected $card;
    protected $systemSettings;
    protected $transactionController;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        // Create mock PDO
        $this->pdo = Mockery::mock(PDO::class);
        
        // Create mock models
        $this->transaction = Mockery::mock(Transaction::class);
        $this->bankAccount = Mockery::mock(BankAccount::class);
        $this->card = Mockery::mock(Card::class);
        $this->systemSettings = Mockery::mock(SystemSettings::class);
        
        // Create TransactionController instance and inject dependencies
        $this->transactionController = new TransactionController(
            $this->transaction,
            $this->bankAccount,
            $this->card,
            $this->systemSettings
        );
    }
    
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
    
    public function testGetTransactionsByUserIdReturnsTransactionsWhenFound()
    {
        // Mock data
        $userId = 1;
        $expectedTransactions = [
            [
                'transaction_id' => 1,
                'user_id' => $userId,
                'type' => 'transfer',
                'amount' => 100.00,
                'status' => 'completed'
            ],
            [
                'transaction_id' => 2,
                'user_id' => $userId,
                'type' => 'payment',
                'amount' => 50.00,
                'status' => 'pending'
            ]
        ];
        
        // Mock Transaction model methods
        $this->transaction->shouldReceive('getAllByUserId')
            ->once()
            ->with($userId)
            ->andReturn($expectedTransactions);
        
        // Call the method
        $this->transactionController->getTransactionsByUserId($userId);
    }
    
    public function testGetTransactionsByUserIdReturnsEmptyArrayWhenNoTransactionsFound()
    {
        // Mock data
        $userId = 1;
        
        // Mock Transaction model methods
        $this->transaction->shouldReceive('getAllByUserId')
            ->once()
            ->with($userId)
            ->andReturn([]);
        
        // Call the method
        $this->transactionController->getTransactionsByUserId($userId);
    }
    
    public function testGetAllTransactionsReturnsAllTransactions()
    {
        // Mock data
        $expectedTransactions = [
            [
                'transaction_id' => 1,
                'user_id' => 1,
                'type' => 'transfer',
                'amount' => 100.00,
                'status' => 'completed'
            ],
            [
                'transaction_id' => 2,
                'user_id' => 2,
                'type' => 'payment',
                'amount' => 50.00,
                'status' => 'pending'
            ]
        ];
        
        // Mock Transaction model methods
        $this->transaction->shouldReceive('getAll')
            ->once()
            ->andReturn($expectedTransactions);
        
        // Call the method
        $this->transactionController->getAllTransactions();
    }
    
    public function testSendMoneyCreatesTransactionSuccessfully()
    {
        // Mock data
        $transactionData = [
            'sender_user_id' => 1,
            'receiver_user_id' => 2,
            'amount' => 100.00,
            'transaction_type' => 'transfer',
            'sender_bank_id' => 1,
            'receiver_bank_id' => 2,
            'sender_account_number' => '1234567890',
            'receiver_account_number' => '0987654321',
            'transfer_method' => 'mobile',
            'pin' => '1234',
            'receiver_mobile_number' => '+1234567890'
        ];
        
        // Mock SystemSettings model methods
        $this->systemSettings->shouldReceive('getSettings')
            ->once()
            ->andReturn([
                'transactions_blocked' => false,
                'transfer_limit_enabled' => false
            ]);
        
        // Mock BankAccount model methods
        $this->bankAccount->shouldReceive('getByCompositeKey')
            ->twice()
            ->andReturn(
                ['bank_id' => 1, 'account_number' => '1234567890', 'balance' => 500.00],
                ['bank_id' => 2, 'account_number' => '0987654321', 'balance' => 200.00]
            );
        
        // Mock Transaction model methods
        $this->transaction->shouldReceive('createTransaction')
            ->once()
            ->with(Mockery::type('array'))
            ->andReturn(1);
        
        // Call the method
        $this->transactionController->sendMoney($transactionData);
    }
    
    public function testSendMoneyReturnsErrorWhenTransactionsBlocked()
    {
        // Mock data
        $transactionData = [
            'sender_user_id' => 1,
            'receiver_user_id' => 2,
            'amount' => 100.00,
            'transaction_type' => 'transfer',
            'sender_bank_id' => 1,
            'receiver_bank_id' => 2,
            'sender_account_number' => '1234567890',
            'receiver_account_number' => '0987654321',
            'transfer_method' => 'mobile',
            'pin' => '1234',
            'receiver_mobile_number' => '+1234567890'
        ];
        
        // Mock SystemSettings model methods
        $this->systemSettings->shouldReceive('getSettings')
            ->once()
            ->andReturn([
                'transactions_blocked' => true,
                'block_message' => 'System maintenance'
            ]);
        
        // Call the method
        $this->transactionController->sendMoney($transactionData);
    }
    
    public function testSendMoneyReturnsErrorWhenTransferLimitExceeded()
    {
        // Mock data
        $transactionData = [
            'sender_user_id' => 1,
            'receiver_user_id' => 2,
            'amount' => 1000.00,
            'transaction_type' => 'transfer',
            'sender_bank_id' => 1,
            'receiver_bank_id' => 2,
            'sender_account_number' => '1234567890',
            'receiver_account_number' => '0987654321',
            'transfer_method' => 'mobile',
            'pin' => '1234',
            'receiver_mobile_number' => '+1234567890'
        ];
        
        // Mock SystemSettings model methods
        $this->systemSettings->shouldReceive('getSettings')
            ->once()
            ->andReturn([
                'transactions_blocked' => false,
                'transfer_limit_enabled' => true,
                'transfer_limit_amount' => 500.00
            ]);
        
        // Call the method
        $this->transactionController->sendMoney($transactionData);
    }
    
    public function testSendMoneyReturnsErrorWhenInsufficientFunds()
    {
        // Mock data
        $transactionData = [
            'sender_user_id' => 1,
            'receiver_user_id' => 2,
            'amount' => 1000.00,
            'transaction_type' => 'transfer',
            'sender_bank_id' => 1,
            'receiver_bank_id' => 2,
            'sender_account_number' => '1234567890',
            'receiver_account_number' => '0987654321',
            'transfer_method' => 'mobile',
            'pin' => '1234',
            'receiver_mobile_number' => '+1234567890'
        ];
        
        // Mock SystemSettings model methods
        $this->systemSettings->shouldReceive('getSettings')
            ->once()
            ->andReturn([
                'transactions_blocked' => false,
                'transfer_limit_enabled' => false
            ]);
        
        // Mock BankAccount model methods
        $this->bankAccount->shouldReceive('getByCompositeKey')
            ->once()
            ->with(1, '1234567890')
            ->andReturn(['bank_id' => 1, 'account_number' => '1234567890', 'balance' => 500.00]);
        
        // Call the method
        $this->transactionController->sendMoney($transactionData);
    }
    
    public function testGetByIdReturnsTransactionWhenFound()
    {
        // Mock data
        $transactionId = 1;
        $expectedTransaction = [
            'transaction_id' => $transactionId,
            'user_id' => 1,
            'type' => 'transfer',
            'amount' => 100.00,
            'status' => 'completed'
        ];
        
        // Mock Transaction model methods
        $this->transaction->shouldReceive('getById')
            ->once()
            ->with($transactionId)
            ->andReturn($expectedTransaction);
        
        // Call the method
        $result = $this->transactionController->getById($transactionId);
        
        // Assert result
        $this->assertTrue($result['success']);
        $this->assertEquals($expectedTransaction, $result['transaction']);
    }
    
    public function testGetByIdReturnsErrorWhenNotFound()
    {
        // Mock data
        $transactionId = 999;
        
        // Mock Transaction model methods
        $this->transaction->shouldReceive('getById')
            ->once()
            ->with($transactionId)
            ->andReturn(null);
        
        // Call the method
        $result = $this->transactionController->getById($transactionId);
        
        // Assert result
        $this->assertFalse($result['success']);
        $this->assertEquals('Transaction not found', $result['message']);
    }
    
    public function testCreateTransferCreatesSuccessfully()
    {
        // Mock data
        $transferData = [
            'user_id' => 1,
            'source_account_id' => 1,
            'destination_account_id' => 2,
            'amount' => 100.00,
            'description' => 'Test transfer'
        ];
        
        // Mock SystemSettings model methods
        $this->systemSettings->shouldReceive('getByKey')
            ->once()
            ->with('maintenance_mode')
            ->andReturn(['value' => 'false']);
        
        // Mock BankAccount model methods
        $this->bankAccount->shouldReceive('getById')
            ->twice()
            ->andReturn(
                ['account_id' => 1, 'balance' => 500.00],
                ['account_id' => 2, 'balance' => 200.00]
            );
        
        // Mock Transaction model methods
        $this->transaction->shouldReceive('create')
            ->once()
            ->with($transferData)
            ->andReturn(true);
        
        // Call the method
        $result = $this->transactionController->createTransfer($transferData);
        
        // Assert result
        $this->assertTrue($result['success']);
        $this->assertEquals('Transfer created successfully', $result['message']);
    }
    
    public function testCreateTransferReturnsErrorWhenMaintenanceMode()
    {
        // Mock data
        $transferData = [
            'user_id' => 1,
            'source_account_id' => 1,
            'destination_account_id' => 2,
            'amount' => 100.00,
            'description' => 'Test transfer'
        ];
        
        // Mock SystemSettings model methods
        $this->systemSettings->shouldReceive('getByKey')
            ->once()
            ->with('maintenance_mode')
            ->andReturn(['value' => 'true']);
        
        // Call the method
        $result = $this->transactionController->createTransfer($transferData);
        
        // Assert result
        $this->assertFalse($result['success']);
        $this->assertEquals('System is under maintenance', $result['message']);
    }
    
    public function testCreateTransferReturnsErrorWhenInsufficientFunds()
    {
        // Mock data
        $transferData = [
            'user_id' => 1,
            'source_account_id' => 1,
            'destination_account_id' => 2,
            'amount' => 1000.00,
            'description' => 'Test transfer'
        ];
        
        // Mock SystemSettings model methods
        $this->systemSettings->shouldReceive('getByKey')
            ->once()
            ->with('maintenance_mode')
            ->andReturn(['value' => 'false']);
        
        // Mock BankAccount model methods
        $this->bankAccount->shouldReceive('getById')
            ->once()
            ->with(1)
            ->andReturn(['account_id' => 1, 'balance' => 500.00]);
        
        // Call the method
        $result = $this->transactionController->createTransfer($transferData);
        
        // Assert result
        $this->assertFalse($result['success']);
        $this->assertEquals('Insufficient funds', $result['message']);
    }
    
    public function testCreateCardPaymentCreatesSuccessfully()
    {
        // Mock data
        $paymentData = [
            'user_id' => 1,
            'card_id' => 1,
            'amount' => 50.00,
            'description' => 'Test payment'
        ];
        
        // Mock SystemSettings model methods
        $this->systemSettings->shouldReceive('getByKey')
            ->once()
            ->with('maintenance_mode')
            ->andReturn(['value' => 'false']);
        
        // Mock Card model methods
        $this->card->shouldReceive('getById')
            ->once()
            ->with(1)
            ->andReturn(['card_id' => 1, 'user_id' => 1]);
        
        // Mock Transaction model methods
        $this->transaction->shouldReceive('create')
            ->once()
            ->with($paymentData)
            ->andReturn(true);
        
        // Call the method
        $result = $this->transactionController->createCardPayment($paymentData);
        
        // Assert result
        $this->assertTrue($result['success']);
        $this->assertEquals('Payment created successfully', $result['message']);
    }
    
    public function testCreateCardPaymentReturnsErrorWhenMaintenanceMode()
    {
        // Mock data
        $paymentData = [
            'user_id' => 1,
            'card_id' => 1,
            'amount' => 50.00,
            'description' => 'Test payment'
        ];
        
        // Mock SystemSettings model methods
        $this->systemSettings->shouldReceive('getByKey')
            ->once()
            ->with('maintenance_mode')
            ->andReturn(['value' => 'true']);
        
        // Call the method
        $result = $this->transactionController->createCardPayment($paymentData);
        
        // Assert result
        $this->assertFalse($result['success']);
        $this->assertEquals('System is under maintenance', $result['message']);
    }
    
    public function testCreateCardPaymentReturnsErrorWhenCardNotFound()
    {
        // Mock data
        $paymentData = [
            'user_id' => 1,
            'card_id' => 999,
            'amount' => 50.00,
            'description' => 'Test payment'
        ];
        
        // Mock SystemSettings model methods
        $this->systemSettings->shouldReceive('getByKey')
            ->once()
            ->with('maintenance_mode')
            ->andReturn(['value' => 'false']);
        
        // Mock Card model methods
        $this->card->shouldReceive('getById')
            ->once()
            ->with(999)
            ->andReturn(null);
        
        // Call the method
        $result = $this->transactionController->createCardPayment($paymentData);
        
        // Assert result
        $this->assertFalse($result['success']);
        $this->assertEquals('Card not found', $result['message']);
    }
    
    public function testUpdateStatusUpdatesSuccessfully()
    {
        // Mock data
        $transactionId = 1;
        $status = 'completed';
        
        // Mock Transaction model methods
        $this->transaction->shouldReceive('getById')
            ->once()
            ->with($transactionId)
            ->andReturn(['transaction_id' => $transactionId]);
        
        $this->transaction->shouldReceive('update')
            ->once()
            ->with($transactionId, ['status' => $status])
            ->andReturn(true);
        
        // Call the method
        $result = $this->transactionController->updateStatus($transactionId, $status);
        
        // Assert result
        $this->assertTrue($result['success']);
        $this->assertEquals('Transaction status updated successfully', $result['message']);
    }
    
    public function testUpdateStatusReturnsErrorWhenNotFound()
    {
        // Mock data
        $transactionId = 999;
        $status = 'completed';
        
        // Mock Transaction model methods
        $this->transaction->shouldReceive('getById')
            ->once()
            ->with($transactionId)
            ->andReturn(null);
        
        // Call the method
        $result = $this->transactionController->updateStatus($transactionId, $status);
        
        // Assert result
        $this->assertFalse($result['success']);
        $this->assertEquals('Transaction not found', $result['message']);
    }
    
    public function testDeleteTransactionDeletesSuccessfully()
    {
        // Mock data
        $transactionId = 1;
        
        // Mock Transaction model methods
        $this->transaction->shouldReceive('getById')
            ->once()
            ->with($transactionId)
            ->andReturn(['transaction_id' => $transactionId]);
        
        $this->transaction->shouldReceive('delete')
            ->once()
            ->with($transactionId)
            ->andReturn(true);
        
        // Call the method
        $result = $this->transactionController->deleteTransaction($transactionId);
        
        // Assert result
        $this->assertTrue($result['success']);
        $this->assertEquals('Transaction deleted successfully', $result['message']);
    }
    
    public function testDeleteTransactionReturnsErrorWhenNotFound()
    {
        // Mock data
        $transactionId = 999;
        
        // Mock Transaction model methods
        $this->transaction->shouldReceive('getById')
            ->once()
            ->with($transactionId)
            ->andReturn(null);
        
        // Call the method
        $result = $this->transactionController->deleteTransaction($transactionId);
        
        // Assert result
        $this->assertFalse($result['success']);
        $this->assertEquals('Transaction not found', $result['message']);
    }
} 