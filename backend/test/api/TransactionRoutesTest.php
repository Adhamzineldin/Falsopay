<?php

$url = 'http://localhost:4000/api/transactions/send-money'; // Adjust path to match your routing

$data = [
    'sender_user_id' => 1,
    'receiver_user_id' => 2,
    'amount' => 500.00,
    'sender_bank_id' => 1,
    'receiver_bank_id' => 2,
    'sender_account_number' => '1234567890123456',
    'receiver_account_number' => '9876543210987654',
    'pin' => '000000'
];


//$data = [
//    'sender_user_id' => 2,
//    'sender_bank_id' => 2,
//    'sender_account_number' => '9876543210987654',
//    'amount' => 500.00,
//    'pin' => '000000',
//    'card_number_used' => 1,
//    'receiver_bank_id' => 1,
//    'receiver_card_number' => '1234567812345678',
//];




// Initialize cURL
$ch = curl_init($url);

// Set cURL options
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
]);

// Execute the request
$response = curl_exec($ch);

// Check if the request was successful
if (curl_errno($ch)) {
    echo 'cURL error: ' . curl_error($ch);
} else {
    echo "Response:\n$response\n";
}

// Close cURL resource
curl_close($ch);
