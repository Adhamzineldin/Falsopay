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
        $expectedData = [
            [
                'ticket_id' => 1,
                'user_id' => $userId,
                'subject' => 'Test Ticket',
                'message' => 'Test message',
                'status' => 'open',
                'created_at' => '2024-03-20 10:00:00'
            ]
        ];
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(Mockery::on(function($params) use ($userId) {
                return $params[':user_id'] === $userId;
            }))
            ->andReturn(true);
        $stmt->shouldReceive('fetchAll')
            ->once()
            ->with(PDO::FETCH_ASSOC)
            ->andReturn($expectedData);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM support_tickets WHERE user_id = :user_id ORDER BY created_at DESC")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->supportTicket->getTicketsByUserId($userId);
        
        // Assert
        $this->assertEquals($expectedData, $result);
    }
    
    public function testGetByUserIdReturnsEmptyArrayWhenNoTicketsFound()
    {
        // Mock data
        $userId = 1;
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(Mockery::on(function($params) use ($userId) {
                return $params[':user_id'] === $userId;
            }))
            ->andReturn(true);
        $stmt->shouldReceive('fetchAll')
            ->once()
            ->with(PDO::FETCH_ASSOC)
            ->andReturn([]);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT * FROM support_tickets WHERE user_id = :user_id ORDER BY created_at DESC")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->supportTicket->getTicketsByUserId($userId);
        
        // Assert
        $this->assertEquals([], $result);
    }
    
    public function testGetByIdReturnsTicketWhenFound()
    {
        // Mock data
        $ticketId = 1;
        $expectedData = [
            'ticket_id' => 1,
            'user_id' => 1,
            'subject' => 'Test Ticket',
            'message' => 'Test message',
            'status' => 'open',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'phone_number' => '1234567890',
            'is_public' => 0,
            'created_at' => '2024-03-20 10:00:00'
        ];
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(Mockery::on(function($params) use ($ticketId) {
                return $params[':id'] === $ticketId;
            }))
            ->andReturn(true);
        $stmt->shouldReceive('fetch')
            ->once()
            ->with(PDO::FETCH_ASSOC)
            ->andReturn($expectedData);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT t.*,
                COALESCE(u.first_name, '') as first_name, 
                COALESCE(u.last_name, '') as last_name, 
                COALESCE(u.email, t.contact_email) as email, 
                COALESCE(u.phone_number, t.contact_phone) as phone_number,
                CASE WHEN t.user_id IS NULL THEN 1 ELSE 0 END as is_public 
                FROM support_tickets t
                LEFT JOIN users u ON t.user_id = u.user_id
                WHERE t.ticket_id = :id")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->supportTicket->getTicketById($ticketId);
        
        // Assert
        $this->assertEquals($expectedData, $result);
    }
    
    public function testGetByIdReturnsNullWhenNotFound()
    {
        // Mock data
        $ticketId = 1;
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(Mockery::on(function($params) use ($ticketId) {
                return $params[':id'] === $ticketId;
            }))
            ->andReturn(true);
        $stmt->shouldReceive('fetch')
            ->once()
            ->with(PDO::FETCH_ASSOC)
            ->andReturn(false);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT t.*,
                COALESCE(u.first_name, '') as first_name, 
                COALESCE(u.last_name, '') as last_name, 
                COALESCE(u.email, t.contact_email) as email, 
                COALESCE(u.phone_number, t.contact_phone) as phone_number,
                CASE WHEN t.user_id IS NULL THEN 1 ELSE 0 END as is_public 
                FROM support_tickets t
                LEFT JOIN users u ON t.user_id = u.user_id
                WHERE t.ticket_id = :id")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->supportTicket->getTicketById($ticketId);
        
        // Assert
        $this->assertNull($result);
    }
    
    public function testCreateTicketCreatesSuccessfully()
    {
        // Mock data
        $userId = 1;
        $subject = 'Test Ticket';
        $message = 'Test message';
        
        // Mock statement for insert
        $insertStmt = Mockery::mock(PDOStatement::class);
        $insertStmt->shouldReceive('execute')
            ->once()
            ->with(Mockery::on(function($params) use ($userId, $subject, $message) {
                return $params['user_id'] === $userId &&
                       $params['subject'] === $subject &&
                       $params['message'] === $message;
            }))
            ->andReturn(true);
        
        // Mock PDO prepare for insert
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("INSERT INTO support_tickets (user_id, subject, message)
                VALUES (:user_id, :subject, :message)")
            ->andReturn($insertStmt);
        
        // Mock lastInsertId
        $this->pdo->shouldReceive('lastInsertId')
            ->once()
            ->andReturn(1);
        
        // Mock statement for getTicketById
        $selectStmt = Mockery::mock(PDOStatement::class);
        $selectStmt->shouldReceive('execute')
            ->once()
            ->with(Mockery::on(function($params) {
                return $params[':id'] === 1;
            }))
            ->andReturn(true);
        $selectStmt->shouldReceive('fetch')
            ->once()
            ->with(PDO::FETCH_ASSOC)
            ->andReturn([
                'ticket_id' => 1,
                'user_id' => $userId,
                'subject' => $subject,
                'message' => $message,
                'status' => 'open',
                'created_at' => '2024-03-20 10:00:00'
            ]);
        
        // Mock PDO prepare for select
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("SELECT t.*,
                COALESCE(u.first_name, '') as first_name, 
                COALESCE(u.last_name, '') as last_name, 
                COALESCE(u.email, t.contact_email) as email, 
                COALESCE(u.phone_number, t.contact_phone) as phone_number,
                CASE WHEN t.user_id IS NULL THEN 1 ELSE 0 END as is_public 
                FROM support_tickets t
                LEFT JOIN users u ON t.user_id = u.user_id
                WHERE t.ticket_id = :id")
            ->andReturn($selectStmt);
        
        // Call the method
        $result = $this->supportTicket->createTicket($userId, $subject, $message);
        
        // Assert
        $this->assertIsArray($result);
        $this->assertEquals(1, $result['ticket_id']);
        $this->assertEquals('open', $result['status']);
    }
    
    public function testUpdateStatusUpdatesSuccessfully()
    {
        // Mock data
        $ticketId = 1;
        $status = 'in_progress';
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('execute')
            ->once()
            ->with(Mockery::on(function($params) use ($ticketId, $status) {
                return $params['id'] === $ticketId &&
                       $params['status'] === $status;
            }))
            ->andReturn(true);
        
        // Mock PDO prepare
        $this->pdo->shouldReceive('prepare')
            ->once()
            ->with("UPDATE support_tickets SET status = :status WHERE ticket_id = :id")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->supportTicket->updateTicketStatus($ticketId, $status);
        
        // Assert
        $this->assertTrue($result);
    }
    
    public function testGetAllReturnsAllTickets()
    {
        // Mock data
        $expectedData = [
            [
                'ticket_id' => 1,
                'user_id' => 1,
                'subject' => 'Test Ticket 1',
                'message' => 'Test message 1',
                'status' => 'open',
                'first_name' => 'John',
                'last_name' => 'Doe',
                'email' => 'john@example.com',
                'phone_number' => '1234567890',
                'is_public' => 0,
                'created_at' => '2024-03-20 10:00:00'
            ],
            [
                'ticket_id' => 2,
                'user_id' => 2,
                'subject' => 'Test Ticket 2',
                'message' => 'Test message 2',
                'status' => 'closed',
                'first_name' => 'Jane',
                'last_name' => 'Smith',
                'email' => 'jane@example.com',
                'phone_number' => '0987654321',
                'is_public' => 0,
                'created_at' => '2024-03-20 11:00:00'
            ]
        ];
        
        // Mock statement
        $stmt = Mockery::mock(PDOStatement::class);
        $stmt->shouldReceive('fetchAll')
            ->once()
            ->with(PDO::FETCH_ASSOC)
            ->andReturn($expectedData);
        
        // Mock PDO query
        $this->pdo->shouldReceive('query')
            ->once()
            ->with("SELECT t.*, 
                COALESCE(u.first_name, '') as first_name, 
                COALESCE(u.last_name, '') as last_name, 
                COALESCE(u.email, t.contact_email) as email, 
                COALESCE(u.phone_number, t.contact_phone) as phone_number,
                CASE WHEN t.user_id IS NULL THEN 1 ELSE 0 END as is_public
                FROM support_tickets t
                LEFT JOIN users u ON t.user_id = u.user_id
                ORDER BY 
                  CASE 
                    WHEN t.status = 'open' THEN 1
                    WHEN t.status = 'in_progress' THEN 2
                    WHEN t.status = 'closed' THEN 3
                  END,
                  t.created_at DESC")
            ->andReturn($stmt);
        
        // Call the method
        $result = $this->supportTicket->getAllTickets();
        
        // Assert
        $this->assertEquals($expectedData, $result);
    }
} 