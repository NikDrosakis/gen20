<?php
namespace Core\Traits;

// Load PHPMailer via Composer or manually
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

trait Mail {

    /**
     * Send email using Gmail SMTP
     *
     * @param string $recipientEmail
     * @param string $subject
     * @param string $messageBody
     * @return bool
     */
    protected function sendEmail($params) {
       $recipientEmail = $params['recipientEmail'] ?? '';
       $subject = $params['subject'] ?? '';
       $messageBody = $params['messageBody'] ?? '';
        $mail = new PHPMailer(true);
  // Check if all required fields are present
    if (empty($recipientEmail) || empty($subject) || empty($messageBody)) {
        error_log("Missing required email parameters");
        return false;
    }
        try {
            // Server settings
            $mail->SMTPDebug = SMTP::DEBUG_SERVER;                      // Disable debug output
            $mail->isSMTP();                                         // Send using SMTP
            $mail->Host       = 'smtp.gmail.com';                    // Gmail's SMTP server
            $mail->SMTPAuth   = true;                                // Enable authentication
            $mail->Username   = 'nikosdrosakis@gmail.com';           // Your Gmail address
            // ⚠️ IMPORTANT: You MUST use an App Password, not your regular Gmail password
            // Generate at: https://myaccount.google.com/apppasswords
            $mail->Password   = 'fvbttilpnhzohmfy';        // REPLACE THIS!
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;         // SSL encryption
            $mail->Port       = 465;                                 // TCP port

            // Recipients
            $mail->setFrom('nikosdrosakis@gmail.com', 'NikiMourtzi.com');
            $mail->addAddress($recipientEmail);                      // Add recipient
            $mail->addReplyTo('nikosdrosakis@gmail.com', 'Niki Mourtzi');

            // Content
            $mail->isHTML(true);                                     // HTML format
            $mail->Subject = $subject;
            $mail->Body    = $messageBody;
            $mail->AltBody = strip_tags($messageBody);               // Plain text fallback

            $mail->send();
            return true;

        } catch (Exception $e) {
            // Log the error for debugging
            error_log("Message could not be sent. Mailer Error: {$mail->ErrorInfo}");
            return false;
        }
    }
}