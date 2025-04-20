<?php

namespace App\controllers;

use App\services\WhatsAppAPI;
use JetBrains\PhpStorm\NoReturn;

class AuthController
{
    #[NoReturn] public static function sendMsg(array $data): void
    {
        $whatsAppAPI = new WhatsAppAPI();
        $recipient = $data['recipient'] ?? null;
        $message = $data['message'] ?? null;
        if ($recipient && $message) {
            $whatsAppAPI->sendMessage($recipient, $message);
        } else {
            echo "Recipient or message is missing.";
        }
        
    }
}