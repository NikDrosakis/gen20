<?php
namespace Core\Traits;

use Exception;

trait DomainSSL {


    /**
     * SSL certificate management with Let's Encrypt
     */
    protected function addSSL($domainName = '', array $options = []): array {
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

/**
 * Renew SSL certificate management with Let's Encrypt
 */
    protected function renewSSL($domainName = ''): array {
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

/**
 * Del SSL certificate management with Let's Encrypt
 */
protected function delSSL($params = ''): array {
    // Fix: If $domainName is an array, extract the first element
    if (is_array($params)) {
        $domainName = $params['key'];
    }else{
    $domainName=$params;
    }
    // Validate domain name to prevent command injection
    if (!preg_match('/^[a-z0-9\.\-]+$/i', $domainName)) {
        throw new Exception("Invalid domain name: $domainName");
    }

    // Check if certificate exists
    $certPath = "/etc/letsencrypt/live/$domain";
    if (!file_exists($certPath)) {
        throw new Exception("No SSL certificate found for $domainName");
    }

    // Run certbot to revoke and delete
    $command = "sudo certbot delete --cert-name $domainName --non-interactive 2>&1";
    $output = shell_exec($command);

    // Also remove the directory from live and archive if certbot didn't
    if (file_exists($certPath)) {
        $rmCommand = "sudo rm -rf $certPath";
        shell_exec($rmCommand);
    }

    // Remove from archive as well
    $archivePath = "/etc/letsencrypt/archive/$domainName";
    if (file_exists($archivePath)) {
        $rmArchiveCommand = "sudo rm -rf $archivePath";
        shell_exec($rmArchiveCommand);
    }

    // Remove renewal configuration
    $renewalPath = "/etc/letsencrypt/renewal/$domainName.conf";
    if (file_exists($renewalPath)) {
        $rmRenewalCommand = "sudo rm -f $renewalPath";
        shell_exec($rmRenewalCommand);
    }

    if (strpos($output, 'Deleted') === false && strpos($output, 'successfully deleted') === false) {
        // Even if certbot failed, if we manually removed files, consider it success
        if (!file_exists($certPath) && !file_exists($archivePath)) {
            return [
                'status' => 'success',
                'message' => "✅ SSL certificate manually removed for $domainName",
                'output' => $output,
                'note' => 'Certbot may have failed but files were removed'
            ];
        }
        throw new Exception("❌ Failed to delete SSL certificate for $domainName: " . $output);
    }

    // Verify certificate files are completely removed
    if (file_exists($certPath)) {
        // Force remove if still exists
        shell_exec("sudo rm -rf $certPath");
    }

    // Reload nginx to apply changes
    shell_exec("sudo systemctl reload nginx");

    return [
        'status' => 'success',
        'message' => "✅ SSL certificate removed for $domainName",
        'output' => $output,
        'paths_cleaned' => [
            'live' => $certPath,
            'archive' => $archivePath,
            'renewal' => $renewalPath
        ]
    ];
}
/**
 * Check and fix SSL certificate management with Let's Encrypt
 */
    protected function checkfixSSL($domainName = ''): array {
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

/**
 * Get SSL certificate expiry date with Let's Encrypt
 */
    protected function getCertExpiry($domain): int {
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

/**
 * Fix SSL certificate symbolic links with Let's Encrypt
 */
    protected function fixCertSymlinks($domain): void {
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

/**
 * setup Certbot SSL certificate management with Let's Encrypt
 */
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