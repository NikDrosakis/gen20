# Iterate over each domain directory in /var/www/gs/setup/nginx/
for link in /var/www/gs/setup/nginx/*; do
    # Get the domain name (filename only)
    domain=$(basename "$link")

    # Remove any existing symbolic link in /etc/nginx/sites-enabled
    if [ -L "/etc/nginx/sites-enabled/$domain" ]; then
        rm "/etc/nginx/sites-enabled/$domain"
    fi

    # Create the correct symbolic link
    ln -s "/var/www/gs/setup/nginx/$domain" "/etc/nginx/sites-enabled/$domain"

    echo "Created link for $domain"
done
