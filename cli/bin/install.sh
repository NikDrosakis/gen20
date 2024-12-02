#!/bin/bash
# Installation script for setting up a new domain

# Function to display usage
usage() {
    echo "Usage: $0 DOMAIN"
    echo "Example: $0 example.com"
    exit 1
}
echo $DOMAIN
# Check if domain is provided
if [ -z "$1" ]; then
    echo "Error: Domain not specified."
    usage
fi

# Assign domain and IP variables
DOMAIN=$1
DOMAINIP=$(hostname -I | awk '{print $1}')  # Get the first IP address of the host

# Step 1: Setup the domain directory
echo "Setting up the system for domain: $DOMAIN"

cd /var/www/gs || { echo "Failed to navigate to /var/www/gs"; exit 1; }
mkdir -m 755 "$DOMAIN" || { echo "Failed to create directory for $DOMAIN"; exit 1; }

# Step 2: Install the database (this should be customized as needed)
echo "Setting up the database for $DOMAIN..."
mysql -uroot -e "CREATE DATABASE IF NOT EXISTS ${DOMAIN//./_};" || { echo "Database creation failed"; exit 1; }

# Load the core SQL file
mysql -uroot -D "${DOMAIN//./_}" < /var/www/gs/setup/maria/core_branch_042.sql || { echo "Failed to load core SQL file"; exit 1; }

# Step 3: Configure DNS bind for the domain
echo "Configuring DNS for $DOMAIN..."
BIND_ZONE_FILE="/etc/bind/zones/db.$DOMAIN"

# Make a copy of the bind domain template and update it
if [ -f /etc/bind/zones/db.DOMAIN ]; then
    cp /etc/bind/zones/db.DOMAIN "$BIND_ZONE_FILE"
    sed -i "s/DOMAIN/$DOMAIN/g" "$BIND_ZONE_FILE"
    sed -i "s/DOMAINIP/$DOMAINIP/g" "$BIND_ZONE_FILE"
else
    echo "Template file /etc/bind/zones/db.DOMAIN not found."
    exit 1
fi

# Reload bind9 service to apply changes
service bind9 reload || { echo "Failed to reload BIND9 service"; exit 1; }

# Step 4: Obtain SSL certificate
echo "Obtaining SSL certificate for $DOMAIN..."
service nginx stop || { echo "Failed to stop Nginx"; exit 1; }
certbot certonly --standalone --preferred-challenges http -d "$DOMAIN" || { echo "SSL certificate retrieval failed"; exit 1; }
service nginx start || { echo "Failed to start Nginx"; exit 1; }

# add database



#

echo "Setup for $DOMAIN completed successfully."
