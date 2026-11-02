<?php
namespace Core\Traits;

use Exception;

trait Domain {
    /**
     * Domain management.
     *
     * NOTE: Host / Zone / SSL έχουν μεταφερθεί στον god API.
     * Το παρόν trait κρατάει μόνο:
     * - Filesystem listing
     * - Nginx listing (fallback — κανονικά από god)
     * - SSL listing (fallback — κανονικά από god)
     * - Zones listing (fallback — κανονικά από god)
     * - Sync (μέσω god endpoints)
     * - Backups (mariadump, domainBackup, sysBackup)
     */

    protected $domain;
    protected $connection;
    protected $os;

    // ============================================================
    // Sync
    // ============================================================

    /**
     * Synchronizes a single domain's records with the actual system state.
     * Uses god API for authoritative lists (fs, nginx, zones, ssl).
     */
    protected function syncDom(string $domainName): array
    {
        $report = [];

        // Fetch από god (fallback σε local methods)
        $fileSystemDomains = $this->fetchFilesystemList();
        $activeNginxDomains = array_flip($this->fetchNginxList());
        $dnsZones = array_flip($this->fetchZonesList());
        $sslCertificates = $this->fetchSSLList();

        $fsysExists = isset($fileSystemDomains[$domainName]);
        $nginxExists = isset($activeNginxDomains[$domainName]);
        $dnsExists = isset($dnsZones[$domainName]);
        $sslExists = isset($sslCertificates[$domainName]);

        $domainReport = [
            'name' => $domainName,
            'discrepancies' => [],
        ];

        if (!$fsysExists) $domainReport['discrepancies'][] = 'File system directory is missing.';
        if (!$nginxExists) $domainReport['discrepancies'][] = 'Nginx configuration is missing.';
        if (!$dnsExists) $domainReport['discrepancies'][] = 'DNS zone file is missing.';
        if (!$sslExists) {
            $domainReport['discrepancies'][] = 'SSL certificate is missing.';
        } elseif (isset($sslCertificates[$domainName]['expires'])) {
            $domainReport['ssl_expires'] = $sslCertificates[$domainName]['expires'];
        }

        if (!empty($domainReport['discrepancies'])) {
            $report[] = $domainReport;
        }

        // Update gen_admin.domain
        $dbDomains = $this->db->fa("SELECT * FROM gen_admin.domain WHERE name = ?", [$domainName]);

        if (empty($dbDomains)) {
            $this->db->q("INSERT INTO gen_admin.domain (name) VALUES (?)", [$domainName]);
        } else {
            $this->db->q(
                "UPDATE gen_admin.domain SET fsys_check = ?, nginx_check = ?, zone_check = ?, ssl_check = ? WHERE name = ?",
                [
                    (int)$fsysExists,
                    (int)$nginxExists,
                    (int)$dnsExists,
                    (int)$sslExists,
                    $domainName
                ]
            );
        }

        return $report;
    }

    /**
     * Synchronizes all domains.
     */
    protected function synchronizeDomains(): array
    {
        $report = [];

        $fileSystemDomains = $this->fetchFilesystemList();
        $activeNginxDomains = array_flip($this->fetchNginxList());
        $dnsZones = array_flip($this->fetchZonesList());
        $sslCertificates = $this->fetchSSLList();

        $dbDomains = $this->db->fa("SELECT * FROM gen_admin.domain");
        $dbDomainMap = [];
        foreach ($dbDomains as $dbDomain) {
            $dbDomainMap[$dbDomain['name']] = $dbDomain;
        }

        $allDomains = array_unique(array_merge(
            array_keys($fileSystemDomains),
            array_keys($activeNginxDomains),
            array_keys($dnsZones),
            array_keys($sslCertificates)
        ));

        $insertValues = [];
        $updateValues = [];

        foreach ($allDomains as $domainName) {
            $fsysExists = isset($fileSystemDomains[$domainName]);
            $nginxExists = isset($activeNginxDomains[$domainName]);
            $dnsExists = isset($dnsZones[$domainName]);
            $sslExists = isset($sslCertificates[$domainName]);

            $domainReport = [
                'name' => $domainName,
                'discrepancies' => [],
            ];

            if (!$fsysExists) $domainReport['discrepancies'][] = 'File system directory is missing.';
            if (!$nginxExists) $domainReport['discrepancies'][] = 'Nginx configuration is missing.';
            if (!$dnsExists) $domainReport['discrepancies'][] = 'DNS zone file is missing.';
            if (!$sslExists) {
                $domainReport['discrepancies'][] = 'SSL certificate is missing.';
            } elseif (isset($sslCertificates[$domainName]['expires'])) {
                $domainReport['ssl_expires'] = $sslCertificates[$domainName]['expires'];
            }

            if (!empty($domainReport['discrepancies'])) {
                $report[] = $domainReport;
            }

            if (!isset($dbDomainMap[$domainName])) {
                $insertValues[] = "('" . $this->db->escape($domainName) . "')";
            } else {
                $updateValues[] = [
                    'fsys_check' => (int)$fsysExists,
                    'nginx_check' => (int)$nginxExists,
                    'zone_check' => (int)$dnsExists,
                    'ssl_check' => (int)$sslExists,
                    'name' => $domainName,
                ];
            }
        }

        if (!empty($insertValues)) {
            $this->db->q("INSERT INTO gen_admin.domain (name) VALUES " . implode(',', $insertValues));
        }

        foreach ($updateValues as $values) {
            $this->db->q(
                "UPDATE gen_admin.domain SET fsys_check = ?, nginx_check = ?, zone_check = ?, ssl_check = ? WHERE name = ?",
                [$values['fsys_check'], $values['nginx_check'], $values['zone_check'], $values['ssl_check'], $values['name']]
            );
        }

        return $report;
    }

    // ============================================================
    // Data fetchers — god API πρώτα, fallback σε filesystem
    // ============================================================

    /**
     * Fetch domain list from god API (or fallback to filesystem).
     */
    protected function fetchFilesystemList(): array
    {
        // Δοκίμασε god
        $god = $this->callGod('/god/v1/fs/list');
        if ($god && !empty($god['success']) && isset($god['data']['directories'])) {
            $result = [];
            foreach ($god['data']['directories'] as $name => $info) {
                $result[$name] = is_array($info) ? ($info['path'] ?? "/var/www/gs/public/$name") : "/var/www/gs/public/$name";
            }
            return $result;
        }
        // Fallback
        return $this->getPublicFilesystem();
    }

    /**
     * Fetch nginx hosts from god (or fallback to filesystem).
     */
    protected function fetchNginxList(): array
    {
        $god = $this->callGod('/god/v1/hosts/list');
        if ($god && !empty($god['success']) && isset($god['data']['hosts'])) {
            return array_map(fn($h) => $h['domain'], $god['data']['hosts']);
        }
        return $this->getPublicNginx();
    }

    /**
     * Fetch DNS zones from god (or fallback to filesystem).
     */
    protected function fetchZonesList(): array
    {
        $god = $this->callGod('/god/v1/bind/list');
        if ($god && !empty($god['success']) && isset($god['data']['zones'])) {
            return array_map(fn($z) => $z['domain'], $god['data']['zones']);
        }
        return $this->getZones();
    }

    /**
     * Fetch SSL certs from god (or fallback to filesystem).
     */
    protected function fetchSSLList(): array
    {
        $god = $this->callGod('/god/v1/ssl/list');
        if ($god && !empty($god['success']) && isset($god['data'])) {
            return $god['data'];
        }
        return $this->getSSLs();
    }

    /**
     * Simple HTTP call to god API.
     */
    protected function callGod(string $path): ?array
    {
        $url = 'http://127.0.0.1:3008' . $path;
        $ctx = stream_context_create([
            'http' => [
                'timeout' => 5,
                'ignore_errors' => true,
            ],
        ]);
        $response = @file_get_contents($url, false, $ctx);
        if ($response === false) return null;
        $decoded = json_decode($response, true);
        return is_array($decoded) ? $decoded : null;
    }

    // ============================================================
    // Filesystem
    // ============================================================

    protected function getPublicFilesystem(): array
    {
        $baseDir = '/var/www/gs/public/';
        $domains = [];

        if (is_dir($baseDir)) {
            $directories = array_filter(glob($baseDir . '*', GLOB_ONLYDIR), 'is_dir');
            foreach ($directories as $directory) {
                $domainName = basename($directory);
                $domains[$domainName] = $directory;
            }
        } else {
            error_log("Base directory does not exist: $baseDir");
        }

        return $domains;
    }

    // ============================================================
    // Nginx (fallback)
    // ============================================================

    protected function getPublicNginx(): array
    {
        $nginxSitesAvailablePath = '/etc/nginx/conf.d';
        $domains = [];
        if (is_dir($nginxSitesAvailablePath)) {
            $files = scandir($nginxSitesAvailablePath);
            foreach ($files as $file) {
                if ($file !== '.' && $file !== '..') {
                    $domains[] = pathinfo($file, PATHINFO_FILENAME);
                }
            }
        } else {
            throw new Exception("Nginx sites-available directory does not exist at $nginxSitesAvailablePath");
        }
        return $domains;
    }

    // ============================================================
    // Zones (fallback)
    // ============================================================

    protected function getZones(): array
    {
        $directory = '/etc/bind/zones/';
        $zones = glob($directory . '*');
        return $zones;
    }

    // ============================================================
    // SSL (fallback)
    // ============================================================

    protected function getSSLs(): array
    {
        $sslInfo = [];
        $liveDir = '/etc/letsencrypt/live/';

        if (!is_dir($liveDir)) {
            return ['error' => "SSL directory not found: $liveDir"];
        }

        $certDirs = glob($liveDir . '*', GLOB_ONLYDIR) ?: [];

        foreach ($certDirs as $certDir) {
            $domain = basename($certDir);
            if (in_array($domain, ['.', '..', 'README'], true)) continue;

            $certPath = $certDir . '/fullchain.pem';
            $privKeyPath = $certDir . '/privkey.pem';
            $hasFullchain = file_exists($certPath);
            $hasPrivkey = file_exists($privKeyPath);

            if (!$hasFullchain || !$hasPrivkey) {
                $sslInfo[$domain] = [
                    'exists' => false,
                    'error' => 'Missing certificate files',
                ];
                continue;
            }

            $expiryDate = null;
            $issuer = null;

            try {
                $certContent = file_get_contents($certPath);
                if ($certContent !== false) {
                    $parsed = openssl_x509_parse($certContent);
                    if ($parsed !== false) {
                        $expiryTs = $parsed['validTo_time_t'] ?? null;
                        if ($expiryTs) {
                            $expiryDate = date('Y-m-d H:i:s', $expiryTs);
                        }
                        $issuer = $parsed['issuer']['O'] ?? ($parsed['issuer']['CN'] ?? null);
                    }
                }
            } catch (Exception $e) {
                error_log("SSL parse error for $domain: " . $e->getMessage());
            }

            $daysValid = null;
            if ($expiryDate) {
                $expiryTs = strtotime($expiryDate);
                if ($expiryTs) {
                    $daysValid = (int)floor(($expiryTs - time()) / 86400);
                }
            }

            $sslInfo[$domain] = [
                'exists' => true,
                'expires' => $expiryDate,
                'days_valid' => $daysValid,
                'issuer' => $issuer,
                'certificate_path' => $certPath,
                'private_key_path' => $privKeyPath,
            ];
        }

        return $sslInfo;
    }

    // ============================================================
    // Backups (αν χρησιμοποιείς — αλλιώς σβήσε τα)
    // ============================================================

    protected function mariadump($domainame, $replica, $type = 'dom')
    {
        $host = $this->CONF[$domainame]['dbhost'];
        $db = $this->CONF[$domainame]['dbname'];
        $dbuser = $this->CONF[$domainame]['dbuser'];
        $dbpass = $this->CONF[$domainame]['dbpass'];

        $dump = $type == 'dom'
            ? $this->BACKUP_DIR . $type . "/sql/" . $db . "-" . $replica . ".sql"
            : $this->BACKUP_DIR . $type . "/sql/gs-" . $replica . ".sql";

        if ($type == 'dom') {
            $dump = "mariadb-dump --user=$dbuser --password=$dbpass --host=$host $db > $dump";
        } else {
            $dump = "mariadb-dump --no-data --user=$dbuser --password=$dbpass --host=$host $db > $dump";
        }

        @exec($dump);
        @chmod($dump, 0777);
    }

    protected function domainBackup($domainame, $replica, $log)
    {
        $domainbase = explode('.', $domainame)[0];
        $dom_folder = $this->BACKUP_DIR . "dom/" . $domainbase . "-" . $replica;

        if (!file_exists("$dom_folder.tar.gz")) {
            mkdir($dom_folder);
            chmod($dom_folder, 0777);

            write_onfile($this->BACKUP_DIR . "dom/log/updatelog-" . $domainbase . "-" . $replica . ".md", $log);

            $this->mariadump($domainame, $replica);

            recurse_copy(SERVERBASE . $domainame . "/", $dom_folder);
            xrmdir($dom_folder . '/gaia');

            $drepo = new PharData("$dom_folder.tar");
            $drepo->buildFromDirectory($dom_folder);
            $drepo->compress(Phar::GZ);

            system("chmod -R 777 $dom_folder");
            system("chmod -R 777 $dom_folder.tar");
            unlink("$dom_folder.tar");
            xrmdir($dom_folder);
            system("chmod -R 777 $dom_folder.tar.gz");

            $updateVersion = $this->db->q("UPDATE gen_admin.globs SET val=? WHERE name=?", array($replica, 'domain-version'));
            if (!$updateVersion) {
                return $this->error[2];
            } else {
                return 'yes';
            }
        } else {
            return $this->error[1];
        }
    }

    protected function sysBackup($domainame, $replica, $log)
    {
        $sys_folder = BACKUP_DIR . 'gaia/' . $replica;
        if (!file_exists("$sys_folder.tar.gz")) {
            mkdir($sys_folder);
            chmod($sys_folder, 0777);

            write_onfile(BACKUP_DIR . "gaia/log/updatelog-sys-" . $replica . ".md", $log);

            $this->mariadump($domainame, $replica, 'gaia');

            recurse_copy(SERVERBASE . $domainame . '/', $sys_folder);

            $srepo = new PharData("$sys_folder.tar");
            $srepo->buildFromDirectory($sys_folder);
            $srepo->compress(Phar::GZ);

            system("chmod -R 777 $sys_folder");
            system("chmod -R 777 $sys_folder.tar");
            unlink("$sys_folder.tar");
            xrmdir($sys_folder);
            system("chmod -R 777 $sys_folder.tar.gz");

            $updateVersion = $this->db($domainame)->q("UPDATE varglobal SET value=? WHERE name=?", array($replica, 'system-version'));
            if (!$updateVersion) {
                return $this->error[2];
            } else {
                return 'yes';
            }
        } else {
            return $this->error[1];
        }
    }
}