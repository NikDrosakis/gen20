#!/bin/bash
#1 PHP INTALLATION
#2 COMPOSER INSTALLATION
#3 MARIA INSTALLATION
#4 GENDB INSTALLATION
#5 NGINX HOST INSTALLATION

#1 Check for PHP Version > 8.0
PHP_VERSION=$(php -v 2>/dev/null | grep -oP '^PHP \K[0-9]+\.[0-9]+')
if [[ -z "$PHP_VERSION" || $(echo "$PHP_VERSION < 8.0" | bc) -eq 1 ]]; then
    echo "PHP 8.0+ is required. Do you want to install it? (yes/no)"
    read -r INSTALL_PHP
    if [[ "$INSTALL_PHP" == "yes" ]]; then
        sudo apt update
        sudo apt install -y php8.3 php8.3-fpm php8.3-mysql
        echo "PHP 8.3 installed successfully!"
    else
        echo "PHP 8.0+ is required. Exiting."
        exit 1
    fi
else
    echo "PHP version $PHP_VERSION is already installed."
fi

#2 COMPOSER Ask for Composer Installation
if ! command -v composer &> /dev/null; then
    echo "Composer is not installed. Do you want to install it? (yes/no)"
    read -r INSTALL_COMPOSER
    if [[ "$INSTALL_COMPOSER" == "yes" ]]; then
        curl -sS https://getcomposer.org/installer | php
        sudo mv composer.phar /usr/local/bin/composer
        echo "Composer installed successfully!"
    else
        echo "Composer is required for this setup. Exiting."
        exit 1
    fi
else
    echo "Composer is already installed."
fi

# Run Composer Install
if [ -f "composer.json" ]; then
    composer install --no-interaction
    echo "Composer dependencies installed successfully."
else
    echo "composer.json not found. Skipping composer install."
fi

#3 DB - Check for MariaDB Installation
# Extract major.minor version
MYSQL_VERSION=$(mysql -V 2>/dev/null | awk '{print $5}' | cut -d'.' -f1,2)

# Define the minimum required version
REQUIRED_VERSION="10.4"

# Check if MariaDB/MySQL is installed and the version is detected
if [[ -z "$MYSQL_VERSION" ]]; then
    echo "MariaDB is not installed. Do you want to install it? (yes/no)"
    read -r INSTALL_MYSQL
    if [[ "$INSTALL_MYSQL" == "yes" ]]; then
        sudo apt update
        sudo apt install -y mariadb-server mariadb-client
        sudo systemctl start mariadb
        sudo systemctl enable mariadb
        echo "MariaDB installed successfully!"
    else
        echo "MariaDB is required for this setup. Exiting."
        exit 1
    fi
else
    echo "Detected MariaDB version: $MYSQL_VERSION"

    # Compare versions
    if awk "BEGIN {exit !($MYSQL_VERSION >= $REQUIRED_VERSION)}"; then
        echo "Version is sufficient (>= $REQUIRED_VERSION). Proceeding..."
    else
        echo "MariaDB version $MYSQL_VERSION is insufficient. Required: >= $REQUIRED_VERSION."
        echo "Do you want to upgrade MariaDB? (yes/no)"
        read -r UPGRADE_MYSQL
        if [[ "$UPGRADE_MYSQL" == "yes" ]]; then
            sudo apt update
            sudo apt install -y mariadb-server mariadb-client
            echo "MariaDB upgraded successfully!"
        else
            echo "MariaDB must meet the minimum version requirements. Exiting."
            exit 1
        fi
    fi
fi



#4 Nginx - Ask for the domain
echo "Enter the domain name to configure the database (e.g., example.com):"
read -r DOMAIN

if [[ -z "$DOMAIN" ]]; then
    echo "Error: Domain name cannot be empty."
    exit 1
fi

echo "Checking Nginx configuration files for the domain: ${DOMAIN}..."

CONFIG_FILE=""

# Check if there's a symlink in sites-enabled
if [ -L "/etc/nginx/sites-enabled/${DOMAIN}" ]; then
    # Resolve the symlink to get the actual file in sites-available
    CONFIG_FILE=$(readlink -f "/etc/nginx/sites-enabled/${DOMAIN}")
    echo "Resolved symlink: ${CONFIG_FILE}"
elif [ -f "/etc/nginx/sites-available/${DOMAIN}" ]; then
    # Use the direct file in sites-available
    CONFIG_FILE="/etc/nginx/sites-available/${DOMAIN}"
    echo "Using Nginx config in sites-available: ${CONFIG_FILE}"
else
    # Prompt if not found
    echo "Nginx config for '${DOMAIN}' not found in sites-enabled or sites-available."
    echo "Please enter the full path to your Nginx configuration file:"
    read -r CONFIG_FILE
    if [ ! -f "$CONFIG_FILE" ]; then
        echo "Error: The provided file path does not exist. Exiting."
        exit 1
    fi
fi

# Verify the file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: The file $CONFIG_FILE does not exist."
    exit 1
fi

# Insert the 'include' line before 'location /' using the current directory
CURRENT_DIR=$(pwd)
INCLUDE_LINE="include ${CONFIG_FILE};"

# Insert line dynamically
sudo sed -i "/location \//i ${INCLUDE_LINE}" "$CONFIG_FILE"

#ufw allow ports 8983, 3006,3008, 3009, 3010
sudo ufw allow 8983,3006,3008,3009,3010/tcp

# Test and reload Nginx
sudo nginx -t && sudo systemctl reload nginx && echo "Nginx reloaded successfully!" || echo "Failed to reload Nginx."


#5 GEN_DB - Ask the Domain && Install/Update setup/maria/gen_template_0.48.sql
echo "Setting up the database for $DOMAIN..."

# GEN_DB - Set Up the Database
# Convert domain name to an underscore-friendly database name
DB_NAME="gen_${DOMAIN//./}"

# Create the database if it does not exist
echo "Creating database '$DB_NAME' (if not exists)..."
mysql -uroot -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME};" || {
    echo "Database creation failed. Exiting.";
    exit 1;
}

# Reload the SQL schema
echo "Updating schema SQL file 'setup/maria/gen_048.sql' into database '$DB_NAME'..."
if [ -f "setup/maria/gen_048.sql" ]; then
    mysql -uroot -D "${DB_NAME}" < setup/maria/gen_048.sql || {
        echo "Failed to load/update core SQL file. Exiting.";
        exit 1;
    }
    echo "Database '$DB_NAME' schema updated successfully!"
else
    echo "Error: SQL file 'setup/maria/gen_048.sql' not found."
    exit 1
fi

# 6. Load settings SQL file
SETTINGS_SQL="setup/maria/gen_settings_048.sql"
if [ -f "$SETTINGS_SQL" ]; then
    echo "Loading settings SQL file '$SETTINGS_SQL' into database '$DB_NAME'..."
    mysql -uroot -D "$DB_NAME" < "$SETTINGS_SQL"
    if [ $? -eq 0 ]; then
        echo "Settings loaded successfully!"
    else
        echo "Failed to load settings SQL file. Exiting."
        exit 1
    fi
else
    echo "Error: SQL file '$SETTINGS_SQL' not found. Exiting."
    exit 1
fi

echo "Presetup finished successfully"