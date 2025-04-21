<?php

namespace App\services;


require_once __DIR__ . '/../../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Dotenv\Dotenv;

class EmailService
{
    public static function sendTransactionNotification($transactionData, $senderUser, $receiverUser, $transactionId, $senderNewBalance, $receiverNewBalance)
    {
        // Helper function to determine the method of transaction
        function getMethodDetails($transactionData, $isSender = true) {
            if ($isSender) {
                if ($transactionData['phone_number_used']) {
                    return "to phone number {$transactionData['phone_number']}.";
                } elseif ($transactionData['card_number_used']) {
                    return "to card number ending in " . substr($transactionData['card_number'], -4) . ".";
                } elseif ($transactionData['iban_used']) {
                    return "to IBAN {$transactionData['iban']}.";
                } elseif ($transactionData['sender_account_number']) {
                    return "to account number {$transactionData['sender_account_number']}.";
                }
            } else {
                if ($transactionData['phone_number_used']) {
                    return "to your phone number {$transactionData['phone_number']}.";
                } elseif ($transactionData['card_number_used']) {
                    return "to your card number ending in " . substr($transactionData['card_number'], -4) . ".";
                } elseif ($transactionData['iban_used']) {
                    return "to your IBAN {$transactionData['iban']}.";
                } elseif ($transactionData['receiver_account_number']) {
                    return "to your account number {$transactionData['receiver_account_number']}.";
                }
            }
            return ''; // Default return if no method is matched
        }

        // Format currency with commas for better readability
        $formattedAmount = number_format($transactionData['amount'], 2);
        $formattedBalance = number_format($senderNewBalance, 2);
        $currentDate = date("F j, Y, g:i a");

        // Prepare the email content for transaction notification
        $subject = "Transaction Notification";
        $htmlContent = "
            <!DOCTYPE html>
            <html lang='en'>
            <head>
                <meta charset='UTF-8'>
                <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                <title>Transaction Notification</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
                    
                    body {
                        font-family: 'Poppins', Arial, sans-serif;
                        background-color: #f9f9f9;
                        margin: 0;
                        padding: 0;
                        color: #333333;
                        line-height: 1.6;
                    }
                    
                    .email-wrapper {
                        max-width: 600px;
                        margin: 20px auto;
                        background-color: #ffffff;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    }
                    
                    .email-header {
                        background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
                        padding: 30px;
                        text-align: center;
                    }
                    
                    .email-header h1 {
                        color: #ffffff;
                        margin: 0;
                        font-weight: 600;
                        font-size: 24px;
                        letter-spacing: 0.5px;
                    }
                    
                    .email-body {
                        padding: 35px;
                    }
                    
                    .greeting {
                        font-size: 18px;
                        margin-bottom: 25px;
                        color: #333333;
                    }
                    
                    .transaction-details {
                        background-color: #f8f9fa;
                        border-radius: 10px;
                        padding: 25px;
                        margin-bottom: 30px;
                        border-left: 4px solid #1e3c72;
                    }
                    
                    .transaction-amount {
                        font-size: 22px;
                        font-weight: 600;
                        color: #1e3c72;
                        margin-bottom: 15px;
                    }
                    
                    .recipient-name {
                        color: #2a5298;
                        font-weight: 500;
                    }
                    
                    .transaction-info {
                        margin-top: 20px;
                    }
                    
                    .transaction-info p {
                        margin: 8px 0;
                        display: flex;
                        justify-content: space-between;
                    }
                    
                    .transaction-info .label {
                        color: #6c757d;
                        font-weight: 500;
                        min-width: 150px;
                    }
                    
                    .transaction-info .value {
                        font-weight: 500;
                        color: #333333;
                        text-align: right;
                    }
                    
                    .balance-update {
                        background-color: #eef5ff;
                        border-radius: 10px;
                        padding: 20px;
                        margin-bottom: 30px;
                        text-align: center;
                    }
                    
                    .balance-amount {
                        font-size: 24px;
                        font-weight: 600;
                        color: #1e3c72;
                    }
                    
                    .footer {
                        background-color: #f8f9fa;
                        padding: 25px;
                        text-align: center;
                        font-size: 14px;
                        color: #6c757d;
                        border-top: 1px solid #eeeeee;
                    }
                    
                    .security-notice {
                        background-color: #fff8e1;
                        border-radius: 8px;
                        padding: 15px;
                        margin-top: 20px;
                        font-size: 13px;
                        line-height: 1.5;
                        color: #856404;
                    }
                    
                    @media only screen and (max-width: 600px) {
                        .email-wrapper {
                            border-radius: 0;
                            margin: 0;
                        }
                        
                        .email-body {
                            padding: 20px;
                        }
                        
                        .transaction-info p {
                            flex-direction: column;
                            margin: 15px 0;
                        }
                        
                        .transaction-info .value {
                            text-align: left;
                        }
                    }
                </style>
            </head>
            <body>
                <div class='email-wrapper'>
                    <div class='email-header'>
                        <h1>Transaction Confirmation</h1>
                    </div>
                    
                    <div class='email-body'>
                        <div class='greeting'>
                            Hello <strong>{$senderUser['first_name']} {$senderUser['last_name']}</strong>,
                        </div>
                        
                        <div class='transaction-details'>
                            <div class='transaction-amount'>
                                EGP {$formattedAmount} sent successfully
                            </div>
                            
                            <p>Your payment to <span class='recipient-name'>{$receiverUser['first_name']} {$receiverUser['last_name']}</span> has been completed.</p>
                            
                            <div class='transaction-info'>
                                <p>
                                    <span class='label'>Transaction ID:</span>
                                    <span class='value'>{$transactionId}</span>
                                </p>
                                <p>
                                    <span class='label'>Date & Time:</span>
                                    <span class='value'>{$currentDate}</span>
                                </p>
                                <p>
                                    <span class='label'>Payment Method:</span>
                                    <span class='value'>" . getMethodDetails($transactionData, true) . "</span>
                                </p>
                            </div>
                        </div>
                        
                        <div class='balance-update'>
                            <p>Your account balance has been updated</p>
                            <div class='balance-amount'>EGP {$formattedBalance}</div>
                        </div>
                        
                        <div class='security-notice'>
                            <strong>Important:</strong> If you did not initiate this transaction, please contact our support team immediately. For security purposes, don't share your transaction details with anyone.
                        </div>
                    </div>
                    
                    <div class='footer'>
                        <p>Thank you for using our service.</p>
                        <p>&copy; " . date("Y") . " | This is an automated message. Please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
        ";

        // Prepare recipient's email with their perspective
        $recipientHtmlContent = "
            <!DOCTYPE html>
            <html lang='en'>
            <head>
                <meta charset='UTF-8'>
                <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                <title>Payment Received</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
                    
                    body {
                        font-family: 'Poppins', Arial, sans-serif;
                        background-color: #f9f9f9;
                        margin: 0;
                        padding: 0;
                        color: #333333;
                        line-height: 1.6;
                    }
                    
                    .email-wrapper {
                        max-width: 600px;
                        margin: 20px auto;
                        background-color: #ffffff;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    }
                    
                    .email-header {
                        background: linear-gradient(135deg, #2e7d32 0%, #43a047 100%);
                        padding: 30px;
                        text-align: center;
                    }
                    
                    .email-header h1 {
                        color: #ffffff;
                        margin: 0;
                        font-weight: 600;
                        font-size: 24px;
                        letter-spacing: 0.5px;
                    }
                    
                    .email-body {
                        padding: 35px;
                    }
                    
                    .greeting {
                        font-size: 18px;
                        margin-bottom: 25px;
                        color: #333333;
                    }
                    
                    .transaction-details {
                        background-color: #f8f9fa;
                        border-radius: 10px;
                        padding: 25px;
                        margin-bottom: 30px;
                        border-left: 4px solid #2e7d32;
                    }
                    
                    .transaction-amount {
                        font-size: 22px;
                        font-weight: 600;
                        color: #2e7d32;
                        margin-bottom: 15px;
                    }
                    
                    .sender-name {
                        color: #43a047;
                        font-weight: 500;
                    }
                    
                    .transaction-info {
                        margin-top: 20px;
                    }
                    
                    .transaction-info p {
                        margin: 8px 0;
                        display: flex;
                        justify-content: space-between;
                    }
                    
                    .transaction-info .label {
                        color: #6c757d;
                        font-weight: 500;
                        min-width: 150px;
                    }
                    
                    .transaction-info .value {
                        font-weight: 500;
                        color: #333333;
                        text-align: right;
                    }
                    
                    .balance-update {
                        background-color: #eef9ee;
                        border-radius: 10px;
                        padding: 20px;
                        margin-bottom: 30px;
                        text-align: center;
                    }
                    
                    .balance-amount {
                        font-size: 24px;
                        font-weight: 600;
                        color: #2e7d32;
                    }
                    
                    .footer {
                        background-color: #f8f9fa;
                        padding: 25px;
                        text-align: center;
                        font-size: 14px;
                        color: #6c757d;
                        border-top: 1px solid #eeeeee;
                    }
                    
                    @media only screen and (max-width: 600px) {
                        .email-wrapper {
                            border-radius: 0;
                            margin: 0;
                        }
                        
                        .email-body {
                            padding: 20px;
                        }
                        
                        .transaction-info p {
                            flex-direction: column;
                            margin: 15px 0;
                        }
                        
                        .transaction-info .value {
                            text-align: left;
                        }
                    }
                </style>
            </head>
            <body>
                <div class='email-wrapper'>
                    <div class='email-header'>
                        <h1>Payment Received</h1>
                    </div>
                    
                    <div class='email-body'>
                        <div class='greeting'>
                            Hello <strong>{$receiverUser['first_name']} {$receiverUser['last_name']}</strong>,
                        </div>
                        
                        <div class='transaction-details'>
                            <div class='transaction-amount'>
                                EGP {$formattedAmount} received
                            </div>
                            
                            <p>You've received a payment from <span class='sender-name'>{$senderUser['first_name']} {$senderUser['last_name']}</span>.</p>
                            
                            <div class='transaction-info'>
                                <p>
                                    <span class='label'>Transaction ID:</span>
                                    <span class='value'>{$transactionId}</span>
                                </p>
                                <p>
                                    <span class='label'>Date & Time:</span>
                                    <span class='value'>{$currentDate}</span>
                                </p>
                                <p>
                                    <span class='label'>Received via:</span>
                                    <span class='value'>" . getMethodDetails($transactionData, false) . "</span>
                                </p>
                            </div>
                        </div>
                        
                        <div class='balance-update'>
                            <p>Your account balance has been updated</p>
                            <div class='balance-amount'>EGP " . number_format($receiverNewBalance, 2) . "</div>
                        </div>
                    </div>
                    
                    <div class='footer'>
                        <p>Thank you for using our service.</p>
                        <p>&copy; " . date("Y") . " | This is an automated message. Please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
        ";

        // Send email to sender
        try {
            self::sendEmail($senderUser['email'], $subject, $htmlContent);
            echo "Transaction notification sent to {$senderUser['email']}.";
        } catch (Exception $e) {
            echo "Error sending email: {$e->getMessage()}";
        }

        // Send email to receiver with their perspective
        try {
            $receiverSubject = "Payment Received";
            self::sendEmail($receiverUser['email'], $receiverSubject, $recipientHtmlContent);
            echo "Transaction notification sent to {$receiverUser['email']}.";
        } catch (Exception $e) {
            echo "Error sending email: {$e->getMessage()}";
        }
    }

    // Function to send emails
    private static function sendEmail($recipientEmail, $subject, $htmlContent)
    {
        // Create a new PHPMailer instance
        $mail = new PHPMailer(true);

        // Load environment variables
        $dotenv = Dotenv::createImmutable(__DIR__ . '/../../');
        $dotenv->load();

        // Server settings
        $mail->isSMTP();
        $mail->Host = $_ENV['SMTP_HOST'];
        $mail->SMTPAuth = true;
        $mail->Username = $_ENV['SMTP_USERNAME'];
        $mail->Password = $_ENV['SMTP_PASSWORD'];
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

        // Recipients
        $mail->setFrom($_ENV['SMTP_FROM_EMAIL'], $_ENV['SMTP_FROM_NAME']);
        $mail->addAddress($recipientEmail);

        // Content
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = $htmlContent;

        // Send the email
        $mail->send();
    }

    // Function to send a verification code email
    public static function sendVerificationCode($recipientEmail, $verificationCode)
    {
        // Format the verification code with spaces for better readability
        $formattedCode = chunk_split($verificationCode, 1, ' ');
        $currentDate = date("F j, Y, g:i a");

        // Prepare the email content for verification
        $subject = "Your Verification Code";
        $htmlContent = "
            <!DOCTYPE html>
            <html lang='en'>
            <head>
                <meta charset='UTF-8'>
                <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                <title>Verification Code</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
                    
                    body {
                        font-family: 'Poppins', Arial, sans-serif;
                        background-color: #f9f9f9;
                        margin: 0;
                        padding: 0;
                        color: #333333;
                        line-height: 1.6;
                    }
                    
                    .email-wrapper {
                        max-width: 600px;
                        margin: 20px auto;
                        background-color: #ffffff;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    }
                    
                    .email-header {
                        background: linear-gradient(135deg, #5b247a 0%, #7b2f99 100%);
                        padding: 30px;
                        text-align: center;
                    }
                    
                    .email-header h1 {
                        color: #ffffff;
                        margin: 0;
                        font-weight: 600;
                        font-size: 24px;
                        letter-spacing: 0.5px;
                    }
                    
                    .email-body {
                        padding: 35px;
                        text-align: center;
                    }
                    
                    .greeting {
                        font-size: 18px;
                        margin-bottom: 25px;
                        color: #333333;
                        text-align: left;
                    }
                    
                    .code-container {
                        background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
                        border-radius: 10px;
                        padding: 30px 20px;
                        margin: 30px 0;
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                    }
                    
                    .code-title {
                        font-size: 16px;
                        color: #5b247a;
                        margin-bottom: 15px;
                        font-weight: 500;
                    }
                    
                    .verification-code {
                        font-family: 'Courier New', monospace;
                        font-size: 32px;
                        font-weight: 700;
                        letter-spacing: 8px;
                        color: #5b247a;
                        padding: 15px 25px;
                        background-color: #ffffff;
                        border-radius: 8px;
                        display: inline-block;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
                        margin: 10px 0;
                    }
                    
                    .code-expires {
                        font-size: 14px;
                        color: #6c757d;
                        margin-top: 15px;
                    }
                    
                    .instructions {
                        text-align: left;
                        margin: 30px 0;
                        font-size: 15px;
                        color: #4a4a4a;
                    }
                    
                    .security-notice {
                        background-color: #fff8e1;
                        border-radius: 8px;
                        padding: 15px;
                        margin-top: 20px;
                        font-size: 13px;
                        line-height: 1.5;
                        color: #856404;
                        text-align: left;
                    }
                    
                    .footer {
                        background-color: #f8f9fa;
                        padding: 25px;
                        text-align: center;
                        font-size: 14px;
                        color: #6c757d;
                        border-top: 1px solid #eeeeee;
                    }
                    
                    @media only screen and (max-width: 600px) {
                        .email-wrapper {
                            border-radius: 0;
                            margin: 0;
                        }
                        
                        .email-body {
                            padding: 20px;
                        }
                        
                        .verification-code {
                            font-size: 24px;
                            letter-spacing: 5px;
                            padding: 12px 15px;
                        }
                    }
                </style>
            </head>
            <body>
                <div class='email-wrapper'>
                    <div class='email-header'>
                        <h1>Verification Required</h1>
                    </div>
                    
                    <div class='email-body'>
                        <div class='greeting'>
                            Hello,
                        </div>
                        
                        <p>Thank you for using our service. To continue, please verify your identity with the following code:</p>
                        
                        <div class='code-container'>
                            <div class='code-title'>Your verification code is:</div>
                            <div class='verification-code'>{$verificationCode}</div>
                            <div class='code-expires'>This code will expire in 10 minutes</div>
                        </div>
                        
                        <div class='instructions'>
                            <p>To complete the verification process:</p>
                            <ol>
                                <li>Return to the application or website where you requested this code</li>
                                <li>Enter the verification code shown above</li>
                                <li>Click on the 'Verify' or 'Submit' button to proceed</li>
                            </ol>
                        </div>
                        
                        <div class='security-notice'>
                            <strong>Security Notice:</strong> If you did not request this code, please ignore this email or contact our support team immediately. Never share this code with anyone, including our staff.
                        </div>
                    </div>
                    
                    <div class='footer'>
                        <p>Email sent on {$currentDate}</p>
                        <p>&copy; " . date("Y") . " | This is an automated message. Please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
        ";

        // Send email to recipient
        try {
            self::sendEmail($recipientEmail, $subject, $htmlContent);
            echo "Verification code sent to {$recipientEmail}.";
        } catch (Exception $e) {
            echo "Error sending email: {$e->getMessage()}";
        }
    }
}