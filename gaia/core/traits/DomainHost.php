<?php
namespace Core\Traits;
use Exception;

trait DomainHost {
    /**
     * Nginx Host configuration with support for both PHP and ReactJS templates
     */
protected function addHost($params): array {
    // Handle array parameter
    if (is_array($params)) {
        $domainName = $params['domain'] ?? $params[0] ?? null;
        $appType = $params['appType'] ?? $params['type'] ?? 'vite';
    } else {
        $domainName = $params;
        $appType = 'vite';
    }

    $domain = $domainName ?: DOMAIN;

    if (!$domain) {
        return ['success' => false, 'error' => 'Domain parameter required'];
    }

    // Configuration file in conf.d (auto-loaded)
    $configFile = "/etc/nginx/conf.d/{$domain}.conf";

    // Generate configuration based on app type
    switch ($appType) {
        case 'php':
            $configContent = $this->genPhpConf($domain);
            break;
        case 'vite':
            $configContent = $this->genReactConf($domain);
            break;
        default:
            return ['success' => false, 'error' => "Unsupported application type: {$appType}"];
    }

    // Write configuration file
    if (file_put_contents($configFile, $configContent) === false) {
        return ['success' => false, 'error' => 'Failed to write config file'];
    }

    // Test nginx configuration
    exec('nginx -t 2>&1', $testOutput, $testCode);
    if ($testCode !== 0) {
        // Rollback - delete the bad config
        unlink($configFile);
        return [
            'success' => false,
            'error' => 'Nginx config test failed',
            'output' => implode("\n", $testOutput)
        ];
    }

    // Reload nginx
    exec('systemctl reload nginx 2>&1', $reloadOutput, $reloadCode);

    if ($reloadCode !== 0) {
        return [
            'success' => false,
            'error' => 'Failed to reload nginx',
            'output' => implode("\n", $reloadOutput)
        ];
    }

    return [
        'success' => true,
        'message' => "✅ Nginx host configuration created for {$domain} ({$appType})",
        'config_file' => $configFile
    ];
}

    protected function genPhpConf(string $domain): string {
        $rootPath = GSROOT."gaia/public/$domain";
        $logPath = GSROOT."log/$domain.log";
        $phpSock = $this->detectPhpSock();

        return <<<EOF
Host {
    listen 443 ssl;
    http2 on;
    Host_name $domain www.$domain;
    ssl_certificate /etc/letsencrypt/live/$domain/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$domain/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    error_log $logPath;

    include /var/www/gs/setup/nginx/gen_shared.conf;

    location = /favicon.ico {
        log_not_found off;
        access_log off;
        try_files /favicon.ico =204;
    }

    location / {
        root $rootPath;
        index index.php index.html;

        # Static files location
        location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
            root $rootPath;
            try_files \$uri =404;
            expires 30d;
            access_log off;
        }

        # CORS setup
        if (\$request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header X-Frame-Options "";
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Origin, Authorization, Accept, Content-Type, X-Requested-With';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
            return 204;
        }

        location ~ \.php$ {
            fastcgi_pass unix:$phpSock;
            fastcgi_param SCRIPT_FILENAME \$request_filename;
            set \$public_dir "{$domain}";
            fastcgi_param SYSTEM \$public_dir;
            include /etc/nginx/fastcgi_params;
        }

        try_files \$uri \$uri/ /index.php?page=404;
        error_page 500 /index.php?page=500;

        # Rewrite rules
        rewrite ^/([a-z0-9_]+)/?\$ /index.php?page=\$1&id=\$2 last;
        rewrite ^/([a-z0-9_]+)/([a-z.0-9_]+)/?\$ /index.php?page=\$1&id=\$2&action=\$3 last;
        rewrite ^/([a-z0-9_]+)/([a-z.0-9_]+)/([a-z.0-9_]+)/?\$ /index.php?page=\$1&id=\$2&action=\$3 last;
    }

    # Custom header for debugging
    add_header X-Gaia-System SYSTEM;
}

# HTTP redirect to HTTPS
Host {
    listen 80;
    Host_name $domain www.$domain;
    return 301 https://\$host\$request_uri;
}
EOF;
    }

    protected function genReactConf($domain): string {
        $rootPath = "/var/www/gs/public/{$domain}/dist";
        $logPath = "/var/www/gs/log/{$domain}.log";

        return <<<EOF
    server {
        server_name {$domain} www.{$domain};
        listen 443 ssl http2;
        ssl_certificate /etc/letsencrypt/live/{$domain}/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/{$domain}/privkey.pem;
        include /etc/letsencrypt/options-ssl-nginx.conf;
        ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

        root {$rootPath};
        index index.html;
        access_log off;
        error_log {$logPath};

        include /var/www/gs/setup/nginx/gen_shared.conf;

        # Add HSTS header
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        location = /favicon.ico {
            log_not_found off;
            access_log off;
            try_files /favicon.ico =204;
        }

        location / {
            try_files \$uri \$uri/ /index.html;

            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
        }

        # Static files caching
        location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|webp)$ {
            expires 30d;
            access_log off;
            add_header Cache-Control "public, immutable";
        }

        # Custom header for debugging
        add_header X-Gaia-System "GEN20";
    }

    # HTTP redirect to HTTPS
    server {
        listen 80;
        server_name {$domain} www.{$domain};
        return 301 https://\$host\$request_uri;
    }
    EOF;
    }

    protected function detectPhpSock(): string {
        // Check for common PHP-FPM socket locations
        $versions = ['8.3', '8.2', '8.1', '8.0', '7.4'];

        foreach ($versions as $version) {
            $sock = "/run/php/php{$version}-fpm.sock";
            if (file_exists($sock)) {
                return $sock;
            }
        }

        throw new Exception("❌ No PHP-FPM socket found");
    }

protected function delHost($params): array {
    // Handle array parameter
    if (is_array($params)) {
        $domainName = $params['domain'] ?? $params[0] ?? null;
    } else {
        $domainName = $params;
    }

    $domain = $domainName ?: DOMAIN;

    if (!$domain) {
        return ['success' => false, 'error' => 'Domain parameter required'];
    }

    // Remove config from sites-available
    $configFile = "/etc/nginx/conf.d/{$domain}";
    if (file_exists($configFile)) {
        unlink($configFile);
    }

    // Test and reload nginx
    exec('nginx -t 2>&1', $testOutput, $testCode);
    if ($testCode === 0) {
        exec('systemctl reload nginx 2>&1');
    }

    return [
        'success' => true,
        'message' => "✅ Nginx host configuration removed for {$domain}"
    ];
}

    protected function checkfixHost(string $domainName = '', string $appType = 'php'): array {
        $domain = $domainName ?: DOMAIN;
        $issues = [];
        $fixed = [];

        // Check nginx is running
        $nginxStatus = shell_exec('systemctl is-active nginx');
        if (trim($nginxStatus) !== 'active') {
            throw new Exception("❌ Nginx service is not active");
        }

        // Check config exists
        $config = "/etc/nginx/sites-available/$domain";
        if (!file_exists($config)) {
            $this->addHost($domain, $appType);
            $fixed[] = "Created missing nginx configuration";
        }

        // Check symlink exists
        $enabled = "/etc/nginx/sites-enabled/$domain";
        if (!file_exists($enabled)) {
            symlink($config, $enabled);
            $fixed[] = "Created missing nginx symlink";
            shell_exec('systemctl reload nginx');
        }

        // Verify configuration matches expected template
        $currentConfig = file_get_contents($config);
        $expectedConfig = $appType === 'php'
            ? $this->genPhpConf($domain)
            : $this->genReactConf($domain);

        if ($currentConfig !== $expectedConfig) {
            file_put_contents($config, $expectedConfig);
            $fixed[] = "Updated outdated nginx configuration";
            shell_exec('systemctl reload nginx');
        }

        return [
            'status' => 'success',
            'message' => "✅ Host check completed for $domain ($appType)",
            'issues' => $issues,
            'fixed' => $fixed
        ];
    }
}