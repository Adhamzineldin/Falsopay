<?php

namespace Tests\unit\Controllers;

use App\controllers\SupportController;
use App\models\SupportTicket;
use App\models\User;
use Tests\unit\TestCase;
use Mockery;
use PDO;
use PDOStatement;

class SupportControllerTest extends TestCase
{
    protected $pdo;
    protected $supportTicket;
    protected $user;
    protected $supportController;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        // Create mock PDO
        $this->pdo = Mockery::mock(PDO::class);
        
        // Create mock models
        $this->supportTicket = Mockery::mock(SupportTicket::class);
        $this->user = Mockery::mock(User::class);
        
        // Create SupportController instance and inject dependencies
        $this->supportController = new SupportController($this->supportTicket, $this->user);
    }
    
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
    
    public function testGetUserTicketsReturnsTicketsWhenFound()
    {
        // Mock data
        $userId = 1;
        $expectedTickets = [
            [
                'ticket_id' => 1,
                'user_id' => $userId,
                'subject' => 'Test ticket',
                'message' => 'Test message',
                'status' => 'open'
            ],
            [
                'ticket_id' => 2,
                'user_id' => $userId,
                'subject' => 'Another test ticket',
                'message' => 'Another test message',
                'status' => 'closed'
            ]
        ];
        
        // Mock SupportTicket model methods
        $this->supportTicket->shouldReceive('getTicketsByUserId')
            ->once()
            ->with($userId)
            ->andReturn($expectedTickets);
        
        // Call the method
        $result = $this->supportController->getUserTickets($userId);
        
        // Assert the result
        $this->assertEquals('success', $result['status']);
        $this->assertEquals($expectedTickets, $result['data']);
        $this->assertEquals(200, $result['code']);
    }
    
    public function testGetUserTicketsReturnsEmptyArrayWhenNoTicketsFound()
    {
        // Mock data
        $userId = 1;
        $expectedTickets = [];
        
        // Mock SupportTicket model methods
        $this->supportTicket->shouldReceive('getTicketsByUserId')
            ->once()
            ->with($userId)
            ->andReturn($expectedTickets);
        
        // Call the method
        $result = $this->supportController->getUserTickets($userId);
        
        // Assert the result
        $this->assertEquals('success', $result['status']);
        $this->assertEquals($expectedTickets, $result['data']);
        $this->assertEquals(200, $result['code']);
    }
    
    public function testGetTicketReturnsTicketWhenFound()
    {
        // Mock data
        $ticketId = 1;
        $userId = 1;
        $expectedTicket = [
            'ticket_id' => $ticketId,
            'user_id' => $userId,
            'subject' => 'Test ticket',
            'message' => 'Test message',
            'status' => 'open'
        ];
        
        $expectedReplies = [
            [
                'reply_id' => 1,
                'ticket_id' => $ticketId,
                'user_id' => $userId,
                'message' => 'Test reply',
                'is_admin' => false
            ]
        ];
        
        // Mock SupportTicket model methods
        $this->supportTicket->shouldReceive('getTicketById')
            ->once()
            ->with($ticketId)
            ->andReturn($expectedTicket);
        
        $this->supportTicket->shouldReceive('getRepliesByTicketId')
            ->once()
            ->with($ticketId)
            ->andReturn($expectedReplies);
        
        // Call the method
        $result = $this->supportController->getTicket($ticketId, $userId);
        
        // Assert the result
        $this->assertEquals('success', $result['status']);
        $this->assertEquals($expectedTicket, $result['data']['ticket']);
        $this->assertEquals($expectedReplies, $result['data']['replies']);
        $this->assertEquals(200, $result['code']);
    }
    
    public function testGetTicketReturnsErrorWhenNotFound()
    {
        // Mock data
        $ticketId = 999; // Non-existent ticket
        $userId = 1;
        
        // Mock SupportTicket model methods
        $this->supportTicket->shouldReceive('getTicketById')
            ->once()
            ->with($ticketId)
            ->andReturn(null);
        
        // Call the method
        $result = $this->supportController->getTicket($ticketId, $userId);
        
        // Assert the result
        $this->assertEquals('error', $result['status']);
        $this->assertEquals('Ticket not found', $result['message']);
        $this->assertEquals(404, $result['code']);
    }
    
    public function testCreateTicketCreatesSuccessfully()
    {
        // Mock data
        $ticketData = [
            'user_id' => 1,
            'subject' => 'Test ticket',
            'message' => 'Test message'
        ];
        
        $expectedTicket = [
            'ticket_id' => 1,
            'user_id' => $ticketData['user_id'],
            'subject' => $ticketData['subject'],
            'message' => $ticketData['message'],
            'status' => 'open'
        ];
        
        // Mock User model methods
        $this->user->shouldReceive('getUserById')
            ->with($ticketData['user_id'])
            ->andReturn([
                'user_id' => $ticketData['user_id'],
                'first_name' => 'John',
                'last_name' => 'Doe'
            ]);
        
        $this->user->shouldReceive('getAdminUsers')
            ->andReturn([
                [
                    'user_id' => 2,
                    'first_name' => 'Admin',
                    'last_name' => 'User'
                ]
            ]);
        
        // Mock SupportTicket model methods
        $this->supportTicket->shouldReceive('createTicket')
            ->once()
            ->with(
                $ticketData['user_id'],
                $ticketData['subject'],
                $ticketData['message']
            )
            ->andReturn($expectedTicket);
        
        // Call the method
        $result = $this->supportController->createTicket($ticketData);
        
        // Assert the result
        $this->assertEquals('success', $result['status']);
        $this->assertEquals('Support ticket created successfully', $result['message']);
        $this->assertEquals($expectedTicket, $result['data']);
        $this->assertEquals(201, $result['code']);
    }
    
    public function testCreateTicketReturnsErrorWhenUserNotFound()
    {
        // Mock data
        $ticketData = [
            'user_id' => 999, // Non-existent user
            'subject' => 'Test ticket',
            'message' => 'Test message'
        ];
        
        // Mock User model methods
        $this->user->shouldReceive('getUserById')
            ->with($ticketData['user_id'])
            ->andReturn(null);
        
        // Call the method
        $result = $this->supportController->createTicket($ticketData);
        
        // Assert the result
        $this->assertEquals('error', $result['status']);
        $this->assertEquals('User not found', $result['message']);
        $this->assertEquals(404, $result['code']);
    }
    
    public function testAddReplyAddsSuccessfully()
    {
        // Mock data
        $replyData = [
            'ticket_id' => 1,
            'message' => 'Test reply'
        ];
        
        $userId = 1;
        $isAdmin = false;
        
        $expectedTicket = [
            'ticket_id' => $replyData['ticket_id'],
            'user_id' => $userId,
            'subject' => 'Test ticket',
            'message' => 'Test message',
            'status' => 'open'
        ];
        
        $expectedReply = [
            'reply_id' => 1,
            'ticket_id' => $replyData['ticket_id'],
            'user_id' => $userId,
            'message' => $replyData['message'],
            'is_admin' => $isAdmin
        ];
        
        // Mock SupportTicket model methods
        $this->supportTicket->shouldReceive('getTicketById')
            ->once()
            ->with($replyData['ticket_id'])
            ->andReturn($expectedTicket);
        
        $this->supportTicket->shouldReceive('addReply')
            ->once()
            ->with(
                $replyData['ticket_id'],
                $userId,
                $replyData['message'],
                $isAdmin
            )
            ->andReturn($expectedReply);
        
        // Mock User model methods
        $this->user->shouldReceive('getAdminUsers')
            ->andReturn([
                [
                    'user_id' => 2,
                    'first_name' => 'Admin',
                    'last_name' => 'User'
                ]
            ]);
        
        // Call the method
        $result = $this->supportController->addReply($replyData, $userId, $isAdmin);
        
        // Assert the result
        $this->assertEquals('success', $result['status']);
        $this->assertEquals('Reply added successfully', $result['message']);
        $this->assertEquals($expectedReply, $result['data']);
        $this->assertEquals(200, $result['code']);
    }
    
    public function testAddReplyReturnsErrorWhenTicketNotFound()
    {
        // Mock data
        $replyData = [
            'ticket_id' => 999, // Non-existent ticket
            'message' => 'Test reply'
        ];
        
        $userId = 1;
        $isAdmin = false;
        
        // Mock SupportTicket model methods
        $this->supportTicket->shouldReceive('getTicketById')
            ->once()
            ->with($replyData['ticket_id'])
            ->andReturn(null);
        
        // Call the method
        $result = $this->supportController->addReply($replyData, $userId, $isAdmin);
        
        // Assert the result
        $this->assertEquals('error', $result['status']);
        $this->assertEquals('Ticket not found', $result['message']);
        $this->assertEquals(404, $result['code']);
    }
    
    public function testUpdateTicketStatusUpdatesSuccessfully()
    {
        // Mock data
        $ticketId = 1;
        $status = 'closed';
        
        // Mock SupportTicket model methods
        $this->supportTicket->shouldReceive('updateTicketStatus')
            ->once()
            ->with($ticketId, $status)
            ->andReturn(true);
        
        // Call the method
        $result = $this->supportController->updateTicketStatus($ticketId, $status);
        
        // Assert the result
        $this->assertEquals('success', $result['status']);
        $this->assertEquals('Ticket status updated successfully', $result['message']);
        $this->assertEquals(200, $result['code']);
    }
    
    public function testUpdateTicketStatusReturnsErrorWhenTicketNotFound()
    {
        // Mock data
        $ticketId = 999; // Non-existent ticket
        $status = 'closed';
        
        // Mock SupportTicket model methods
        $this->supportTicket->shouldReceive('updateTicketStatus')
            ->once()
            ->with($ticketId, $status)
            ->andReturn(false);
        
        // Call the method
        $result = $this->supportController->updateTicketStatus($ticketId, $status);
        
        // Assert the result
        $this->assertEquals('error', $result['status']);
        $this->assertEquals('Failed to update ticket status', $result['message']);
        $this->assertEquals(500, $result['code']);
    }
} 