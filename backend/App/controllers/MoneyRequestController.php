<?php

namespace App\controllers;

use App\models\MoneyRequest;
use App\models\InstantPaymentAddress;
use App\models\User;
use App\models\Transaction;
use Exception;

class MoneyRequestController {
    private $moneyRequestModel;
    private $ipaModel;
    private $userModel;
    private $transactionModel;

    public function __construct() {
        $this->moneyRequestModel = new MoneyRequest();
        $this->ipaModel = new InstantPaymentAddress();
        $this->userModel = new User();
        $this->transactionModel = new Transaction();
    }

    /**
     * Create a new money request
     * 
     * @param mixed $request The request object or array from the router
     * @return array
     */
    public function createRequest($request) {
        try {
            // Check if request is an array
            if (is_array($request)) {
                $requestData = $request;
                $userId = $_SERVER['AUTHENTICATED_USER_ID'] ?? null;
                
                if (!$userId) {
                    return ['success' => false, 'message' => 'Unauthorized'];
                }
                
                $requestData['requester_user_id'] = $userId;
            } else {
                // Extract request data from request body if it's an object
                $requestData = $request->getBody();
                
                // Set the requester user ID from the authenticated user
                $requestData['requester_user_id'] = $request->user['user_id'] ?? $_SERVER['AUTHENTICATED_USER_ID'];
            }
            
            // Original validation code starts here
            if (empty($requestData['amount']) || $requestData['amount'] <= 0) {
                return ['success' => false, 'message' => 'Invalid amount'];
            }

            if (empty($requestData['requested_ipa_address'])) {
                return ['success' => false, 'message' => 'Recipient IPA address is required'];
            }

            // Get user details for the requester
            $requesterId = $requestData['requester_user_id'];
            $requesterUser = $this->userModel->getUserById($requesterId);
            if (!$requesterUser) {
                return ['success' => false, 'message' => 'Requester user not found'];
            }

            // Get the requester's IPA address
            $requesterIpa = $this->ipaModel->getDefaultIPAByUserId($requesterId);
            if (!$requesterIpa) {
                return ['success' => false, 'message' => 'Requester does not have an IPA address'];
            }

            // Get the requested IPA details
            $requestedIpaAddress = $requestData['requested_ipa_address'];
            $requestedIpa = $this->ipaModel->getIPAByAddress($requestedIpaAddress);
            if (!$requestedIpa) {
                return ['success' => false, 'message' => 'Recipient IPA address not found'];
            }

            // Get user details for the requested user
            $requestedUserId = $requestedIpa['user_id'];
            $requestedUser = $this->userModel->getUserById($requestedUserId);
            if (!$requestedUser) {
                return ['success' => false, 'message' => 'Recipient user not found'];
            }

            // Cannot request money from yourself
            if ($requesterId == $requestedUserId) {
                return ['success' => false, 'message' => 'You cannot request money from yourself'];
            }

            // Create the money request
            $request = [
                'requester_user_id' => $requesterId,
                'requested_user_id' => $requestedUserId,
                'requester_name' => $requesterUser['first_name'] . ' ' . $requesterUser['last_name'],
                'requested_name' => $requestedUser['first_name'] . ' ' . $requestedUser['last_name'],
                'amount' => $requestData['amount'],
                'requester_ipa_address' => $requesterIpa['ipa_address'],
                'requested_ipa_address' => $requestedIpaAddress,
                'message' => $requestData['message'] ?? null
            ];

            $createdRequest = $this->moneyRequestModel->createRequest($request);
            if (!$createdRequest) {
                return ['success' => false, 'message' => 'Failed to create money request'];
            }

            // Send WebSocket notification to the requested user
            $this->notifyUser($requestedUserId, [
                'type' => 'money_request',
                'action' => 'new',
                'data' => $createdRequest
            ]);

            return ['success' => true, 'message' => 'Money request sent successfully', 'data' => $createdRequest];
        } catch (Exception $e) {
            error_log("Error in createRequest: " . $e->getMessage());
            return ['success' => false, 'message' => 'An error occurred while creating the money request'];
        }
    }

    /**
     * Get all pending money requests for a user
     * 
     * @param mixed $request The request object or array from the router
     * @return array
     */
    public function getPendingRequests($request) {
        try {
            // Get user ID from request or global variable
            $userId = null;
            
            if (is_array($request) && isset($request['user_id'])) {
                $userId = $request['user_id'];
            } else if (is_object($request) && isset($request->user['user_id'])) {
                $userId = $request->user['user_id'];
            } else {
                $userId = $_SERVER['AUTHENTICATED_USER_ID'] ?? null;
            }
            
            if (!$userId) {
                return ['success' => false, 'message' => 'Unauthorized'];
            }
            
            $requests = $this->moneyRequestModel->getPendingRequestsForUser($userId);
            return ['success' => true, 'data' => $requests];
        } catch (Exception $e) {
            error_log("Error in getPendingRequests: " . $e->getMessage());
            return ['success' => false, 'message' => 'An error occurred while fetching pending requests'];
        }
    }

    /**
     * Get all money requests for a user (both sent and received)
     * 
     * @param mixed $request The request object or array from the router
     * @return array
     */
    public function getAllRequests($request) {
        try {
            // Get user ID from request or global variable
            $userId = null;
            
            if (is_array($request) && isset($request['user_id'])) {
                $userId = $request['user_id'];
            } else if (is_object($request) && isset($request->user['user_id'])) {
                $userId = $request->user['user_id'];
            } else {
                $userId = $_SERVER['AUTHENTICATED_USER_ID'] ?? null;
            }
            
            if (!$userId) {
                return ['success' => false, 'message' => 'Unauthorized'];
            }
            
            $requests = $this->moneyRequestModel->getAllRequestsForUser($userId);
            return ['success' => true, 'data' => $requests];
        } catch (Exception $e) {
            error_log("Error in getAllRequests: " . $e->getMessage());
            return ['success' => false, 'message' => 'An error occurred while fetching all requests'];
        }
    }

    /**
     * Process a money request (accept or decline)
     * 
     * @param mixed $request The request object or array from the router
     * @return array
     */
    public function processRequest($request) {
        try {
            // Get parameters from request
            $requestId = null;
            $action = null;
            $userId = null;
            $pin = null;
            $senderIpaAddress = null;
            
            if (is_array($request)) {
                // Handle array request
                $requestId = $request['id'] ?? null;
                $action = $request['action'] ?? null;
                $userId = $_SERVER['AUTHENTICATED_USER_ID'] ?? null;
                $pin = $request['pin'] ?? null;
                $senderIpaAddress = $request['sender_ipa_address'] ?? null;
            } else if (is_string($request) && is_numeric($request)) {
                // Handle string request (request ID as string)
                $requestId = intval($request);
                // Attempt to get other parameters from POST data
                $postData = json_decode(file_get_contents('php://input'), true) ?: [];
                $action = $postData['action'] ?? null;
                $userId = $_SERVER['AUTHENTICATED_USER_ID'] ?? null;
                $pin = $postData['pin'] ?? null;
                $senderIpaAddress = $postData['sender_ipa_address'] ?? null;
            } else {
                // Handle object request
                $requestBody = $request->getBody();
                $requestId = $request->params['id'] ?? null;
                $action = $requestBody['action'] ?? null;
                $userId = $request->user['user_id'] ?? $_SERVER['AUTHENTICATED_USER_ID'] ?? null;
                $pin = $requestBody['pin'] ?? null;
                $senderIpaAddress = $requestBody['sender_ipa_address'] ?? null;
            }

            if (!$requestId || !$action || !$userId) {
                return ['success' => false, 'message' => 'Missing required parameters'];
            }

            // Convert request ID to integer if it's a string
            if (is_string($requestId)) {
                $requestId = intval($requestId);
            }

            // Get the money request
            $request = $this->moneyRequestModel->getRequestById($requestId);
            if (!$request) {
                return ['success' => false, 'message' => 'Money request not found'];
            }

            // Verify that the user is the recipient of the request
            if ($request['requested_user_id'] != $userId) {
                return ['success' => false, 'message' => 'You are not authorized to process this request'];
            }

            // Check if the request is still pending
            if ($request['status'] !== 'pending') {
                return ['success' => false, 'message' => 'This request has already been processed'];
            }

            if ($action === 'accept') {
                // If accepting the request, we need to verify the PIN and sender IPA address
                if (!$pin || !$senderIpaAddress) {
                    return ['success' => false, 'message' => 'PIN and sender IPA address are required to accept a request'];
                }
                
                // Verify the PIN for the sender's IPA address
                $ipaVerified = $this->ipaModel->verifyPin($senderIpaAddress, $pin);
                if (!$ipaVerified) {
                    return ['success' => false, 'message' => 'Invalid PIN'];
                }
                
                // Verify that the sender IPA belongs to the user
                $senderIpa = $this->ipaModel->getByIpaAddress($senderIpaAddress);
                if (!$senderIpa || $senderIpa['user_id'] != $userId) {
                    return ['success' => false, 'message' => 'The IPA address does not belong to you'];
                }
                
                // Create a transaction if the user accepts the request
                $transactionData = [
                    'sender_user_id' => $userId,
                    'receiver_user_id' => $request['requester_user_id'],
                    'sender_name' => $request['requested_name'],
                    'receiver_name' => $request['requester_name'],
                    'amount' => $request['amount'],
                    'sender_ipa_address' => $senderIpaAddress,
                    'receiver_ipa_address' => $request['requester_ipa_address'],
                    'transfer_method' => 'ipa',
                    'pin' => $pin // Pass the PIN for verification in the transaction
                ];
                
                // Process the transaction through the TransactionController
                $transactionController = new TransactionController();
                $transactionResult = $transactionController->processIpaTransfer($transactionData);

                if (!$transactionResult['success']) {
                    return ['success' => false, 'message' => $transactionResult['message']];
                }

                // Update the money request status to accepted and link it to the transaction
                $this->moneyRequestModel->updateRequestStatus($requestId, 'accepted', $transactionResult['data']['transaction_id']);

                // Notify the requester that the request was accepted
                $this->notifyUser($request['requester_user_id'], [
                    'type' => 'money_request',
                    'action' => 'accepted',
                    'data' => [
                        'request_id' => $requestId,
                        'transaction' => $transactionResult['data']
                    ]
                ]);

                return [
                    'success' => true, 
                    'message' => 'Money request accepted and payment processed', 
                    'data' => [
                        'request' => $request,
                        'transaction' => $transactionResult['data']
                    ]
                ];
            } else if ($action === 'decline') {
                // Update the money request status to declined
                $this->moneyRequestModel->updateRequestStatus($requestId, 'declined');

                // Notify the requester that the request was declined
                $this->notifyUser($request['requester_user_id'], [
                    'type' => 'money_request',
                    'action' => 'declined',
                    'data' => [
                        'request_id' => $requestId
                    ]
                ]);

                return ['success' => true, 'message' => 'Money request declined', 'data' => $request];
            } else {
                return ['success' => false, 'message' => 'Invalid action'];
            }
        } catch (Exception $e) {
            error_log("Error in processRequest: " . $e->getMessage());
            return ['success' => false, 'message' => 'An error occurred while processing the money request'];
        }
    }

    /**
     * Get a money request by ID
     * 
     * @param mixed $request The request object or array from the router
     * @return array
     */
    public function getRequestById($request) {
        try {
            // Get request ID from request
            $requestId = null;
            
            if (is_array($request)) {
                $requestId = $request['id'] ?? null;
            } else {
                $requestId = $request->params['id'] ?? null;
            }
            
            if (!$requestId) {
                return ['success' => false, 'message' => 'Missing request ID'];
            }
            
            $moneyRequest = $this->moneyRequestModel->getRequestById($requestId);
            if (!$moneyRequest) {
                return ['success' => false, 'message' => 'Money request not found'];
            }
            return ['success' => true, 'data' => $moneyRequest];
        } catch (Exception $e) {
            error_log("Error in getRequestById: " . $e->getMessage());
            return ['success' => false, 'message' => 'An error occurred while fetching the money request'];
        }
    }

    /**
     * Send a WebSocket notification to a user
     * 
     * @param int $userId
     * @param array $data
     * @return void
     */
    private function notifyUser($userId, $data) {
        $pushEndpoint = $_ENV['PUSH_ENDPOINT'] ?? 'http://localhost:4101/push';
        
        // Add the user ID to the notification data
        $notificationData = array_merge(['to' => $userId], $data);
        
        // Send the notification via the WebSocket server's HTTP push endpoint
        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => $pushEndpoint,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($notificationData),
            CURLOPT_HTTPHEADER => ['Content-Type: application/json']
        ]);
        
        $response = curl_exec($curl);
        $error = curl_error($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);
        
        if ($httpCode !== 200 || $error) {
            error_log("Error sending WebSocket notification: $error, HTTP code: $httpCode, Response: $response");
        }
    }
} 