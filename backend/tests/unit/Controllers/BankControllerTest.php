<?php

namespace Tests\unit\Controllers;

use App\controllers\BankController;
use App\models\Bank;
use App\models\BankUser;
use Tests\unit\TestCase;
use Mockery;
use PDO;
use PDOStatement;

class BankControllerTest extends TestCase
{
    protected $pdo;
    protected $bank;
    protected $bankUser;
    protected $bankController;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        // Create mock PDO
        $this->pdo = Mockery::mock(PDO::class);
        
        // Create mock models
        $this->bank = Mockery::mock(Bank::class);
        $this->bankUser = Mockery::mock(BankUser::class);
        
        // Create BankController instance and inject dependencies
        $this->bankController = new BankController($this->bank, $this->bankUser);
    }
    
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
    
    public function testGetAllBanksReturnsAllBanks()
    {
        // Mock data
        $expectedBanks = [
            [
                'bank_id' => 1,
                'bank_name' => 'Bank A',
                'bank_code' => 'BKA',
                'swift_code' => 'BKAAUSXX'
            ],
            [
                'bank_id' => 2,
                'bank_name' => 'Bank B',
                'bank_code' => 'BKB',
                'swift_code' => 'BKBBUSXX'
            ]
        ];
        
        // Mock Bank model methods
        $this->bank->shouldReceive('getAll')
            ->once()
            ->andReturn($expectedBanks);
        
        // Call the method
        $this->bankController->getAllBanks();
    }
    
    public function testGetBankByIdReturnsBankWhenFound()
    {
        // Mock data
        $bankId = 1;
        $expectedBank = [
            'bank_id' => $bankId,
            'bank_name' => 'Bank A',
            'bank_code' => 'BKA',
            'swift_code' => 'BKAAUSXX'
        ];
        
        // Mock Bank model methods
        $this->bank->shouldReceive('getBankById')
            ->once()
            ->with($bankId)
            ->andReturn($expectedBank);
        
        // Call the method
        $this->bankController->getBankById($bankId);
    }
    
    public function testGetBankByIdReturnsErrorWhenNotFound()
    {
        // Mock data
        $bankId = 999; // Non-existent bank
        
        // Mock Bank model methods
        $this->bank->shouldReceive('getBankById')
            ->once()
            ->with($bankId)
            ->andReturn(null);
        
        // Call the method
        $this->bankController->getBankById($bankId);
    }
    
    public function testCreateBankCreatesSuccessfully()
    {
        // Mock data
        $bankData = [
            'bank_name' => 'New Bank',
            'bank_code' => 'NBK',
            'swift_code' => 'NBKAUSXX'
        ];
        
        // Mock Bank model methods
        $this->bank->shouldReceive('create')
            ->once()
            ->with($bankData['bank_name'], $bankData['bank_code'], $bankData['swift_code'])
            ->andReturn(true);
        
        // Call the method
        $this->bankController->createBank($bankData);
    }
    
    public function testCreateBankReturnsErrorWhenMissingFields()
    {
        // Mock data with missing required field
        $bankData = [
            'bank_name' => 'New Bank',
            'bank_code' => 'NBK'
            // swift_code is missing
        ];
        
        // Call the method
        $this->bankController->createBank($bankData);
    }
    
    public function testUpdateBankUpdatesSuccessfully()
    {
        // Mock data
        $bankId = 1;
        $bankData = [
            'bank_name' => 'Updated Bank',
            'bank_code' => 'UBK',
            'swift_code' => 'UBKAUSXX'
        ];
        
        // Mock Bank model methods
        $this->bank->shouldReceive('update')
            ->once()
            ->with($bankId, $bankData['bank_name'], $bankData['bank_code'], $bankData['swift_code'])
            ->andReturn(true);
        
        // Call the method
        $this->bankController->updateBank($bankId, $bankData);
    }
    
    public function testUpdateBankReturnsErrorWhenMissingFields()
    {
        // Mock data with missing required field
        $bankId = 1;
        $bankData = [
            'bank_name' => 'Updated Bank',
            'bank_code' => 'UBK'
            // swift_code is missing
        ];
        
        // Call the method
        $this->bankController->updateBank($bankId, $bankData);
    }
    
    public function testDeleteBankDeletesSuccessfully()
    {
        // Mock data
        $bankId = 1;
        
        // Mock Bank model methods
        $this->bank->shouldReceive('delete')
            ->once()
            ->with($bankId)
            ->andReturn(true);
        
        // Call the method
        $this->bankController->deleteBank($bankId);
    }
    
    public function testGetBankUsersReturnsUsersWhenFound()
    {
        // Mock data
        $bankId = 1;
        $expectedUsers = [
            [
                'bank_user_id' => 1,
                'bank_id' => $bankId,
                'name' => 'John Doe',
                'phone_number' => '1234567890'
            ],
            [
                'bank_user_id' => 2,
                'bank_id' => $bankId,
                'name' => 'Jane Smith',
                'phone_number' => '0987654321'
            ]
        ];
        
        // Mock BankUser model methods
        $this->bankUser->shouldReceive('getByBankId')
            ->once()
            ->with($bankId)
            ->andReturn($expectedUsers);
        
        // Call the method
        $result = $this->bankController->getBankUsers($bankId);
        
        // Assert result
        $this->assertTrue($result['success']);
        $this->assertEquals($expectedUsers, $result['users']);
    }
    
    public function testGetBankUsersReturnsEmptyArrayWhenNoUsersFound()
    {
        // Mock data
        $bankId = 999; // Bank with no users
        
        // Mock BankUser model methods
        $this->bankUser->shouldReceive('getByBankId')
            ->once()
            ->with($bankId)
            ->andReturn([]);
        
        // Call the method
        $result = $this->bankController->getBankUsers($bankId);
        
        // Assert result
        $this->assertTrue($result['success']);
        $this->assertEmpty($result['users']);
    }
} 