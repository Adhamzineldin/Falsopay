<?php

namespace Tests\Controllers;

use JetBrains\PhpStorm\NoReturn;
use Mockery;
use PHPUnit\Framework\TestCase;
use Mockery\Adapter\Phpunit\MockeryPHPUnitIntegration;
use App\controllers\AuthController;
use App\models\User;
use App\models\InstantPaymentAddress;
use App\middleware\AuthMiddleware;
use App\services\WhatsAppAPI;

class AuthControllerTest extends TestCase
{
    use MockeryPHPUnitIntegration;

    public function tearDown(): void
    {
        Mockery::close();
    }

    /**
     * @runInSeparateProcess
     */
    #[NoReturn] public function testSendMsg()
    {
        // Whenever AuthController does `new WhatsAppAPI()`, use this mock:
        $whatsApp = Mockery::mock('overload:' . WhatsAppAPI::class);
        $whatsApp
            ->shouldReceive('sendMessage')
            ->once()
            ->with('123456789', 'Test message');

        // No JSON output expected
        $this->expectOutputString('');
        AuthController::sendMsg([
            'recipient' => '123456789',
            'message'   => 'Test message'
        ]);
    }

    /**
     * @runInSeparateProcess
     */
    #[NoReturn] public function testCheckIfUserWithPhoneNumberExists_success()
    {
        // Use the real user data to simulate getUserByPhoneNumber
        $userData = [
            'user_id' => 1,
            'first_name' => 'Adham',
            'last_name' => 'Zineldin',
            'email' => 'Mohalya3@gmail.com',
            'phone_number' => '201157000509'
        ];

        // Mock User::getUserByPhoneNumber(...) to return a real user
        $user = Mockery::mock('overload:' . User::class);
        $user->shouldReceive('getUserByPhoneNumber')
            ->once()
            ->with('201157000509')
            ->andReturn($userData);

        // Expect JSON: {"exists":true,"user_id":1}
        $this->expectOutputString('{"exists":true,"user_id":1}');
        AuthController::checkIfUserWithPhoneNumberExists([
            'phone_number' => '201157000509'
        ]);
    }

    /**
     * @runInSeparateProcess
     */
    #[NoReturn] public function testCheckIfUserWithPhoneNumberExists_missing()
    {
        // No mock call here
        $this->expectOutputString('{"error":"Phone number is required"}');
        AuthController::checkIfUserWithPhoneNumberExists([]);
    }

    /**
     * @runInSeparateProcess
     * @throws \Exception
     */
    #[NoReturn] public function testCreateUser_success()
    {
        // Mock AuthMiddleware::generateToken(...)
        $auth = Mockery::mock('overload:' . AuthMiddleware::class);
        $auth->shouldReceive('generateToken')
            ->once()
            ->with(1)
            ->andReturn('mock_token');

        // Mock User:: methods with real user data
        $user = Mockery::mock('overload:' . User::class);
        $user->shouldReceive('getUserByPhoneNumber')
            ->once()
            ->with('01012345678')
            ->andReturnNull();
        $user->shouldReceive('createUser')
            ->once()
            ->with('John', 'Doe', '01012345678', 'john@example.com')
            ->andReturn(['user_id' => 1]);

        // Expect JSON containing our token and user
        $this->expectOutputString(
            '{"success":true,"user_token":"mock_token","user":{"user_id":1}}'
        );
        AuthController::createUser([
            'first_name'   => 'John',
            'last_name'    => 'Doe',
            'phone_number' => '01012345678',
            'email'        => 'john@example.com'
        ]);
    }

    /**
     * @runInSeparateProcess
     * @throws \Exception
     */
    #[NoReturn] public function testCreateUser_missingField()
    {
        // We'll hit the missing‑field branch for 'email'
        $this->expectOutputString('{"error":"Missing required field: email"}');
        AuthController::createUser([
            'first_name'   => 'John',
            'last_name'    => 'Doe',
            'phone_number' => '01012345678'
            // email missing
        ]);
    }

    /**
     * @runInSeparateProcess
     */
    #[NoReturn] public function testLogin_successWithoutIpa()
    {
        // Use real user data for login
        $userData = [
            'user_id' => 1,
            'first_name' => 'Adham',
            'last_name' => 'Zineldin',
            'email' => 'Mohalya3@gmail.com',
            'phone_number' => '201157000509'
        ];

        // Mock user lookup with real data
        $user = Mockery::mock('overload:' . User::class);
        $user->shouldReceive('getUserByPhoneNumber')
            ->once()
            ->with('201157000509')
            ->andReturn($userData);

        // No IPAs found
        $ipa = Mockery::mock('overload:' . InstantPaymentAddress::class);
        $ipa->shouldReceive('getAllByUserId')
            ->once()
            ->with(1)
            ->andReturn([]);

        // Token generation
        $auth = Mockery::mock('overload:' . AuthMiddleware::class);
        $auth->shouldReceive('generateToken')
            ->once()
            ->with(1)
            ->andReturn('mock_token');

        $this->expectOutputString(
            '{"success":true,"user_token":"mock_token","user":{"user_id":1}}'
        );
        AuthController::login([
            'phone_number' => '201157000509',
            'ipa'          => 'anything'
        ]);
    }

    /**
     * @runInSeparateProcess
     */
    #[NoReturn] public function testLogin_missingIpaField()
    {
        $this->expectOutputString('{"error":"Missing required field: ipa"}');
        AuthController::login([
            'phone_number' => '201157000509'
            // ipa missing
        ]);
    }

    /**
     * @runInSeparateProcess
     */
    #[NoReturn] public function testDeleteAccount_noIpa()
    {
        // Use real user data to mock user lookup
        $userData = [
            'user_id' => 1,
            'first_name' => 'Adham',
            'last_name' => 'Zineldin',
            'email' => 'Mohalya3@gmail.com',
            'phone_number' => '201157000509'
        ];

        // Mock user lookup
        $user = Mockery::mock('overload:' . User::class);
        $user->shouldReceive('getUserByPhoneNumber')
            ->once()
            ->with('201157000509')
            ->andReturn($userData);

        // No IPAs
        $ipa = Mockery::mock('overload:' . InstantPaymentAddress::class);
        $ipa->shouldReceive('getAllByUserId')
            ->once()
            ->with(1)
            ->andReturn([]);

        // Should output this and exit
        $this->expectOutputString(
            '{"success":true,"message":"No IPA found for this user"}'
        );
        AuthController::deleteAccount([
            'phone_number' => '201157000509'
        ]);
    }

    /**
     * @runInSeparateProcess
     */
    #[NoReturn] public function testDeleteAccount_userNotFound()
    {
        // Mock user lookup to return null for non-existent user
        $user = Mockery::mock('overload:' . User::class);
        $user->shouldReceive('getUserByPhoneNumber')
            ->once()
            ->with('01098765432')
            ->andReturnNull();

        $this->expectOutputString('{"error":"User not found"}');
        AuthController::deleteAccount([
            'phone_number' => '01098765432'
        ]);
    }
}
