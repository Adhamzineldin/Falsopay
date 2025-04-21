<?php

namespace App\services;

class SocketService
{
    protected string $pushEndpoint;

    public function __construct(string $pushEndpoint = 'http://localhost:8081/push')
    {
        $this->pushEndpoint = $pushEndpoint;
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
