<?php
// Suppress deprecated warnings (PHP 8.2+ compatibility)
error_reporting(E_ALL & ~E_DEPRECATED);

require __DIR__ . '/../vendor/autoload.php';

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

    public function onOpen(ConnectionInterface $conn) {
        // Parse query param: ws://localhost:8080?userId=123
        parse_str(parse_url($conn->httpRequest->getUri(), PHP_URL_QUERY), $query);
        $userId = $query['userId'] ?? null;

        if ($userId) {
            $this->userConnections[$userId] = $conn;
            $conn->userId = $userId;
        }

        $this->clients[$conn->resourceId] = $conn;
        echo "New connection: {$conn->resourceId}, user: {$userId}\n";
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        echo "Message from {$from->userId}: $msg\n";
    }

    public function onClose(ConnectionInterface $conn) {
        unset($this->clients[$conn->resourceId]);
        if (isset($conn->userId)) {
            unset($this->userConnections[$conn->userId]);
        }
        echo "Connection {$conn->resourceId} closed\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "Error: {$e->getMessage()}\n";
        $conn->close();
    }

    // Sends a JSON notification to a specific user
    public function notifyUser($userId, $data) {
        if (isset($this->userConnections[$userId])) {
            $this->userConnections[$userId]->send(json_encode($data));
            echo "Sent notification to user {$userId}\n";
        } else {
            echo "User {$userId} not connected\n";
        }
    }
}

// Initialize the ReactPHP event loop
$loop = Factory::create();
$notificationServer = new NotificationServer();

// Set up WebSocket server
$webSocketServer = new Ratchet\Server\IoServer(
    new Ratchet\Http\HttpServer(
        new Ratchet\WebSocket\WsServer($notificationServer)
    ),
    new ReactSocket('0.0.0.0:8080'),
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

$socket = new SocketServer('0.0.0.0:8081', [], $loop); // HTTP server on port 8081
$httpServer->listen($socket);

echo "✅ WebSocket server running on ws://localhost:8080\n";
echo "✅ HTTP push endpoint running on http://localhost:8081/push\n";

$loop->run();
