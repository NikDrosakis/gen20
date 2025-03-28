# Iterate over each domain directory in /var/www/gs/setup/nginx/
for link in /var/www/gs/setup/nginx/*; do
    # Get the domain name (filename only)
    domain=$(basename "$link")

    # Remove any existing symbolic link in /etc/nginx/sites-enabled
    if [ -L "/etc/nginx/conf.d/$domain" ]; then
        rm "/etc/nginx/conf.d/$domain"
    fi

    # Create the correct symbolic link
    cp -s "/var/www/gs/setup/nginx/conf.d/$domain" "/etc/nginx/conf.d/$domain"

    echo "Domain nginx updated"
done
