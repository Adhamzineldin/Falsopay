<?php
// Suppress deprecated warnings (PHP 8.2+ compatibility)
error_reporting(E_ALL & ~E_DEPRECATED);

// Load environment variables
require __DIR__ . '/../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use React\Http\HttpServer;
use React\Http\Message\Response;
use React\EventLoop\Factory;
use React\Socket\SocketServer;
use React\Socket\Server as ReactSocket;
use Psr\Http\Message\ServerRequestInterface;

class NotificationServer implements MessageComponentInterface {
    protected $clients = [];
    protected $userConnections = [];
    protected $pendingMessages = []; // Store messages for offline users
    protected $lastActivity = [];
    protected $maxConnections;
    protected $maxPendingMessagesPerUser;
    protected $maxMessageSize;
    protected $heartbeatInterval;

    public function __construct() {
        // Load configuration from environment variables or use defaults
        $this->maxConnections = (int)($_ENV['WS_MAX_CONNECTIONS'] ?? 1000);
        $this->maxPendingMessagesPerUser = (int)($_ENV['WS_MAX_PENDING_MESSAGES'] ?? 50);
        $this->maxMessageSize = (int)($_ENV['WS_MAX_MESSAGE_SIZE'] ?? 32768); // 32KB
        $this->heartbeatInterval = (int)($_ENV['WS_HEARTBEAT_INTERVAL'] ?? 30); // 30 seconds
        
        echo "🚀 WebSocket server initialized with configuration:\n";
        echo "   - Max connections: {$this->maxConnections}\n";
        echo "   - Max pending messages per user: {$this->maxPendingMessagesPerUser}\n";
        echo "   - Max message size: {$this->maxMessageSize} bytes\n";
        echo "   - Heartbeat interval: {$this->heartbeatInterval} seconds\n";
    }

    public function onOpen(ConnectionInterface $conn) {
        // Limit maximum concurrent connections
        if (count($this->clients) >= $this->maxConnections) {
            $conn->send(json_encode(['type' => 'error', 'message' => 'Server connection limit reached']));
            $conn->close();
            echo "⚠️ Connection rejected: maximum connections reached\n";
            return;
        }

        parse_str(parse_url($conn->httpRequest->getUri(), PHP_URL_QUERY), $query);
        $userId = $query['userId'] ?? null;

        if (!$userId) {
            $conn->send(json_encode(['type' => 'error', 'message' => 'Authentication required']));
            $conn->close();
            echo "⚠️ Connection rejected: no user ID provided\n";
            return;
        }

        // Store connection information
        $this->clients[$conn->resourceId] = $conn;
        $this->lastActivity[$conn->resourceId] = time();
        $conn->userId = $userId;
        
        // If user already has a connection, close the old one (prevents multiple tabs issues)
        if (isset($this->userConnections[$userId]) && $this->userConnections[$userId]->resourceId !== $conn->resourceId) {
            $oldConn = $this->userConnections[$userId];
            $oldConn->send(json_encode(['type' => 'info', 'message' => 'Connected from another location']));
            $oldConn->close();
            echo "👥 User {$userId} connected from a new location, closing previous connection\n";
        }
        
        $this->userConnections[$userId] = $conn;

        // Deliver pending messages if any
        if (isset($this->pendingMessages[$userId]) && !empty($this->pendingMessages[$userId])) {
            $count = count($this->pendingMessages[$userId]);
            foreach ($this->pendingMessages[$userId] as $message) {
                $conn->send(json_encode($message));
            }
            unset($this->pendingMessages[$userId]); // Clear after sending
            echo "✅ Delivered {$count} pending messages to user {$userId}\n";
        }

        // Send connection acknowledgment
        $conn->send(json_encode([
            'type' => 'connection',
            'status' => 'connected',
            'timestamp' => time()
        ]));

        echo "🔌 New connection: {$conn->resourceId}, user: {$userId}\n";
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        // Update activity timestamp
        $this->lastActivity[$from->resourceId] = time();
        
        // Check message size
        if (strlen($msg) > $this->maxMessageSize) {
            $from->send(json_encode([
                'type' => 'error', 
                'message' => 'Message exceeds maximum allowed size'
            ]));
            echo "⚠️ Message from {$from->userId} rejected: exceeds size limit\n";
            return;
        }
        
        try {
            $data = json_decode($msg, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception("Invalid JSON");
            }
            
            // Handle client heartbeat
            if (isset($data['type']) && $data['type'] === 'heartbeat') {
                $from->send(json_encode([
                    'type' => 'heartbeat',
                    'timestamp' => time()
                ]));
                return;
            }
            
            echo "📩 Message from {$from->userId}: " . substr($msg, 0, 100) . (strlen($msg) > 100 ? '...' : '') . "\n";
            // You can add additional server-side command handling here if needed
            
        } catch (\Exception $e) {
            $from->send(json_encode([
                'type' => 'error', 
                'message' => 'Invalid message format'
            ]));
            echo "⚠️ Error processing message from {$from->userId}: {$e->getMessage()}\n";
        }
    }

    public function onClose(ConnectionInterface $conn) {
        // Clean up resources
        unset($this->clients[$conn->resourceId]);
        unset($this->lastActivity[$conn->resourceId]);
        
        if (isset($conn->userId)) {
            // Only remove from userConnections if this is the current connection for that user
            if (isset($this->userConnections[$conn->userId]) && 
                $this->userConnections[$conn->userId]->resourceId === $conn->resourceId) {
                unset($this->userConnections[$conn->userId]);
            }
            echo "❌ Connection {$conn->resourceId} (User {$conn->userId}) closed\n";
        } else {
            echo "❌ Connection {$conn->resourceId} closed\n";
        }
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "⚠️ Error on connection {$conn->resourceId}: {$e->getMessage()}\n";
        
        // Try to send an error message to the client
        try {
            $conn->send(json_encode([
                'type' => 'error',
                'message' => 'Server error occurred'
            ]));
        } catch (\Exception $ex) {
            // Ignore if we can't send
        }
        
        $conn->close();
    }

    public function notifyUser($userId, $data) {
        if (isset($this->userConnections[$userId])) {
            try {
                $this->userConnections[$userId]->send(json_encode($data));
                echo "📤 Sent notification to user {$userId}\n";
                return true;
            } catch (\Exception $e) {
                echo "⚠️ Failed to send notification to user {$userId}: {$e->getMessage()}\n";
                // If sending fails, store as pending message
                $this->storePendingMessage($userId, $data);
                return false;
            }
        } else {
            // Cache if user is offline
            $this->storePendingMessage($userId, $data);
            return false;
        }
    }
    
    protected function storePendingMessage($userId, $data) {
        if (!isset($this->pendingMessages[$userId])) {
            $this->pendingMessages[$userId] = [];
        }
        
        // Limit the number of pending messages per user to prevent memory issues
        if (count($this->pendingMessages[$userId]) >= $this->maxPendingMessagesPerUser) {
            // Remove oldest message (FIFO)
            array_shift($this->pendingMessages[$userId]);
        }
        
        $this->pendingMessages[$userId][] = $data;
        echo "🗂️ Cached message for offline user {$userId} (pending: " . 
             count($this->pendingMessages[$userId]) . ")\n";
    }
    
    public function cleanupInactiveConnections($maxIdleTime = 300) {
        $now = time();
        $closedCount = 0;
        
        foreach ($this->lastActivity as $resourceId => $lastActive) {
            if (($now - $lastActive) > $maxIdleTime) {
                if (isset($this->clients[$resourceId])) {
                    try {
                        $conn = $this->clients[$resourceId];
                        $conn->send(json_encode([
                            'type' => 'timeout',
                            'message' => 'Connection closed due to inactivity'
                        ]));
                        $conn->close();
                        $closedCount++;
                    } catch (\Exception $e) {
                        // Connection might already be broken
                    }
                }
                
                // Clean up references
                unset($this->lastActivity[$resourceId]);
                unset($this->clients[$resourceId]);
            }
        }
        
        if ($closedCount > 0) {
            echo "🧹 Cleaned up {$closedCount} inactive connections\n";
        }
        
        // Memory status
        if (function_exists('memory_get_usage')) {
            $memUsage = round(memory_get_usage() / 1048576, 2); // Convert to MB
            echo "📊 Memory usage: {$memUsage} MB, Active connections: " . count($this->clients) . "\n";
        }
    }
    
    public function broadcastHeartbeat() {
        $timestamp = time();
        $count = 0;
        
        foreach ($this->clients as $client) {
            try {
                $client->send(json_encode([
                    'type' => 'heartbeat',
                    'timestamp' => $timestamp
                ]));
                $count++;
            } catch (\Exception $e) {
                // Log but don't throw - we'll clean up broken connections separately
                echo "⚠️ Failed to send heartbeat to client {$client->resourceId}: {$e->getMessage()}\n";
            }
        }
        
        echo "💓 Sent heartbeat to {$count} clients\n";
    }
}

// Initialize the ReactPHP event loop
$loop = Factory::create();
$notificationServer = new NotificationServer();

// Get host and port from environment variables
$host = $_ENV["HOST"] ?? '0.0.0.0';
$wsPort = $_ENV['WS_PORT'] ?? 8080;
$httpPort = $_ENV['HTTP_PORT'] ?? 8081;
$inactivityTimeout = (int)($_ENV['WS_INACTIVITY_TIMEOUT'] ?? 300); // 5 minutes
$heartbeatInterval = (int)($_ENV['WS_HEARTBEAT_INTERVAL'] ?? 30); // 30 seconds

// Set up WebSocket server
$webSocketServer = new Ratchet\Server\IoServer(
    new Ratchet\Http\HttpServer(
        new Ratchet\WebSocket\WsServer($notificationServer)
    ),
    new ReactSocket("$host:$wsPort"),
    $loop
);

// Set up HTTP POST endpoint to receive push data
$httpServer = new HttpServer(function (ServerRequestInterface $request) use ($notificationServer) {
    if ($request->getUri()->getPath() === '/push' && $request->getMethod() === 'POST') {
        try {
            $body = (string)$request->getBody();
            $data = json_decode($body, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                return new Response(400, ['Content-Type' => 'application/json'], 
                    json_encode(['status' => 'error', 'message' => 'Invalid JSON']));
            }
            
            $to = $data['to'] ?? null;
            if (!$to) {
                return new Response(400, ['Content-Type' => 'application/json'], 
                    json_encode(['status' => 'error', 'message' => 'Missing `to` field']));
            }
            
            $success = $notificationServer->notifyUser($to, $data);
            return new Response(
                200, 
                ['Content-Type' => 'application/json'], 
                json_encode([
                    'status' => 'ok', 
                    'delivered' => $success
                ])
            );
        } catch (\Exception $e) {
            return new Response(
                500, 
                ['Content-Type' => 'application/json'], 
                json_encode([
                    'status' => 'error', 
                    'message' => 'Server error: ' . $e->getMessage()
                ])
            );
        }
    }

    return new Response(404, [], 'Not found');
});

$socket = new SocketServer("$host:$httpPort", [], $loop); // HTTP server socket
$httpServer->listen($socket);

// Set up periodic tasks for maintenance
$loop->addPeriodicTimer($heartbeatInterval, function() use ($notificationServer) {
    $notificationServer->broadcastHeartbeat();
});

$loop->addPeriodicTimer($inactivityTimeout / 3, function() use ($notificationServer, $inactivityTimeout) {
    $notificationServer->cleanupInactiveConnections($inactivityTimeout);
});

// Final startup logs
echo "✅ WebSocket server running at wss://$host:$wsPort\n";
echo "✅ HTTP push endpoint running at https://$host:$httpPort/push\n";
echo "✅ Inactivity timeout set to {$inactivityTimeout} seconds\n";

$loop->run();
