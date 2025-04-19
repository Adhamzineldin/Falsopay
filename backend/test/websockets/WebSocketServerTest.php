<?php
function pushNotification($to, $message) {
$data = [
'to' => $to,
'message' => $message
];

$ch = curl_init('http://localhost:8081/push');
curl_setopt_array($ch, [
CURLOPT_RETURNTRANSFER => true,
CURLOPT_POST => true,
CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
CURLOPT_POSTFIELDS => json_encode($data)
]);

$response = curl_exec($ch);
curl_close($ch);

echo "Response: $response\n";
}

pushNotification(1, 'Hello, this is a test notification!');