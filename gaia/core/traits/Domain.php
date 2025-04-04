<?php
namespace Core\Traits;
use Exception;
use DateTime;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

trait Domain {
/**
aka Dom
DOC
===
6 steps of creation Domain edited in /admin/developer/domain?id=11 with sql-centered command in COMMENT load-createSSL
1) trait DomainZone
2) ssl
3) trait DomainFS gs/gaia/public/[domain] fs
4) trait DomainServer nginx
5) maria gen_[domain]
+
6) PUBLIC basic template
after the five redirect to
/developer/globs?mode=setup to add basis data

*/
protected $domain;
protected $connection;
protected $os;
  protected $vhostfile;
  protected $hostfile;

/**
 Looping all traits with add* methods to add a new domain
 */
 protected function addDomain($domain) {
        $components = ["Zone", "SSL", "DB", "Host","FS"];
        $commands = array_map(fn($x) => "gen gaia add$x $domain", $components);
        $cmd = implode(" && ", $commands); // Chain commands
        shell_exec($cmd);
    }

/**
 Looping all traits with del* methods to remove a domain
 */
protected function delDomain($domain) {
        $components = ["Zone", "SSL", "DB", "Host","FS"];
        $commands = array_map(fn($x) => "gen gaia del$x $domain", $components);
        $cmd = implode(" && ", $commands); // Execute in sequence
        shell_exec($cmd);
    }

/**
* Synchronizes the domain records in the database with the actual system state and generates a detailed report.
*
* @return array An array of messages indicating the synchronization results and discrepancies.
*/
     protected function syncDom(string $domainName): array
     {
         $report = [];

         // 1. Get the current state of the domain from various sources
         $fileSystemDomains = $this->getPublicFilesystem();
         $activeNginxDomains = array_flip($this->getPublicNginx()); // Flip for faster lookups
         $dnsZones = $this->getZones();
         $sslCertificates = $this->getSSLs();

         // 2. Check if domain exists in the file system, Nginx, DNS, and SSL
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
         } elseif ($sslCertificates[$domainName]['expires'] !== null) {
             $domainReport['ssl_expires'] = $sslCertificates[$domainName]['expires'];
         }

         // If there are discrepancies, add to the report
         if (!empty($domainReport['discrepancies'])) {
             $report[] = $domainReport;
         }

         // 3. Check if domain is in DB
         $dbDomains = $this->db->fa("SELECT * FROM gen_admin.domain WHERE name = ?", [$domainName]);

         // If domain doesn't exist in DB, prepare for insert
         if (empty($dbDomains)) {
             $this->db->q("INSERT INTO gen_admin.domain (name) VALUES (?)", [$domainName]);
         } else {
             // If domain exists in DB, prepare update
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

protected function synchronizeDomains(): array{
    $report = [];

    // 1. Get lists of domains from various sources
    $fileSystemDomains = $this->getPublicFilesystem();
    $activeNginxDomains = array_flip($this->getPublicNginx()); // Flip for faster lookups
    $dnsZones = $this->getZones();
    $sslCertificates = $this->getSSLs();

    // 2. Get all domains from the database and reformat as an associative array
    $dbDomains = $this->db->fa("SELECT * FROM gen_admin.domain");
    $dbDomainMap = [];
    foreach ($dbDomains as $dbDomain) {
        $dbDomainMap[$dbDomain['name']] = $dbDomain;
    }

    // 3. Collect all domains from system sources
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
        } elseif ($sslCertificates[$domainName]['expires'] !== null) {
            $domainReport['ssl_expires'] = $sslCertificates[$domainName]['expires'];
        }

        if (!empty($domainReport['discrepancies'])) {
            $report[] = $domainReport;
        }

        // If domain is not in DB, prepare insert
        if (!isset($dbDomainMap[$domainName])) {
            $insertValues[] = "('" . $this->db->escape($domainName) . "')";
        } else {
            // If it exists, prepare update
            $updateValues[] = [
                'fsys_check' => (int)$fsysExists,
                'nginx_check' => (int)$nginxExists,
                'zone_check' => (int)$dnsExists,
                'ssl_check' => (int)$sslExists,
                'name' => $domainName,
            ];
        }
    }

    // 4. Insert missing domains in bulk
    if (!empty($insertValues)) {
        $this->db->q("INSERT INTO gen_admin.domain (name) VALUES " . implode(',', $insertValues));
    }

    // 5. Bulk update existing domains
    if (!empty($updateValues)) {
        foreach ($updateValues as $values) {
            $this->db->q(
                "UPDATE gen_admin.domain SET fsys_check = ?, nginx_check = ?, zone_check = ?, ssl_check = ? WHERE name = ?",
                [$values['fsys_check'], $values['nginx_check'], $values['zone_check'], $values['ssl_check'], $values['name']]
            );
        }
    }

    return $report;
}

   /**
       * Gets a list of domains based on the file system directories.
       *
       * @return array An associative array of domain names and their corresponding paths.
       */
  protected function getPublicFilesystem(string $domain=''): array
    {
        $baseDir = GAIAROOT . 'public/';
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

    protected function getPublicNginx(): array {
        $nginxSitesAvailablePath = '/etc/nginx/conf.d'; // Path to Nginx sites-available directory
        $domains = [];
        // Check if the directory exists
        if (is_dir($nginxSitesAvailablePath)) {
            $files = scandir($nginxSitesAvailablePath);
            foreach ($files as $file) {
                if ($file !== '.' && $file !== '..') {
                    // Assuming the domain configuration file name is the domain name
                    $domains[] = pathinfo($file, PATHINFO_FILENAME);
                }
            }
        } else {
            throw new Exception("Nginx sites-available directory does not exist at $nginxSitesAvailablePath");
        }
        return $domains; // Return the list of public domains
    }

    protected function getActiveNginx(): array{
             $directory = '/etc/nginx/conf.d/';
             $localDir = GSROOT.'setup/domain/';
         // Use glob to get an array of all files in the specified directory
             $nginxSites = glob($localDir . '*');
             return $nginxSites; // Return the list of zones
    }

protected function createSSL($domainame) {
$domain = is_array($domainame) ? $domainame['key'] : $domainame;
    // Command to generate SSL certificate using Certbot
    $command = "sudo certbot --certonly --non-interactive --agree-tos -d $domain";

    // Execute the command
    $output = shell_exec($command);

    // Check if the output contains an error or success message
    if (strpos($output, 'Congratulations') !== false) {
        // Define the folder where Certbot stores the certificates
        $folder = "/etc/letsencrypt/live/$domain/";

        // Check if the SSL certificate folder exists
        if (is_dir($folder)) {
            // Get the expiration date of the SSL certificate (you may need to use OpenSSL or another tool to fetch this)
            $ssl_expiry = shell_exec("openssl x509 -enddate -noout -in $folder/fullchain.pem");
            // Extract the expiry date from the OpenSSL output
            preg_match('/notAfter=(.*)/', $ssl_expiry, $matches);
            $ssl_expires = isset($matches[1]) ? $matches[1] : null;

            // Update the database with the SSL certificate info
            $ssl_file = $this->db->q("UPDATE gen_admin.domain SET ssl_file=?, ssl_check=1, ssl_expires=? WHERE name=?", [$folder, $ssl_expires, $domain]);
            // Check if the update was successful
            if ($ssl_file) {
                echo "SSL certificate successfully generated for $domain!";
            } else {
                throw new Exception("Failed to update the database with SSL info for $domain.");
            }
        } else {
            throw new Exception("SSL certificate folder not found for domain $domain.");
        }
    } else {
        throw new Exception("Failed to generate SSL certificate for $domain. Output: " . $output);
    }
}

protected function getSSLs(): array
{
    $sslInfo = [];
    $api_url = SITE_URL."apy/v1/gaia/certificates"; // Adjust the URL if necessary

    $client = new Client();

    try {
        $response = $client->request('GET', $api_url);
        $statusCode = $response->getStatusCode();

        if ($statusCode == 200) {
            $json_data = $response->getBody()->getContents();
            $data = json_decode($json_data, true);

            if (is_array($data) && isset($data['certificates'])) {
                foreach ($data['certificates'] as $cert) {
                    $domainName = $cert['domains'][0]; // Assuming the first domain is the primary
                    $sslInfo[$domainName] = [
                        'exists' => true,
                        'expires' => $cert['expiry_date'],  // Corrected key
                        'serial_number' => $cert['serial'], // Corrected key
                        'key_type' => $cert['key_type'],
                        'certificate_path' => $cert['cert_path'], // Corrected key
                        'private_key_path' => $cert['key_path'], // Corrected key
                    ];
                }
            }
        } else {
            error_log("FastAPI endpoint returned status code: " . $statusCode);
            return ['error' => "FastAPI response error"];
        }
    } catch (\Exception $e) {
        error_log("Error fetching SSL certificates: " . $e->getMessage());
        return ['error' => "Exception occurred"];
    }

    return $sslInfo;
}


protected function getZones(): array {
        $directory = '/etc/bind/zones/';
        $localDir = GSROOT.'setup/zone/zones/';
    // Use glob to get an array of all files in the specified directory
        $zones = glob($localDir . '*');
        return $zones; // Return the list of zones
    }

 /*
 sudo apt-get install php7.0-cli -y
sudo apt-get install libssh2-1 php-ssh2 -y
apt install php-ssh2 && service php7.2-fmp restart
 */
 protected function copysshfile($fileremote,$filelocal){
	// phpinfo();
	//	$this->connection = @ssh2_connect('62.38.140.132', 22);
	//@ssh2_auth_password($this->connection, 'root', 'n130177!');
	if(extension_loaded("ssh2")){
		$this->connection = ssh2_connect('192.168.2.2', 22);
		ssh2_auth_password($this->connection, 'dros', 'n130177!');
		return ssh2_scp_recv($this->connection, $fileremote,$filelocal);
	}else{
		return "nossh";
	}
 }

	protected function createZone($domainame) {
	$domain = is_array($domainame) ? $domainame['key'] : $domainame;
        $local_absolute_file = GSROOT . "setup/zone/zones/db.$domain";
        $sys_absolute_file = "/etc/bind/zones/db.$domain";
        $sys_local_conf_file = "/etc/bind/zones/named.conf.local";

        // Get local server IP address (simplified)
        $local_ip = gethostbyname(gethostname());  // This retrieves the local machine's IP address

        // Generate zone file from template
        $zone_file_content = $this->standardZone($domain);

        // Write to local absolute file
        file_put_contents($local_absolute_file, $zone_file_content);

        // Update the system's named.conf.local
        $zone_conf = "
    zone \"$domain\" {
        type master;
        file \"$sys_absolute_file\";  # zone file path
        allow-query { any; };
        also-notify { $local_ip; };
    };
    ";
        // Append to the system's named.conf.local
        file_put_contents($sys_local_conf_file, $zone_conf, FILE_APPEND);

        // Reload bind service using shell_exec
        shell_exec("sudo service bind9 reload");

        // Update the database with the SSL certificate info
        $zone_file = $this->db->q("UPDATE gen_admin.domain SET zone_file=?, zone_check=1 WHERE name=?", [$sys_absolute_file, $domain]);
        if($zone_file){
        echo "Zone file created successfully";
        }
    }


	protected function createNginx($domainame) {
	$domain = is_array($domainame) ? $domainame['key'] : $domainame;
        $local_file = GSROOT . "setup/$domain";  // Path to the configuration file for the domain
        $enabled_file = "/etc/nginx/sites-enabled/$domain";  // Path to sites-enabled

        // Generate Nginx config file from template
        $nginx_config_content = $this->standardNginx($domain);

        // Write the generated content to the local file
        file_put_contents($local_file, $nginx_config_content);

        // Create a symbolic link in sites-enabled
        shell_exec("sudo ln -s $local_file $enabled_file");

        // Reload Nginx to apply changes
        shell_exec("sudo service nginx reload");

        // Update the database with the SSL certificate info
        $nginx_file = $this->db->q("UPDATE gen_admin.domain SET nginx_file=?, nginx_check=1 WHERE name=?", [$local_file, $domain]);
        if($nginx_file){
        echo "Zone file created successfully";
        }
    }


protected function standardZone($domain) {
    $date = date('Ymd');  // Current date in 'YYYYMMDD' format

    return "
\$TTL 6000
$domain.    IN    SOA    ns1.$domain. server.$domain. (
            $date
            1200
            3600
            1209601
            60000 )

; name servers - NS RECORDS
$domain.    IN    NS    ns1.$domain.
$domain.    IN    NS    ns2.$domain.

; nameservers - A records
$domain.    IN    A     135.181.219.163
ns1.$domain. IN    A     135.181.219.163
ns2.$domain. IN    A     135.181.219.163
mail.$domain. IN    A     135.181.219.163
admin.$domain. 3600 IN  A     135.181.219.163
$domain.    IN    MX    10    mail.$domain.

; PTR RECORDS
135   IN    PTR    $domain.
";
}

protected function standardNginx($domain) {
    $ssl_cert_path = "/etc/letsencrypt/live/$domain/fullchain.pem";
    $ssl_key_path = "/etc/letsencrypt/live/$domain/privkey.pem";

    // Nginx configuration
    return "
    server {
        listen 443 ssl;
        listen [::]:443 ssl;
        # http2 on;

        server_name $domain;

        # SSL configuration
        ssl_certificate $ssl_cert_path;
        ssl_certificate_key $ssl_key_path;
        include /etc/letsencrypt/options-ssl-nginx.conf;
        ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

        error_log /var/www/gs/log/$domain.log;

        # Include shared configuration for the domain
        include /var/www/gs/setup/domain/gen_shared;

        # Root location
        location / {
            root /var/www/gs/public/$domain;
            index index.php index.html;

            # CORS setup for handling OPTIONS requests
            if (\$request_method = 'OPTIONS') {
                add_header 'Access-Control-Allow-Origin' '*';
                add_header 'X-Frame-Options' '';
                add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
                add_header 'Access-Control-Allow-Headers' 'Origin, Authorization, Accept, Content-Type, X-Requested-With';
                add_header 'Access-Control-Max-Age' 1728000;
                add_header 'Content-Type' 'text/plain charset=UTF-8';
                add_header 'Content-Length' 0;
                return 204;
            }
        }

        # PHP handler for .php files
        location ~ \.php$ {
            fastcgi_pass unix:/run/php/php8.3-fpm.sock;
            fastcgi_param SCRIPT_FILENAME \$request_filename;
            set \$public_dir '$domain';
            fastcgi_param SYSTEM \$public_dir;
            include /etc/nginx/fastcgi_params;
        }

        # Handle 404 and 500 errors
        try_files \$uri \$uri/ /index.php?page=404;
        error_page 500 /index.php?page=500;

        # Custom rewrite rules
        rewrite ^/([a-z0-9_]+)/?$ /index.php?page=\$1&id=\$2 last;
        rewrite ^/([a-z0-9_]+)/([a-z.0-9_]+)/?$ /index.php?page=\$1&id=\$2&action=\$3 last;
        rewrite ^/([a-z0-9_]+)/([a-z.0-9_]+)/([a-z.0-9_]+)/?$ /index.php?page=\$1&id=\$2&action=\$3 last;
    }
    ";
}


/**
Gets the webserver
 */
protected function isWebserver(){
if(!empty($_SERVER['SERVER_SOFTWARE'])){
    $server['name'] = strtolower(trim(explode('/',$_SERVER['SERVER_SOFTWARE'])[0]));
    $server['version']= trim(explode(' ',explode('/',$_SERVER['SERVER_SOFTWARE'])[1])[0]);

}else{
    $server['name'] = shell_exec('nginx -v 2>&1');
    $server['name'] = shell_exec('apache2 -v 2>&1');
}
return $server;
}

/**
Gets the operating system
 */
protected function isOs(){
    if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
    return 'WIN';
    } else {
    return PHP_OS;
    }
}

/**
Creates a copy with scp
 */
	protected function recurse_scp($src,$dst) {
    $dir = opendir($src);
    @mkdir($dst);
    while(false !== ( $file = readdir($dir)) ) {
        if (( $file != '.' ) && ( $file != '..' )) {
            if ( is_dir($src . '/' . $file) ) {
                $this->recurse_scp($this->connection, $src . '/' . $file,$dst . '/' . $file,0777);
            }
            else {
                ssh2_scp_send($this->connection, $src.'/'.$file, $dst.'/'.$file, 0777);
				chmod($dst . '/' . $file, 0777);
            }
        }
    }
    closedir($dir);
	}

/**
Provides PHP modules
 */
protected function checkPHPMods(){
	$modules_list=array('mysql','PDO','pdo_mysql','gd','redis','sqlite3','ssh2','memcached');
	$problem=array();
		foreach($modules_list as $module){
		if(!extension_loaded($module)){
			$problem[]=$module;
		}
		}
	return $problem;
}


/**
Total memory in kb
 */
protected function mem(){
	if(file_exists('/proc/meminfo')){
	 $fh = fopen('/proc/meminfo','r');
	  $mem = 0;
	  while ($line = fgets($fh)) {
		$pieces = array();
		if (preg_match('/^MemTotal:\s+(\d+)\skB$/', $line, $pieces)) {
		  $mem = $pieces[1];
		  break;
		}
	  }
	  fclose($fh);
		return $mem;
	}
}
/*
creates local domain in wamp server64
!update for ubuntu server lamp
check if wamp
returns errors
*/
protected function setupDomain($jsonsetup,$url){
		//$json=htmlspecialchars_decode($jsonsetup);
		$json=json_decode($jsonsetup,true);
		$domain=$_POST['domain'];
		$dbhost=$json[$domain]['dbhost'];
		$dbuser=$json[$domain]['dbuser'];
		$dbname=$json[$domain]['dbname'];
		$dbpass=$json[$domain]['dbpass'];
		$email=$json[$domain]['email'];
	//1	create domain  folder
		$gaiabase=$_POST['folder'];
		$gaiaroot=$_POST['folder'].'gaia/';
		@define('SITEROOT',$gaiabase.$domain.'/');
		$folder_install=$this->createDomainFolder(SITEROOT);

	//2	move myblog to template
	 @rename($gaiaroot.'myblog', SITEROOT.'templates/myblog');

	//3	create domain index.php && .htaccess (if apache)
		$indexfile="<?php define('GAIAROOT',dirname(dirname(__FILE__)).'/'); include GAIAROOT.'bootstrap.php'; ?>";
		@file_put_contents(SITEROOT."index.php",$indexfile);
		$htaccess="RewriteEngine On\n";
		$htaccess.="RewriteBase /\n";
		$htaccess.="DirectoryIndex index.php index.html\n";
		$htaccess.="RewriteRule ^([A-Za-z0-9_-]+)/?$ index.php?page=$1&dsh=$2 [QSA] \n";
		$htaccess.="RewriteRule ^([A-Za-z0-9_-]+)/([A-Za-z0-9_-]+)/?$	index.php?page=$1&mode=$2 [QSA] \n";
		@file_put_contents(SITEROOT.".htaccess",$htaccess);
	//4	create virtual host
			$vhost="\n<VirtualHost *:80>\n";
			$vhost.="ServerName $domain\n";
			$vhost.="DocumentRoot '{$gaiabase}{$domain}'\n";
			$vhost.="Alias '/gaia' '{$gaiaroot}'\n";
			$vhost.="<Directory  '{$gaiabase}$domain/'>\n";
			$vhost.="Options +Indexes +Includes +FollowSymLinks +MultiViews\n";
			$vhost.="AllowOverride All\n";
			$vhost.="Require local\n";
			$vhost.="</Directory>\n";
			$vhost.="</VirtualHost>";
	if(!file_put_contents($this->vhostfile, $vhost.PHP_EOL , FILE_APPEND | LOCK_EX)){
		$error[]="Problem creating vhost";
	}
	//5	update hosts file if windows
			$host="127.0.0.1 $domain\n";
			$host.="::1	$domain\n";
	if(!file_put_contents($this->hostfile, $host.PHP_EOL , FILE_APPEND | LOCK_EX)){
		$error[]="Problem modifying host file";
	}
	//6 create newdb in maria
		$newdb = new PDO("mysql:host=$dbhost", $dbuser, $dbpass);
		$newdb->exec("CREATE DATABASE `$dbname`;
				CREATE USER '$dbuser'@'localhost' IDENTIFIED BY '$dbpass';
				GRANT ALL ON `$dbname`.* TO '$dbuser'@'localhost';
				FLUSH PRIVILEGES;");
	//7 install maria db --$this->create_db($dbname,$dbhost,$dbuser,$dbpass);
	//	$this->_db = $this->maria_con($dbhost,$dbname,$dbuser,$dbpass);
		$db= new PDO("mysql:host=$dbhost;dbname=$dbname",$dbuser,$dbpass);
	//import basic database

	$sqlines=file($gaiaroot."install.sql");
	foreach($sqlines as $line){
		if(substr($line,0,2)=='--' || $line=='')
			continue;
		$templine .=$line;
		if(substr(trim($line),-1,1)==";"){
		//$this->q($templine);
		 $db->query($templine);
		$templine='';
		}
	}
	//8 insert superuser in db
	$db->query("INSERT INTO user(name,pass,email,grp,auth) VALUES(?,?,?,?,?)",
	array($dbuser,$dbpass,$email,7,1));

	//9	create/update setup.json in www folder (same level with Gaia and domain folder)
	$setupjson=urldecode($url);
	//htmlspecialchars_decode($jsonsetup)
	if(file_exists($setupjson)){
		$newjson= jsonget($setupjson);
		$newjson[$domain]= json_decode($json,true)[$domain];
		$setup=file_put_contents($setupjson, json_encode($newjson,JSON_PRETTY_PRINT));
	}else{
		//$setup=file_put_contents($setupjson, $json);
		$setup=file_put_contents($setupjson, $jsonsetup);
	}
		if (!$setup){
			$error[]="Problem creating/updating setupjson";
		}
		return !empty($error) ? $error:  true;
}

/**
* Creates a maria dumb
*/
    protected function mariadump($domainame,$replica,$type='dom'){
        $host = $this->CONF[$domainame]['dbhost'];
        $db = $this->CONF[$domainame]['dbname'];
        $dbuser = $this->CONF[$domainame]['dbuser'];
        $dbpass = $this->CONF[$domainame]['dbpass'];

//dump mysql
        $dump= $type=='dom'
            ? $this->BACKUP_DIR.$type."/sql/".$db."-".$replica.".sql"
            : $this->BACKUP_DIR.$type."/sql/gs-".$replica.".sql";
        //if type==gaia set only default settings and from one demo user,post,page record
        if($type=='dom'){
            $dump = "mariadb-dump --user=$dbuser --password=$dbpass --host=$host $db > $dump";
        }else{
            $dump = "mariadb-dump --no-data --user=$dbuser --password=$dbpass --host=$host $db > $dump";
        }


        @exec($dump);
        @chmod($dump, 0777);
}

/**
* Creates a fs backup in tar format
*/
	protected function domainBackup($domainame, $replica, $log){
        $domainbase= explode('.',$domainame)[0];
		$dom_folder = $this->BACKUP_DIR . "dom/".$domainbase."-".$replica;

		if (!file_exists("$dom_folder.tar.gz")) {
			mkdir($dom_folder);
			chmod($dom_folder, 0777);

			//rewrite update.log.txt
			write_onfile($this->BACKUP_DIR."dom/log/updatelog-" . $domainbase . "-" . $replica . ".md", $log);

            //mysqldump
            $this->dump($domainame,$replica);

//copy the system to backup folder
            // and domain to domain_folder
			recurse_copy(SERVERBASE . $domainame."/", $dom_folder);
            //unlink gaia from folder
            xrmdir($dom_folder.'/gaia');
//create tar.gz for domains_folder
			$drepo = new PharData("$dom_folder.tar");
			$drepo->buildFromDirectory($dom_folder);
			$drepo->compress(Phar::GZ);

//remove old
			system("chmod -R 777 $dom_folder");
			system("chmod -R 777 $dom_folder.tar");
			unlink("$dom_folder.tar");
			xrmdir($dom_folder);
//permissions
			system("chmod -R 777 $dom_folder.tar.bz2");

			//update version database
			$updateVersion = $this->db->q("UPDATE gen_admin.globs SET val=? WHERE name=?", array($replica, 'domain-version'));
			if (!$updateVersion) {return $this->error[2];}else{return 'yes';}
		} else {
			return $this->error[1];
		}
	}

/**
* Creates a system backup backup in tar format
*/
    protected function sysBackup($domainame, $replica, $log){
           $sys_folder = BACKUP_DIR.'gaia/'.$replica;
        if (!file_exists("$sys_folder.tar.gz")) {
            mkdir($sys_folder);
            chmod($sys_folder, 0777);

            //rewrite update.log.txt
            write_onfile(BACKUP_DIR."gaia/log/updatelog-sys-" . $replica . ".md", $log);

            //mariadb-dump
            $this->dump($domainame,$replica,'gaia');

////copy the system to backup folder
            //update copy gaia to sys_folder
            recurse_copy(SERVERBASE . $domainame.'/', $sys_folder);

//create tar.gz for sys_folder
            $srepo = new PharData("$sys_folder.tar");
            $srepo->buildFromDirectory($sys_folder);
            $srepo->compress(Phar::GZ);
//remove old
            system("chmod -R 777 $sys_folder");
            system("chmod -R 777 $sys_folder.tar");
            unlink("$sys_folder.tar");
            xrmdir($sys_folder);
//permissions
            system("chmod -R 777 $sys_folder.tar.gz");

            //update version database
            $updateVersion = $this->db($domainame)->q("UPDATE varglobal SET value=? WHERE name=?", array($replica, 'system-version'));
            if (!$updateVersion) {return $this->error[2];}else{return 'yes';}
        } else {
            return $this->error[1];
        }
    }



}