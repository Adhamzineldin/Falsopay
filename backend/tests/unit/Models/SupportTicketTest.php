<?php

namespace Tests\unit\Models;

use App\models\SupportTicket;
use Tests\unit\TestCase;
use Mockery;
use PDO;
use PDOStatement;

class SupportTicketTest extends TestCase
{
    protected $pdo;
    protected $supportTicket;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        // Create mock PDO
        $this->pdo = Mockery::mock(PDO::class);
        
        // Create SupportTicket instance and set PDO using reflection
        $this->supportTicket = new SupportTicket();
        $reflection = new \ReflectionClass($this->supportTicket);
        $property = $reflection->getProperty('pdo');
        $property->setAccessible(true);
        $property->setValue($this->supportTicket, $this->pdo);
    }
    
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
    
    public function testGetByUserIdReturnsTicketsWhenFound()
    {
        // Mock data
        $userId = 1;
        $expectedTickets = [
            [
                'ticket_id' => 1,
                'user_id' => $userId,
                'subject' => 'Payment Issue',
                'message' => 'I cannot complete my payment',
                'status' => 'open',
                'created_at' => '2024-03-20 10:00:00'
            ],
            [
                'ticket_id' => 2,
                'user_id' => $userId,
                'subject' => 'Account Question',
                'message' => 'How do I change my password?',
                'status' => 'closed',
                'created_at' => '2024-03-19 15:00:00'
            ]
        ];
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(['user_id' => $userId])
            ->andReturn(true);
        $stmt->shouldReceive('fetchAll')->once()->with(PDO::FETCH_ASSOC)->andReturn($expectedTickets);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM support_tickets WHERE user_id = :user_id")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->supportTicket->getByUserId($userId);
        
        // Assert result
        $this->assertEquals($expectedTickets, $result);
    }
    
    public function testGetByUserIdReturnsEmptyArrayWhenNoTicketsFound()
    {
        // Mock data
        $userId = 999; // Non-existent user
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(['user_id' => $userId])
            ->andReturn(true);
        $stmt->shouldReceive('fetchAll')->once()->with(PDO::FETCH_ASSOC)->andReturn([]);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM support_tickets WHERE user_id = :user_id")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->supportTicket->getByUserId($userId);
        
        // Assert result
        $this->assertEmpty($result);
    }
    
    public function testGetByIdReturnsTicketWhenFound()
    {
        // Mock data
        $ticketId = 1;
        $expectedTicket = [
            'ticket_id' => $ticketId,
            'user_id' => 1,
            'subject' => 'Payment Issue',
            'message' => 'I cannot complete my payment',
            'status' => 'open',
            'created_at' => '2024-03-20 10:00:00'
        ];
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(['ticket_id' => $ticketId])
            ->andReturn(true);
        $stmt->shouldReceive('fetch')->once()->with(PDO::FETCH_ASSOC)->andReturn($expectedTicket);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM support_tickets WHERE ticket_id = :ticket_id")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->supportTicket->getById($ticketId);
        
        // Assert result
        $this->assertEquals($expectedTicket, $result);
    }
    
    public function testGetByIdReturnsNullWhenNotFound()
    {
        // Mock data
        $ticketId = 999; // Non-existent ticket
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(['ticket_id' => $ticketId])
            ->andReturn(true);
        $stmt->shouldReceive('fetch')->once()->with(PDO::FETCH_ASSOC)->andReturn(false);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM support_tickets WHERE ticket_id = :ticket_id")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->supportTicket->getById($ticketId);
        
        // Assert result
        $this->assertNull($result);
    }
    
    public function testCreateTicketCreatesSuccessfully()
    {
        // Mock data
        $userId = 1;
        $subject = 'Payment Issue';
        $message = 'I cannot complete my payment';
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with([
                'user_id' => $userId,
                'subject' => $subject,
                'message' => $message,
                'status' => 'open'
            ])
            ->andReturn(true);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("INSERT INTO support_tickets (user_id, subject, message, status) VALUES (:user_id, :subject, :message, :status)")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->supportTicket->createTicket($userId, $subject, $message);
        
        // Assert result
        $this->assertTrue($result);
    }
    
    public function testUpdateStatusUpdatesSuccessfully()
    {
        // Mock data
        $ticketId = 1;
        $status = 'closed';
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with([
                'ticket_id' => $ticketId,
                'status' => $status
            ])
            ->andReturn(true);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("UPDATE support_tickets SET status = :status WHERE ticket_id = :ticket_id")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->supportTicket->updateStatus($ticketId, $status);
        
        // Assert result
        $this->assertTrue($result);
    }
    
    public function testGetAllReturnsAllTickets()
    {
        // Mock data
        $expectedTickets = [
            [
                'ticket_id' => 1,
                'user_id' => 1,
                'subject' => 'Payment Issue',
                'message' => 'I cannot complete my payment',
                'status' => 'open',
                'created_at' => '2024-03-20 10:00:00'
            ],
            [
                'ticket_id' => 2,
                'user_id' => 2,
                'subject' => 'Account Question',
                'message' => 'How do I change my password?',
                'status' => 'closed',
                'created_at' => '2024-03-19 15:00:00'
            ]
        ];
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')->once()->andReturn(true);
        $stmt->shouldReceive('fetchAll')->once()->with(PDO::FETCH_ASSOC)->andReturn($expectedTickets);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM support_tickets")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->supportTicket->getAll();
        
        // Assert result
        $this->assertEquals($expectedTickets, $result);
    }
} 