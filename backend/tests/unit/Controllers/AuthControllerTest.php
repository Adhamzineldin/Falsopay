<?php

namespace Tests\Unit\Controllers;

use App\controllers\AuthController;
use App\middleware\AuthMiddleware;
use App\models\InstantPaymentAddress;
use App\models\User;
use Tests\Unit\TestCase;
use Mockery;

class AuthControllerTest extends TestCase
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
    
    public function testCheckIfUserWithPhoneNumberExistsWhenUserExists()
    {
        global $jsonOutput;
        
        // Create a mock User model
        $userMock = Mockery::mock('overload:App\models\User');
        $userMock->shouldReceive('getUserByPhoneNumber')
            ->once()
            ->with('1234567890')
            ->andReturn(['user_id' => 1, 'phone_number' => '1234567890']);
        
        // Mock the json method
        $this->mockJsonMethod();
        
        // Call the method
        AuthController::checkIfUserWithPhoneNumberExists(['phone_number' => '1234567890']);
        
        // Assert the response
        $this->assertEquals(['exists' => true, 'user_id' => 1], $jsonOutput);
    }
    
    public function testCheckIfUserWithPhoneNumberExistsWhenUserDoesNotExist()
    {
        global $jsonOutput;
        
        // Create a mock User model
        $userMock = Mockery::mock('overload:App\models\User');
        $userMock->shouldReceive('getUserByPhoneNumber')
            ->once()
            ->with('9999999999')
            ->andReturn(null);
        
        // Mock the json method
        $this->mockJsonMethod();
        
        // Call the method
        AuthController::checkIfUserWithPhoneNumberExists(['phone_number' => '9999999999']);
        
        // Assert the response
        $this->assertEquals(['exists' => false], $jsonOutput);
    }
    
    public function testCreateUserSuccess()
    {
        global $jsonOutput;
        
        // Test data
        $userData = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@example.com',
            'phone_number' => '1234567890'
        ];
        
        $createdUser = array_merge(['user_id' => 1], $userData);
        $token = 'mock_token_123';
        
        // Mock User model
        $userMock = Mockery::mock('overload:App\models\User');
        $userMock->shouldReceive('getUserByPhoneNumber')
            ->once()
            ->with($userData['phone_number'])
            ->andReturn(null);
        
        $userMock->shouldReceive('getUserByEmail')
            ->once()
            ->with($userData['email'])
            ->andReturn(null);
        
        $userMock->shouldReceive('createUser')
            ->once()
            ->with($userData['first_name'], $userData['last_name'], $userData['email'], $userData['phone_number'])
            ->andReturn($createdUser);
        
        // Mock AuthMiddleware
        $authMock = Mockery::mock('overload:App\middleware\AuthMiddleware');
        $authMock->shouldReceive('generateToken')
            ->once()
            ->with(1)
            ->andReturn($token);
        
        // Mock the json method
        $this->mockJsonMethod();
        
        // Call the method
        AuthController::createUser($userData);
        
        // Assert the response
        $this->assertEquals([
            'success' => true,
            'user_token' => $token,
            'user' => $createdUser
        ], $jsonOutput);
    }
    
    public function testCreateUserWithExistingPhoneNumber()
    {
        global $jsonOutput, $responseCode;
        
        // Test data
        $userData = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@example.com',
            'phone_number' => '1234567890'
        ];
        
        // Mock User model
        $userMock = Mockery::mock('overload:App\models\User');
        $userMock->shouldReceive('getUserByPhoneNumber')
            ->once()
            ->with($userData['phone_number'])
            ->andReturn(['user_id' => 1, 'phone_number' => $userData['phone_number']]);
        
        // Mock the json method
        $this->mockJsonMethod();
        
        // Call the method
        AuthController::createUser($userData);
        
        // Assert the response
        $this->assertEquals(['error' => 'Phone number is already in use'], $jsonOutput);
        $this->assertEquals(409, $responseCode);
    }
    
    public function testLoginSuccess()
    {
        global $jsonOutput;
        
        // Test data
        $loginData = [
            'phone_number' => '1234567890',
            'ipa_address' => 'test@ipa'
        ];
        
        $user = [
            'user_id' => 1,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@example.com',
            'phone_number' => '1234567890',
            'status' => 'active'
        ];
        
        $ipaAccounts = [
            [
                'ipa_id' => 1,
                'user_id' => 1,
                'ipa_address' => 'test@ipa'
            ]
        ];
        
        $token = 'mock_token_123';
        
        // Mock User model
        $userMock = Mockery::mock('overload:App\models\User');
        $userMock->shouldReceive('getUserByPhoneNumber')
            ->once()
            ->with($loginData['phone_number'])
            ->andReturn($user);
        
        // Mock IPA model
        $ipaMock = Mockery::mock('overload:App\models\InstantPaymentAddress');
        $ipaMock->shouldReceive('getAllByUserId')
            ->once()
            ->with($user['user_id'])
            ->andReturn($ipaAccounts);
        
        // Mock AuthMiddleware
        $authMock = Mockery::mock('overload:App\middleware\AuthMiddleware');
        $authMock->shouldReceive('generateToken')
            ->once()
            ->with($user['user_id'])
            ->andReturn($token);
        
        // Mock the json method
        $this->mockJsonMethod();
        
        // Call the method
        AuthController::login($loginData);
        
        // Assert the response
        $this->assertEquals([
            'success' => true,
            'user_token' => $token,
            'user' => $user
        ], $jsonOutput);
    }
    
    public function testLoginWithInvalidIPA()
    {
        global $jsonOutput, $responseCode;
        
        // Test data
        $loginData = [
            'phone_number' => '1234567890',
            'ipa_address' => 'wrong@ipa'
        ];
        
        $user = [
            'user_id' => 1,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@example.com',
            'phone_number' => '1234567890',
            'status' => 'active'
        ];
        
        $ipaAccounts = [
            [
                'ipa_id' => 1,
                'user_id' => 1,
                'ipa_address' => 'test@ipa'
            ]
        ];
        
        // Mock User model
        $userMock = Mockery::mock('overload:App\models\User');
        $userMock->shouldReceive('getUserByPhoneNumber')
            ->once()
            ->with($loginData['phone_number'])
            ->andReturn($user);
        
        // Mock IPA model
        $ipaMock = Mockery::mock('overload:App\models\InstantPaymentAddress');
        $ipaMock->shouldReceive('getAllByUserId')
            ->once()
            ->with($user['user_id'])
            ->andReturn($ipaAccounts);
        
        // Mock the json method
        $this->mockJsonMethod();
        
        // Call the method
        AuthController::login($loginData);
        
        // Assert the response
        $this->assertEquals(['error' => 'Invalid IPA'], $jsonOutput);
        $this->assertEquals(401, $responseCode);
    }
    
    private function mockJsonMethod()
    {
        // Create a mock for the json method in AuthController
        $reflectionClass = new \ReflectionClass(AuthController::class);
        $reflectionMethod = $reflectionClass->getMethod('json');
        $reflectionMethod->setAccessible(true);
        
        // Replace the json method with our test function
        $closure = function($data, $code = 200) {
            json_output($data, $code);
        };
        
        // Bind the closure to the AuthController class
        $boundClosure = \Closure::bind($closure, null, AuthController::class);
        
        // Use runkit to replace the method
        // Note: In a real environment, you'd need the runkit extension or a similar approach
        // This is a simplified example for illustration
    }
} 