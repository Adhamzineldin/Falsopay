<?php

namespace App\services;

use App\models\Bank;
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
        $shortRefId = substr($transactionId, 0, 8);

        // Format currency values
        $formattedAmount = number_format($transactionData['amount'], 2);
        $formattedSenderBalance = number_format($senderNewBalance, 2);
        $formattedReceiverBalance = number_format($receiverNewBalance, 2);

        // Determine transaction purpose/description
        $purpose = $transactionData['description'] ?? '';
        if (empty($purpose)) {
            if ($transactionData['amount'] <= 20) {
                $purpose = "small payment";
            } elseif ($transactionData['amount'] >= 1000) {
                $purpose = "large payment";
            } else {
                $purpose = "payment";
            }
        }

        // Enhanced payment method determination
        $senderMethod = self::getEnhancedMethodDetails($transactionData, true);
        $receiverMethod = self::getEnhancedMethodDetails($transactionData, false);

        // Bank names (if we have bank_id, we could look these up)
        $senderBank = self::getBankName($transactionData['sender_bank_id'] ?? null);
        $receiverBank = self::getBankName($transactionData['receiver_bank_id'] ?? null);

        // Create enhanced replacements with more information
        $senderReplacements = [
            '{{FIRST_NAME}}' => $senderUser['first_name'],
            '{{LAST_NAME}}' => $senderUser['last_name'],
            '{{FULL_NAME}}' => $senderUser['first_name'] . ' ' . $senderUser['last_name'],
            '{{AMOUNT}}' => $formattedAmount,
            '{{RECIPIENT_NAME}}' => $receiverUser['first_name'] . ' ' . $receiverUser['last_name'],
            '{{TRANSACTION_ID}}' => $transactionId,
            '{{SHORT_REFERENCE}}' => $shortRefId,
            '{{DATE_TIME}}' => $currentDate,
            '{{PAYMENT_METHOD}}' => $senderMethod,
            '{{TRANSFER_METHOD_TYPE}}' => strtoupper($transactionData['transfer_method'] ?? 'transfer'),
            '{{PURPOSE}}' => $purpose,
            '{{BALANCE}}' => $formattedSenderBalance,
            '{{YEAR}}' => $currentYear,
            '{{SENDER_BANK}}' => $senderBank,
            '{{RECEIVER_BANK}}' => $receiverBank,
            '{{TRANSACTION_TYPE}}' => 'SENT',
            '{{TRANSACTION_VERB}}' => 'sent',
            '{{TRANSACTION_STATUS}}' => 'Successful',
        ];

        $receiverReplacements = [
            '{{FIRST_NAME}}' => $receiverUser['first_name'],
            '{{LAST_NAME}}' => $receiverUser['last_name'],
            '{{FULL_NAME}}' => $receiverUser['first_name'] . ' ' . $receiverUser['last_name'],
            '{{AMOUNT}}' => $formattedAmount,
            '{{SENDER_NAME}}' => $senderUser['first_name'] . ' ' . $senderUser['last_name'],
            '{{TRANSACTION_ID}}' => $transactionId,
            '{{SHORT_REFERENCE}}' => $shortRefId,
            '{{DATE_TIME}}' => $currentDate,
            '{{PAYMENT_METHOD}}' => $receiverMethod,
            '{{TRANSFER_METHOD_TYPE}}' => strtoupper($transactionData['transfer_method'] ?? 'transfer'),
            '{{PURPOSE}}' => $purpose,
            '{{BALANCE}}' => $formattedReceiverBalance,
            '{{YEAR}}' => $currentYear,
            '{{SENDER_BANK}}' => $senderBank,
            '{{RECEIVER_BANK}}' => $receiverBank,
            '{{TRANSACTION_TYPE}}' => 'RECEIVED',
            '{{TRANSACTION_VERB}}' => 'received',
            '{{TRANSACTION_STATUS}}' => 'Completed',
        ];

        // Add security tips based on transaction type
        $securityTips = self::getSecurityTips($transactionData);
        $senderReplacements['{{SECURITY_TIPS}}'] = $securityTips;
        $receiverReplacements['{{SECURITY_TIPS}}'] = $securityTips;

        // Add promotional content based on transaction behavior
        $senderReplacements['{{PROMO_CONTENT}}'] = self::getPromoContent($transactionData, $senderUser, true);
        $receiverReplacements['{{PROMO_CONTENT}}'] = self::getPromoContent($transactionData, $receiverUser, false);

        try {
            // Get templates with better subject lines
            $senderTemplate = self::getTemplate('transaction-sender-template.html');
            $senderContent = self::replaceTemplateVariables($senderTemplate, $senderReplacements);
            $senderSubject = "Payment Confirmation: EGP {$formattedAmount} to {$receiverUser['first_name']} - Ref #{$shortRefId}";
            self::sendEmail($senderUser['email'], $senderSubject, $senderContent);

            // Log success but don't echo in production
            error_log("Transaction notification sent to {$senderUser['email']}");
        } catch (Exception $e) {
            error_log("Error sending email to sender: {$e->getMessage()}");
        }

        try {
            $receiverTemplate = self::getTemplate('transaction-receiver-template.html');
            $receiverContent = self::replaceTemplateVariables($receiverTemplate, $receiverReplacements);
            $receiverSubject = "Payment Received: EGP {$formattedAmount} from {$senderUser['first_name']} - Ref #{$shortRefId}";
            self::sendEmail($receiverUser['email'], $receiverSubject, $receiverContent);

            // Log success but don't echo in production
            error_log("Transaction notification sent to {$receiverUser['email']}");
        } catch (Exception $e) {
            error_log("Error sending email to receiver: {$e->getMessage()}");
        }
    }

    /**
     * Get enhanced payment method details with better descriptions
     */
    private static function getEnhancedMethodDetails($transactionData, $isSender): string
    {
        $method = $transactionData['transfer_method'] ?? 'unknown';

        switch ($method) {
            case 'mobile':
                $phoneNumber = $transactionData['receiver_phone'] ?? null;
                if ($phoneNumber) {
                    // Mask mobile number for privacy
                    $maskedPhone = substr($phoneNumber, 0, 4) . '••••' . substr($phoneNumber, -2);
                    return $isSender ? "to mobile number {$maskedPhone}" : "via your registered mobile";
                }
                return $isSender ? "to mobile number" : "via mobile";

            case 'ipa':
                $ipaAddress = $isSender ?
                    ($transactionData['receiver_ipa_address'] ?? null) :
                    ($transactionData['sender_ipa_address'] ?? null);

                if ($ipaAddress) {
                    // Create a safer IPA display format
                    $displayIpa = explode('@', $ipaAddress);
                    if (count($displayIpa) > 1) {
                        $maskedUsername = substr($displayIpa[0], 0, 2) . '••••' . substr($displayIpa[0], -2);
                        $safeIpa = $maskedUsername . '@' . $displayIpa[1];
                        return ($isSender ? "to" : "via") . " IPA address {$safeIpa}";
                    }
                    return ($isSender ? "to" : "via") . " IPA address {$ipaAddress}";
                }
                return ($isSender ? "to" : "via") . " IPA address";

            case 'iban':
                $iban = $transactionData['receiver_iban'] ?? null;
                if ($iban) {
                    // Show only first 2 and last 4 of IBAN
                    $countryCode = substr($iban, 0, 2);
                    $lastFour = substr($iban, -4);
                    $maskedIban = $countryCode . '••••••••' . $lastFour;
                    return $isSender ? "to IBAN {$maskedIban}" : "to your IBAN account";
                }
                return $isSender ? "to IBAN account" : "to your IBAN account";

            case 'card':
                $cardNumber = $transactionData['receiver_card'] ?? null;
                if ($cardNumber) {
                    $lastFour = substr($cardNumber, -4);
                    return $isSender ? "to card ending in {$lastFour}" : "to your card ending in {$lastFour}";
                }
                return $isSender ? "to card account" : "to your card";

            case 'account':
                $accountNumber = $isSender ?
                    ($transactionData['receiver_account_number'] ?? null) :
                    ($transactionData['sender_account_number'] ?? null);

                if ($accountNumber) {
                    $lastFour = substr($accountNumber, -4);
                    $bankId = $isSender ?
                        ($transactionData['receiver_bank_id'] ?? null) :
                        ($transactionData['sender_bank_id'] ?? null);
                    $bankInfo = $bankId ? " at " . self::getBankName($bankId) : "";

                    return ($isSender ? "to" : "from") . " account ending in {$lastFour}{$bankInfo}";
                }
                return ($isSender ? "to" : "from") . " bank account";

            default:
                return "via direct transfer";
        }
    }

    /**
     * Get bank name from bank ID (mock function - would connect to a database)
     */
    private static function getBankName($bankId): string
    {
        if (!$bankId) return "Unknown Bank";

        $bank = new Bank();
        $bankDetails = $bank->getBankById($bankId);
        echo $bankDetails;
        if ($bankDetails) {
            return $bankDetails['name'] ?? "Unknown Bank";
        }
        return "Unknown Bank";
    }

    /**
     * Get security tips based on transaction details
     */
    private static function getSecurityTips($transactionData): string
    {
        $tips = [];

        // Add tips based on amount
        if ($transactionData['amount'] >= 1000) {
            $tips[] = "For large transactions, always verify the recipient's details before sending.";
        }

        // Add tips based on method
        switch ($transactionData['transfer_method'] ?? '') {
            case 'mobile':
                $tips[] = "Always verify the mobile number before sending money.";
                break;
            case 'ipa':
                $tips[] = "IPA addresses are case-sensitive. Double-check before confirming transfers.";
                break;
            case 'card':
                $tips[] = "Never share your full card details with anyone, even if they claim to be from your bank.";
                break;
        }

        // Add general tip
        $tips[] = "Keep your PIN confidential and change it regularly for better security.";

        return implode(" ", $tips);
    }

    /**
     * Get promotional content based on user behavior
     */
    private static function getPromoContent($transactionData, $user, $isSender): string
    {
        // Determine if user is eligible for any promotions
        if ($isSender) {
            if ($transactionData['amount'] >= 5000) {
                return "Thank you for your high-value transaction! Enjoy a 1% cashback on your next transaction above EGP 5000.";
            } elseif ($transactionData['transfer_method'] === 'mobile') {
                return "Try our IPA transfer method next time for faster processing and better security.";
            }
        } else {
            if ($transactionData['transfer_method'] === 'mobile') {
                return "Set up your IPA address now to receive future payments even faster!";
            }
        }

        return ""; // No promo content
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