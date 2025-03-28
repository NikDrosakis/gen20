#!/bin/bash

# Get the domain from the third argument
DOMAIN="$3"

if [ -z "$DOMAIN" ]; then
    echo "❌ Error: Domain not specified. Usage: gen domain ssl <domain>"
    exit 1
fi

# Path to the Let's Encrypt live directory
LETSENCRYPT_LIVE_DIR="/etc/letsencrypt/live"

# Check if the domain has a certificate in /etc/letsencrypt/live
if [ -d "$LETSENCRYPT_LIVE_DIR/$DOMAIN" ]; then
    echo "✅ SSL certificate found for $DOMAIN in $LETSENCRYPT_LIVE_DIR/$DOMAIN."

    # Check the expiration date of the certificate
    CERT_FILE="$LETSENCRYPT_LIVE_DIR/$DOMAIN/fullchain.pem"
    if [ -f "$CERT_FILE" ]; then
        EXPIRY_DATE=$(openssl x509 -enddate -noout -in "$CERT_FILE" | cut -d= -f2)
        echo "🔒 Certificate expiration date: $EXPIRY_DATE"
    else
        echo "❌ Certificate file (fullchain.pem) not found for $DOMAIN."
    fi
else
    echo "❌ No SSL certificate found for $DOMAIN in $LETSENCRYPT_LIVE_DIR."
fi