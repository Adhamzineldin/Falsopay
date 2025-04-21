<?php

namespace App\services;

use Dotenv\Dotenv;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

$dotenv = Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->load();

class SocketService
{
    protected string $pushEndpoint;
    protected Client $client;

    public function __construct()
    {
        // Load WebSocket endpoint from environment variables, use fallback if not defined
        $this->pushEndpoint = $_ENV['WEBSOCKET_PUSH_ENDPOINT'] ?? 'http://localhost:4101/push';
        $this->client = new Client();  // Guzzle client instance
    }

    public function sendTransactionStatus(
        int $fromUserId,
        int $toUserId,
        float $amount,
        string $fromName,
        string $toName,
        int $transactionId
    ): void {
        $payload = [
            'to'             => $toUserId,
            'type'           => 'transaction_notification',
            'transaction_id' => $transactionId,
            'from_user_id'   => $fromUserId,
            'from_name'      => $fromName,
            'to_user_id'     => $toUserId,
            'to_name'        => $toName,
            'amount'         => $amount,
            'timestamp'      => time(),
            'message'        => "💸 You received EGP $amount from $fromName"
        ];

        $this->postToWebSocketServer($payload);
    }

    protected function postToWebSocketServer(array $data): void
    {
        try {
            $response = $this->client->post($this->pushEndpoint, [
                'json' => $data,  // Automatically encodes the data as JSON
                'headers' => [
                    'Content-Type' => 'application/json',
                ],
            ]);
            // You can log the response or handle it as needed
            if ($response->getStatusCode() !== 200) {
                error_log('Failed to send transaction notification.');
            }
        } catch (RequestException $e) {
            error_log('SocketService Guzzle error: ' . $e->getMessage());
        }
    }
}
