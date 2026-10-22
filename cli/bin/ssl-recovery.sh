#!/bin/bash
# Αποκατάσταση όλων των live φακέλων από τα archives

for domain_dir in /etc/letsencrypt/archive/*/; do
    # Βγάλε το όνομα του domain από το path
    domain=$(basename "$domain_dir")

    # Δημιούργησε τον live φάκελο
    sudo mkdir -p "/etc/letsencrypt/live/$domain"

    # Μπες στο live φάκελο
    cd "/etc/letsencrypt/live/$domain" || continue

    # Βρες τον τελευταίο αριθμό certificate (π.χ., cert1.pem, cert2.pem)
    latest_cert=$(ls "$domain_dir" | grep -E '^cert[0-9]+\.pem$' | sort -V | tail -1)
    if [[ -z "$latest_cert" ]]; then
        echo "⚠️  No certificate found for $domain"
        continue
    fi

    # Βγάλε τον αριθμό (π.χ., από cert1.pem -> 1)
    num=$(echo "$latest_cert" | grep -o '[0-9]\+')

    echo "🔗 Restoring $domain with cert${num}.pem"

    # Δημιούργησε τους symlinks
    sudo ln -sf "../../archive/$domain/cert${num}.pem" cert.pem
    sudo ln -sf "../../archive/$domain/chain${num}.pem" chain.pem
    sudo ln -sf "../../archive/$domain/fullchain${num}.pem" fullchain.pem
    sudo ln -sf "../../archive/$domain/privkey${num}.pem" privkey.pem
done

echo "✅ All certificates restored!"