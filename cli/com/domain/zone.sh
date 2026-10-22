#!/bin/bash
# Fetch the external IP address of the server
YOUR_SERVER_IP=$(curl -s ifconfig.me)

if [ -z "$YOUR_SERVER_IP" ]; then
    echo "❌ Failed to retrieve the external IP address. Check your internet connection."
    exit 1
fi

echo "Your server's external IP address is: $YOUR_SERVER_IP"
# Get the domain from the first argument
DOMAIN="$3"

if [ -z "$DOMAIN" ]; then
    echo "❌ Error: Domain not specified. Usage: domain <domain>"
    exit 1
fi

# Get the nameservers for the domain
NAMESERVERS=$(dig +short NS $DOMAIN)

if [ -z "$NAMESERVERS" ]; then
    echo "❌ No nameservers found for $DOMAIN. The domain may not be delegated."
    exit 1
fi

echo "Nameservers for $DOMAIN:"
echo "$NAMESERVERS"

# Check if any of the nameservers point to your server's IP
DELEGATED=false
for NS in $NAMESERVERS; do
    NS_IP=$(dig +short A $NS)
    if [ "$NS_IP" == "$YOUR_SERVER_IP" ]; then
        DELEGATED=true
        echo "✅ The domain $DOMAIN is delegated to your server ($YOUR_SERVER_IP) via nameserver $NS."
    fi
done

if [ "$DELEGATED" == "false" ]; then
    echo "❌ The domain $DOMAIN is not delegated to your server ($YOUR_SERVER_IP)."
fi