<?php

namespace App\services;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Dotenv\Dotenv;

require_once __DIR__ . '/../../vendor/autoload.php';

class EmailService
{
    // Define the template directory path
    private static string $templateDir = __DIR__ . '/../../resources/templates/';

    /**
     * Send transaction notification emails to both sender and receiver
     *
     * @param array $transactionData Transaction details
     * @param array $senderUser Sender user details
     * @param array $receiverUser Receiver user details
     * @param string $transactionId Unique transaction ID
     * @param float $senderNewBalance Sender's new balance after transaction
     * @param float $receiverNewBalance Receiver's new balance after transaction
     * @return void
     */
    public static function sendTransactionNotification($transactionData, $senderUser, $receiverUser, $transactionId, $senderNewBalance, $receiverNewBalance)
    {
        date_default_timezone_set('Africa/Cairo');
        $currentDate = date("F j, Y, g:i a");
        $currentYear = date("Y");

        $formattedAmount = number_format($transactionData['amount'], 2);
        $formattedSenderBalance = number_format($senderNewBalance, 2);
        $formattedReceiverBalance = number_format($receiverNewBalance, 2);

        // Infer method details from schema-compliant fields
        $senderPaymentMethod = $transactionData['sender_ipa_address'] ?? $transactionData['sender_account_number'] ?? 'Unknown';
        $receiverPaymentMethod = match ($transactionData['transfer_method']) {
            'mobile' => isset($transactionData['receiver_phone'])
                ? "via mobile number " . $transactionData['receiver_phone'] 
                : "via mobile number",

            'card' => isset($transactionData['receiver_card'])
                ? "to card ending in " . substr($transactionData['receiver_card'], -4)
                : "to a card",

            'iban' => isset($transactionData['receiver_iban'])
                ? "through IBAN " . $transactionData['receiver_iban'] 
                : "through IBAN",

            'ipa' => isset($transactionData['receiver_ipa_address'])
                ? "using IPA address " . $transactionData['receiver_ipa_address']
                : "via IPA address",

            'account' => isset($transactionData['receiver_account_number'])
                ? "to account number ending in " . $transactionData['receiver_account_number']
                : "to a bank account",

            default => "via unknown method"
        };


        $senderReplacements = [
            '{{FIRST_NAME}}'     => $senderUser['first_name'],
            '{{LAST_NAME}}'      => $senderUser['last_name'],
            '{{AMOUNT}}'         => $formattedAmount,
            '{{RECIPIENT_NAME}}' => $receiverUser['first_name'] . ' ' . $receiverUser['last_name'],
            '{{TRANSACTION_ID}}' => $transactionId,
            '{{DATE_TIME}}'      => $currentDate,
            '{{PAYMENT_METHOD}}' => $senderPaymentMethod,
            '{{BALANCE}}'        => $formattedSenderBalance,
            '{{YEAR}}'           => $currentYear
        ];

        $receiverReplacements = [
            '{{FIRST_NAME}}'     => $receiverUser['first_name'],
            '{{LAST_NAME}}'      => $receiverUser['last_name'],
            '{{AMOUNT}}'         => $formattedAmount,
            '{{SENDER_NAME}}'    => $senderUser['first_name'] . ' ' . $senderUser['last_name'],
            '{{TRANSACTION_ID}}' => $transactionId,
            '{{DATE_TIME}}'      => $currentDate,
            '{{PAYMENT_METHOD}}' => $receiverPaymentMethod,
            '{{BALANCE}}'        => $formattedReceiverBalance,
            '{{YEAR}}'           => $currentYear
        ];

        try {
            $senderTemplate = self::getTemplate('transaction-sender-template.html');
            $senderContent = self::replaceTemplateVariables($senderTemplate, $senderReplacements);
            self::sendEmail($senderUser['email'], "Transaction Confirmation", $senderContent);
            echo "Transaction notification sent to {$senderUser['email']}.\n";
        } catch (Exception $e) {
            echo "Error sending email to sender: {$e->getMessage()}\n";
        }

        try {
            $receiverTemplate = self::getTemplate('transaction-receiver-template.html');
            $receiverContent = self::replaceTemplateVariables($receiverTemplate, $receiverReplacements);
            self::sendEmail($receiverUser['email'], "Payment Received", $receiverContent);
            echo "Transaction notification sent to {$receiverUser['email']}.\n";
        } catch (Exception $e) {
            echo "Error sending email to receiver: {$e->getMessage()}\n";
        }
    }


    /**
     * Helper function to determine the method of transaction
     *
     * @param array $transactionData Transaction details
     * @param bool $isSender Whether the method is for sender (true) or receiver (false)
     * @return string Description of payment method
     */
    private static function getMethodDetails($transactionData, $isSender = true)
    {
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

    /**
     * Send a verification code email
     *
     * @param string $recipientEmail Email address of recipient
     * @param string $verificationCode The verification code to send
     * @return void
     */
    public static function sendVerificationCode($recipientEmail, $verificationCode)
    {
        // Get current date and time
        $currentDate = date("F j, Y, g:i a");
        $currentYear = date("Y");

        // Prepare replacements for verification email template
        $replacements = [
            '{{VERIFICATION_CODE}}' => $verificationCode,
            '{{DATE_TIME}}' => $currentDate,
            '{{YEAR}}' => $currentYear
        ];

        // Send verification email
        try {
            $template = self::getTemplate('verification-code-template.html');
            $content = self::replaceTemplateVariables($template, $replacements);
            self::sendEmail($recipientEmail, "Your Verification Code", $content);
            echo "Verification code sent to {$recipientEmail}.\n";
        } catch (Exception $e) {
            echo "Error sending verification email: {$e->getMessage()}\n";
        }
    }

    /**
     * Read a template file from the template directory
     *
     * @param string $templateName Name of the template file
     * @return string Content of the template file
     * @throws Exception If template file is not found
     */
    private static function getTemplate($templateName)
    {
        $templatePath = self::$templateDir . $templateName;

        if (!file_exists($templatePath)) {
            throw new Exception("Email template file not found: {$templatePath}");
        }

        return file_get_contents($templatePath);
    }

    /**
     * Replace placeholder variables in a template with actual values
     *
     * @param string $template Template content with placeholders
     * @param array $replacements Key-value pairs of placeholders and their replacements
     * @return string Processed template with replaced values
     */
    private static function replaceTemplateVariables($template, $replacements)
    {
        return str_replace(array_keys($replacements), array_values($replacements), $template);
    }

    /**
     * Send an email using PHPMailer
     *
     * @param string $recipientEmail Recipient's email address
     * @param string $subject Email subject
     * @param string $htmlContent HTML content of the email
     * @return void
     */
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
        $mail->Body = $htmlContent;

        // Send the email
        $mail->send();
    }
}