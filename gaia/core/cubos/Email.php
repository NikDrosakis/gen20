<?php
namespace Core\Cubos;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

/**
 * Email cubo — mail relay through the local postfix MTA.
 *
 * Serves the MOON "mail" cubo (contact form):
 *   POST /api/v1/local/sendMail
 *
 * Sender is derived per-domain (noreply@<domain>) so each site signs with its
 * own DKIM/SPF. Recipient is resolved via mailRecipient():
 *   - gen20 family (gen20.net/.gr/.dev/.art, genia20.gr) + anticultura.com
 *     + poetabook.com                                  -> info@gen20.net
 *   - directorsunion.gr                                -> directorscreatorsunion@gmail.com
 *   - nikimourtzi.com                                  -> nikimourtzi23@gmail.com
 *   - everything else                                  -> info@<domain>
 * Overridable via env: MAIL_FROM / MAIL_TO / MAIL_DOMAIN
 *
 * Delivery is handled by postfix (sendmail), so routing/auth/DKIM live in the
 * MTA config rather than in this trait.
 */
trait Email {

    protected function sendMail(array $data): array {
        $name    = trim($data['name'] ?? '');
        $email   = trim($data['email'] ?? '');
        $website = trim($data['website'] ?? '');
        $comment  = trim($data['comment'] ?? '');
        $subject  = trim($data['subject'] ?? '');
        $fromName = trim($data['fromName'] ?? '');

        if ($email === '' || $comment === '') {
            return [
                'success' => false,
                'error'   => 'Missing required fields: email and comment',
            ];
        }

        $domain = $_SERVER['SERVER_NAME'] ?? (getenv('MAIL_DOMAIN') ?: 'gen20.net');
        $domain = preg_replace('/^www\./', '', strtolower(trim($domain)));

        $from = getenv('MAIL_FROM') ?: ('noreply@' . $domain);
        $to   = getenv('MAIL_TO')   ?: $this->mailRecipient($domain);

        $mail = new PHPMailer(true);

        try {
            $mail->isSendmail(); // local postfix
            $mail->CharSet = PHPMailer::CHARSET_UTF8;
            $mail->setFrom($from, $fromName !== '' ? $fromName : 'GEN20');
            $mail->addAddress($to);
            $mail->addReplyTo($email, $name);

            $mail->isHTML(false);
            $mail->Subject = $subject !== '' ? $subject : "New message from {$name}";
            $mail->Body    = "Name: {$name}\n"
                           . "Email: {$email}\n"
                           . "Website: {$website}\n\n"
                           . $comment;

            $mail->send();

            return [
                'success' => true,
                'message' => 'Email sent',
            ];
        } catch (Exception $e) {
            error_log("Email cubo error: {$mail->ErrorInfo}");
            return [
                'success' => false,
                'error'   => $mail->ErrorInfo,
            ];
        }
    }

    /**
     * Resolve the recipient mailbox for a given site domain.
     */
    protected function mailRecipient(string $domain): string {
        $toGen20Net = [
            'gen20.net', 'gen20.gr', 'gen20.dev', 'gen20.art', 'genia20.gr',
            'anticultura.com', 'poetabook.com',
        ];
        if (in_array($domain, $toGen20Net, true)) {
            return 'info@gen20.net';
        }

        $overrides = [
            'directorsunion.gr' => 'directorscreatorsunion@gmail.com',
            'nikimourtzi.com'   => 'nikimourtzi23@gmail.com',
        ];
        if (isset($overrides[$domain])) {
            return $overrides[$domain];
        }

        return 'info@' . $domain;
    }
}
