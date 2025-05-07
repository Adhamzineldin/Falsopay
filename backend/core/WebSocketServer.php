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

    public function onOpen(ConnectionInterface $conn) {
        parse_str(parse_url($conn->httpRequest->getUri(), PHP_URL_QUERY), $query);
        $userId = $query['userId'] ?? null;

        if ($userId) {
            $this->userConnections[$userId] = $conn;
            $conn->userId = $userId;

            // 🔥 Deliver pending messages if any
            if (isset($this->pendingMessages[$userId])) {
                foreach ($this->pendingMessages[$userId] as $message) {
                    $conn->send(json_encode($message));
                }
                unset($this->pendingMessages[$userId]); // Clear after sending
                echo "✅ Delivered pending messages to user {$userId}\n";
            }
        }

        $this->clients[$conn->resourceId] = $conn;
        echo "🔌 New connection: {$conn->resourceId}, user: {$userId}\n";
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        echo "📩 Message from {$from->userId}: $msg\n";
        // You can add server-side command handling here if needed
    }

    public function onClose(ConnectionInterface $conn) {
        unset($this->clients[$conn->resourceId]);
        if (isset($conn->userId)) {
            unset($this->userConnections[$conn->userId]);
            echo "❌ Connection {$conn->resourceId} (User {$conn->userId}) closed\n";
        }
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "⚠️ Error: {$e->getMessage()}\n";
        $conn->close();
    }

    public function notifyUser($userId, $data) {
        if (isset($this->userConnections[$userId])) {
            $this->userConnections[$userId]->send(json_encode($data));
            echo "📤 Sent notification to user {$userId}\n";
        } else {
            // Cache if user is offline
            $this->pendingMessages[$userId][] = $data;
            echo "🗂️ Cached message for offline user {$userId}\n";
        }
    }
}

// Initialize the ReactPHP event loop
$loop = Factory::create();
$notificationServer = new NotificationServer();

// Get host and port from environment variables
$host = $_ENV["HOST"] ?? '0.0.0.0';
$wsPort = $_ENV['WS_PORT'] ?? 8080;
$httpPort = $_ENV['HTTP_PORT'] ?? 8081;

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
        $data = json_decode((string)$request->getBody(), true);
        $to = $data['to'] ?? null;
        if ($to) {
            $notificationServer->notifyUser($to, $data);
            return new Response(200, ['Content-Type' => 'application/json'], json_encode(['status' => 'ok']));
        }
        return new Response(400, [], 'Missing `to` field');
    }

    return new Response(404, [], 'Not found');
});

$socket = new SocketServer("$host:$httpPort", [], $loop); // HTTP server socket
$httpServer->listen($socket);

// Final startup logs
echo "✅ WebSocket server running at wss://$host:$wsPort\n";
echo "✅ HTTP push endpoint running at https://$host:$httpPort/push\n";

$loop->run();
