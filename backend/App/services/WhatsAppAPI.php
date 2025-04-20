<?php

namespace App\services;

// Load the .env file to get environment variables
require_once __DIR__ . '/../../vendor/autoload.php';

use Dotenv\Dotenv;
use GuzzleHttp\Client;

$dotenv = Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->load();

class WhatsAppAPI
{
    private Client $client;

    public function __construct()
    {
        $this->client = new \GuzzleHttp\Client();
    }

    public function sendMessage($recipient, $message)
    {
        // Get the environment variables
        $apiUrl = $_ENV['WHATSAPP_API_URL'];
        $bearerToken = $_ENV['BEARER_TOKEN'];

        // Debug: Check if the variables are loaded properly
//        echo 'API URL: ' . $apiUrl . PHP_EOL;
//        echo 'Bearer Token: ' . $bearerToken . PHP_EOL;

        // Prepare the message data
        $data = [
            "messaging_product" => "whatsapp",
            "to" => $recipient, // The recipient's phone number
            "type" => "text", // Sending a regular text message, not template
            "text" => [
                "body" => $message // The message you want to send
            ]
        ];

        try {
            // Send the request using Guzzle (disabling SSL verification)
            $response = $this->client->post($apiUrl, [
                'headers' => [
                    'Authorization' => 'Bearer ' . $bearerToken,
                    'Content-Type' => 'application/json'
                ],
                'json' => $data,
                'verify' => false // Disable SSL verification (for testing purposes only)
            ]);

            // Get the response body
            $body = $response->getBody();
            echo "Response: " . $body;
        } catch (\GuzzleHttp\Exception\RequestException $e) {
            // Handle request errors
            echo "Request Error: " . $e->getMessage();
        }
    }
    
}


