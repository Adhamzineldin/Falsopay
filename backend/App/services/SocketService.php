<?php

namespace App\services;

use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->load();

class SocketService
{
    protected string $pushEndpoint;

    public function __construct()
    {
        // Load WebSocket endpoint from environment variables, use fallback if not defined
        
        $this->pushEndpoint = $_ENV['WEBSOCKET_PUSH_ENDPOINT'] ?? 'http://localhost:4101/push';
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
        $ch = \curl_init($this->pushEndpoint);
        curl_setopt_array($ch, [
            CURLOPT_POST       => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS => json_encode($data),
        ]);

        $response = curl_exec($ch);
        if (curl_errno($ch)) {
            error_log('SocketService cURL error: ' . curl_error($ch));
        }
        curl_close($ch);
    }
}
