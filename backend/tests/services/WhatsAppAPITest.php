<?php

// Correct the path for requiring the WhatsAppAPI.php file
use App\services\WhatsAppAPI;

require_once '../../App/services/WhatsAppAPI.php'; // Adjust the path if needed


// Instantiate the WhatsAppAPI class
$whatsAppAPI = new WhatsAppAPI();

// Pass the recipient number and message as parameters to the sendMessage function
$recipientPhoneNumber = "201157000509"; // Replace with the recipient's phone number
$code = 123456;
$message = "Your Verification code is : $code"; // The message you want to send

// Send the message
$whatsAppAPI->sendMessage($recipientPhoneNumber, $message);


