<?php

// Correct the path for requiring the WhatsAppAPI.php file
use App\services\EmailService;

require_once '../../App/services/EmailService.php'; // Adjust the path if needed

// Pass the recipient number and message as parameters to the sendMessage function
$email = "Mohalya3@gmail.com";
$code = 123456;


EmailService::sendVerificationCode($email, $code);


