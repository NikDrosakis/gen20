<?php
namespace Core;
use Exception;

trait DomainSSL {
    /**
     * SSL certificate management with Let's Encrypt
     */
    protected function addSSL(string $domainName = '', array $options = []): array {
        $domain = $domainName ?: DOMAIN;
        $webrootPath = $options['webroot'] ?? "/var/www/gs/gaia/public/$domain";
        $email = $options['email'] ?? "admin@$domain";
        $staging = $options['staging'] ?? false;

        // Validate domain filesystem exists
        if (!file_exists($webrootPath)) {
            throw new Exception("❌ Webroot path $webrootPath does not exist");
        }

        // Prepare certbot command
        $stagingFlag = $staging ? '--test-cert' : '';
        $command = "certbot certonly --webroot -w $webrootPath " .
                   "-d $domain -d www.$domain " .
                   "--non-interactive --agree-tos --email $email " .
                   "--keep-until-expiring $stagingFlag " .
                   "2>&1";

        // Execute certbot
        $output = shell_exec($command);

        if (strpos($output, 'Congratulations') === false &&
            strpos($output, 'not due for renewal') === false &&
            strpos($output, 'already exists') === false) {
            throw new Exception("❌ Failed to obtain SSL certificate for $domain: " . $output);
        }

        // Verify certificate files
        $certPath = "/etc/letsencrypt/live/$domain";
        if (!file_exists("$certPath/fullchain.pem") ||
            !file_exists("$certPath/privkey.pem")) {
            throw new Exception("❌ Certificate files not found in $certPath");
        }

        return [
            'status' => 'success',
            'message' => "✅ SSL certificate obtained for $domain",
            'cert_path' => $certPath,
            'expires' => $this->getCertExpiry($domain),
            'output' => $output
        ];
    }

    protected function renewSSL(string $domainName = ''): array {
        $domain = $domainName ?: DOMAIN;

        // Check if certificate exists
        $certPath = "/etc/letsencrypt/live/$domain";
        if (!file_exists("$certPath/fullchain.pem")) {
            throw new Exception("❌ No SSL certificate found for $domain");
        }

        // Execute certbot renewal
        $command = "certbot renew --cert-name $domain --non-interactive --quiet 2>&1";
        $output = shell_exec($command);

        if (strpos($output, 'not due for renewal') === false &&
            strpos($output, 'No renewals were attempted') === false &&
            strpos($output, 'Congratulations') === false) {
            throw new Exception("❌ Failed to renew SSL certificate for $domain: " . $output);
        }

        return [
            'status' => 'success',
            'message' => "✅ SSL certificate renewed for $domain",
            'cert_path' => $certPath,
            'expires' => $this->getCertExpiry($domain),
            'output' => $output
        ];
    }

    protected function delSSL(string $domainName = ''): array {
        $domain = $domainName ?: DOMAIN;

        // Run certbot to revoke and delete
        $command = "certbot delete --cert-name $domain --non-interactive 2>&1";
        $output = shell_exec($command);

        if (strpos($output, 'Deleted') === false) {
            throw new Exception("❌ Failed to delete SSL certificate for $domain: " . $output);
        }

        // Verify certificate files are removed
        $certPath = "/etc/letsencrypt/live/$domain";
        if (file_exists($certPath)) {
            throw new Exception("❌ Certificate files still exist in $certPath");
        }

        return [
            'status' => 'success',
            'message' => "✅ SSL certificate removed for $domain",
            'output' => $output
        ];
    }

    protected function checkfixSSL(string $domainName = ''): array {
        $domain = $domainName ?: DOMAIN;
        $issues = [];
        $fixed = [];

        // Check certificate exists
        $certPath = "/etc/letsencrypt/live/$domain";
        if (!file_exists("$certPath/fullchain.pem")) {
            $this->addSSL($domain);
            $fixed[] = "Created missing SSL certificate";
        } else {
            // Check expiration (renew if less than 30 days)
            $expiry = $this->getCertExpiry($domain);
            if ($expiry < time() + (30 * 24 * 60 * 60)) {
                $this->renewSSL($domain);
                $fixed[] = "Renewed expiring SSL certificate";
            }

            // Verify symlinks
            $this->fixCertSymlinks($domain);
        }

        return [
            'status' => 'success',
            'message' => "✅ SSL check completed for $domain",
            'expires' => date('Y-m-d H:i:s', $this->getCertExpiry($domain)),
            'issues' => $issues,
            'fixed' => $fixed
        ];
    }

    protected function getCertExpiry(string $domain): int {
        $certFile = "/etc/letsencrypt/live/$domain/fullchain.pem";
        if (!file_exists($certFile)) {
            throw new Exception("❌ Certificate file not found: $certFile");
        }

        $output = shell_exec("openssl x509 -enddate -noout -in $certFile");
        if (preg_match('/notAfter=(.+)$/', $output, $matches)) {
            return strtotime($matches[1]);
        }

        throw new Exception("❌ Failed to parse certificate expiry date");
    }

    protected function fixCertSymlinks(string $domain): void {
        $livePath = "/etc/letsencrypt/live/$domain";
        $archivePath = "/etc/letsencrypt/archive/$domain";

        if (!file_exists($livePath)) {
            throw new Exception("❌ Live certificate path not found: $livePath");
        }

        // Check and fix each required symlink
        $files = ['cert.pem', 'chain.pem', 'fullchain.pem', 'privkey.pem'];
        foreach ($files as $file) {
            $link = "$livePath/$file";
            $target = "../../archive/$domain/$file";

            if (!file_exists($link) || readlink($link) !== $target) {
                if (file_exists($link)) {
                    unlink($link);
                }
                symlink($target, $link);
            }
        }
    }

    protected function setupCertbot(): array {
        // Install certbot if not exists
        if (!file_exists('/usr/bin/certbot')) {
            $output = shell_exec('apt-get update && apt-get install -y certbot python3-certbot-nginx 2>&1');
            if (!file_exists('/usr/bin/certbot')) {
                throw new Exception("❌ Failed to install certbot: " . $output);
            }

            return [
                'status' => 'success',
                'message' => '✅ Certbot installed successfully',
                'output' => $output
            ];
        }

        return [
            'status' => 'success',
            'message' => '✅ Certbot is already installed'
        ];
    }
}