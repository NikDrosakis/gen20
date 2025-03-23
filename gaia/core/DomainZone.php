<?php
namespace Core;
use Exception;

trait DomainZone {

protected function addZone(string $domainName = ''): array{

// Use the provided domain name or fall back to a default domain
$domain = $domainName ?: DOMAIN;

//STEP 1 Get the external IP address of the server
$extip = shell_exec('curl -s ifconfig.me');
if (empty($extip)) {
    throw new Exception("❌ Failed to retrieve the external IP address.");
}

// Reverse the IP address for the reverse DNS zone
$reverseip = implode('.', array_reverse(explode('.', $extip)));

//STEP 2 Check if the domain is delegated to the server
$delegationCheck = shell_exec("gen domain zone $domain");
if (strpos($delegationCheck, '❌') !== false) {
    throw new Exception("❌ Domain $domain is not delegated to this server.");
}

//STEP 3 Check if BIND9 service is active
$bindStatus = shell_exec('systemctl is-active bind9');
if (trim($bindStatus) !== 'active') {
    throw new Exception("❌ BIND9 service is not active.");
}

//STEP 4 Create the forward zone file in /etc/bind/zones
$zoneFile = "/etc/bind/zones/db.$domain";
if (file_exists($zoneFile)) {
    throw new Exception("❌ Zone file for $domain already exists.");
}

//STEP 5 Write the zone file content based on the template
$zoneContent = <<<EOF
\$TTL	3000
$domain.	IN	SOA	ns1.$domain. admin.$domain. (
			2018112810
			1200
			3600
			1209601
			60000 )
$domain.	IN	NS	ns2.$domain.
$domain.	IN	NS	ns1.$domain.
$domain.	IN	A	$extip
ns1.$domain.	IN	A	$extip
ns2.$domain.	IN	A	$extip
mail.$domain.	10	IN	A	$extip
*	IN	CNAME	$domain.
$reverseip.in-addr.arpa.    IN      PTR     $domain.
$domain.	IN	MX	10	mail.$domain.
EOF;
file_put_contents($zoneFile, $zoneContent);

//STEP 6 Add the zone configuration to /etc/bind/named.conf.remote
$namedConfRemote = "/etc/bind/named.conf.remote";
if (!file_exists($namedConfRemote)) {
    throw new Exception("❌ File $namedConfRemote does not exist.");
}

$zoneConfig = <<<EOF
zone "$domain" {
    type master;
    file "/etc/bind/zones/db.$domain"; # zone file path
    allow-query { any; };
    also-notify { $extip; };
};
EOF;
// Append the zone configuration to named.conf.remote
file_put_contents($namedConfRemote, $zoneConfig, FILE_APPEND);

//STEP 7 Reload BIND9 to apply the changes
    $reloadStatus = shell_exec('systemctl reload bind9');
    if ($reloadStatus === null) {
        throw new Exception("❌ Failed to reload BIND9 service.");
    }

//STEP 8 Insert the domain into the database
$this->db->insert("gen_admin.domain", ["name" => $domain,"zone_file"=>$zonefile,"zone_check"=>1]);
    return [
        'status' => 'success',
        'message' => "✅ Zone for $domain created successfully and added to named.conf.remote.",
        'zone_file' => $zoneFile,
        'external_ip' => $extip,
        'reverse_ip' => $reverseip,
    ];
}

protected function delZone(string $domainName = ''): array
{
    // Use the provided domain name or fall back to a default domain
    $domain = $domainName ?: DOMAIN;

    // STEP 1: Check if BIND9 service is active
    $bindStatus = shell_exec('systemctl is-active bind9');
    if (trim($bindStatus) !== 'active') {
        throw new Exception("❌ BIND9 service is not active.");
    }

    // STEP 2: Check if the zone file exists
    $zoneFile = "/etc/bind/zones/db.$domain";
    if (!file_exists($zoneFile)) {
        throw new Exception("❌ Zone file for $domain does not exist.");
    }

    // STEP 3: Delete the zone file
    if (!unlink($zoneFile)) {
        throw new Exception("❌ Failed to delete zone file for $domain.");
    }

    // STEP 4: Remove the zone configuration from /etc/bind/named.conf.remote
    $namedConfRemote = "/etc/bind/named.conf.remote";
    if (!file_exists($namedConfRemote)) {
        throw new Exception("❌ File $namedConfRemote does not exist.");
    }

    // Read the contents of named.conf.remote
    $namedConfContent = file_get_contents($namedConfRemote);
    if ($namedConfContent === false) {
        throw new Exception("❌ Failed to read $namedConfRemote.");
    }

    // Remove the zone configuration for the domain
    $zoneConfigPattern = "/zone\s+\"$domain\"\s+\{[^}]+\}/";
    $updatedNamedConfContent = preg_replace($zoneConfigPattern, '', $namedConfContent);

    if ($updatedNamedConfContent === null) {
        throw new Exception("❌ Failed to remove zone configuration for $domain from $namedConfRemote.");
    }

    // Write the updated content back to named.conf.remote
    if (file_put_contents($namedConfRemote, $updatedNamedConfContent) === false) {
        throw new Exception("❌ Failed to update $namedConfRemote.");
    }

    // STEP 5: Reload BIND9 to apply the changes
    $reloadStatus = shell_exec('systemctl reload bind9');
    if ($reloadStatus === null) {
        throw new Exception("❌ Failed to reload BIND9 service.");
    }

    // STEP 6: Delete the domain entry from the database
    $deleteResult = $this->db->delete("gen_admin.domain", ["name" => $domain]);
    if (!$deleteResult) {
        throw new Exception("❌ Failed to delete domain $domain from the database.");
    }

    // Return success response
    return [
        'status' => 'success',
        'message' => "✅ Zone for $domain deleted successfully.",
        'deleted_zone_file' => $zoneFile,
    ];
}

}