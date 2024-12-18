#!/bin/bash
#1 PHP & MODULES INTALLATION
#2 COMPOSER INSTALLATION
#3 MARIA INSTALLATION
#4 GENDB MYSQL INSTALLATION
#5 PUBLIC PHP OR REACT
#6 DB MYSQL
#7 ERMIS
#8 VENUS
#9 KRONOS
#10 PERMISSIONS

#get .env vars
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

#1 Check for PHP Version > 8.0
PHP_VERSION=$(php -v 2>/dev/null | grep -oP '^PHP \K[0-9]+\.[0-9]+')
if [[ -z "$PHP_VERSION" || $(echo "$PHP_VERSION < 8.0" | bc) -eq 1 ]]; then
    echo "PHP 8.0+ is required. Do you want to install it? (yes/no)"
    read -r INSTALL_PHP
    if [[ "$INSTALL_PHP" == "yes" ]]; then
        sudo apt update
        sudo apt install -y php8.3 php8.3-fpm php8.3-mysql
        sudo apt install -y \
            php8.3-bz2 php8.3-calendar php8.3-core php8.3-ctype php8.3-curl php8.3-date \
            php8.3-dom php8.3-exif php8.3-ffi php8.3-fileinfo php8.3-filter php8.3-ftp \
            php8.3-gd php8.3-gettext php8.3-hash php8.3-iconv php8.3-igbinary php8.3-imagick \
            php8.3-intl php8.3-json php8.3-libxml php8.3-mbstring php8.3-mcrypt php8.3-mongodb \
            php8.3-mysqli php8.3-mysqlnd php8.3-openssl php8.3-pcntl php8.3-pcre php8.3-pdo \
            php8.3-pdo-mysql php8.3-pdo-sqlite php8.3-phar php8.3-posix php8.3-random \
            php8.3-readline php8.3-redis php8.3-reflection php8.3-session php8.3-shmop \
            php8.3-simplexml php8.3-sockets php8.3-sodium php8.3-spl php8.3-sqlite3 php8.3-standard \
            php8.3-sysvmsg php8.3-sysvsem php8.3-sysvshm php8.3-tokenizer php8.3-xml php8.3-xmlreader \
            php8.3-xmlwriter php8.3-xsl php8.3-opcache php8.3-zip php8.3-zlib
      sudo apt install -y php-pear php8.3-dev
      sudo pecl install mongodb
      sudo pecl install igbinary
      sudo pecl install redis
      sudo systemctl enable php8.3-fpm
      sudo systemctl start php8.3-fpm
        echo "PHP 8.3 & Modules installed successfully!"
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

# Create the PUBLIC database if it does not exist
echo "Creating database '$DB_NAME' (if not exists)..."
mysql -uroot -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME};" || {
    echo "Database creation failed. Exiting.";
    exit 1;
}
# Create the ADMIN database if it does not exist
mysql -uroot -e "CREATE DATABASE IF NOT EXISTS gen_admin;" || {
    echo "Database creation failed. Exiting.";
    exit 1;
}

# Install SQL schema from admin & public
LATEST_ADMIN_FILE=$(ls setup/maria/gen_admin_*.sql | sort -t'_' -k2,2V | tail -n 1)
echo "Updating schema SQL file 'setup/maria/${LATEST_ADMIN_FILE}' into database gen_admin..."
mysql -uroot -D gen_admin < {LATEST_ADMIN_FILE}
echo "Database gen_admin schema updated successfully!"

CURRENT_VERSION=$(mysql -u$DB_USER -p$DB_PASS -D$DB_NAME -se "SELECT MAX(version_tag) + 0.001 FROM versions")
LATEST_PUBLIC_FILE=$(ls setup/maria/gen_public_*.sql | sort -t'_' -k2,2V | tail -n 1)
echo "Updating schema SQL file '${LATEST_PUBLIC_FILE}' into database '$DB_NAME'..."
mysql -uroot -D "${DB_NAME}" < ${LATEST_PUBLIC_FILE}
echo "Database '$DB_NAME' schema updated successfully!"


#Load settings SQL file
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

#6. PUBLIC Choose system php|react Create public filesystem public/${DOMAIN}
# if php just insert this <?php
                          #define('DOMAIN',$_SERVER['SERVER_NAME']);
                          #$servernameArray=explode('.',${DOMAIN});
                          #define('TEMPLATE', 'vivalibrocom');
                          #define('ROOT', '${CURRENT_DIR}');
                          #define('ADMIN_ROOT', ROOT.'admin/');
                          #require '/var/www/gs/vendor/autoload.php';
                          #use Core\Gen;
                          #$gaia = new Gen();
                          #?>
# if react just insert this <?php
# cd public && yarn create react-app ${DOMAIN}
echo "Choose system (php/react): "
read SYSTEM
if [[ "$SYSTEM" == "php" ]]; then
    mkdir -p "public/${DOMAIN}"
    # PHP setup: Insert PHP code into the public/${DOMAIN} folder
    echo "<?php
    define('DOMAIN', \$_SERVER['SERVER_NAME']);
    \$servernameArray = explode('.', \${DOMAIN});
    define('TEMPLATE', 'vivalibrocom');
    define('ROOT', '${CURRENT_DIR}');
    define('ADMIN_ROOT', ROOT . 'admin/');
    require '/var/www/gs/vendor/autoload.php';
    use Core\Gen;
    \$gaia = new Gen();
    ?>" > "public/${DOMAIN}/index.php"
    echo "${DOMAIN} powered by Gen20, completed for ${DOMAIN} in 'public/${DOMAIN}/index.php'."

elif [[ "$SYSTEM" == "react" ]]; then
  NODE_VERSION=$(node -v 2>/dev/null)
  REQUIRED_NODE_VERSION="v20"
  # Function to compare Node.js versions
  compare_versions() {
      printf '%s\n%s' "$1" "$2" | sort -V | head -n1
  }
  if [[ "$SYSTEM" == "react" ]]; then
      # Check if Node.js version is greater than or equal to 20.x
      if [[ -z "$NODE_VERSION" || "$(compare_versions "$NODE_VERSION" "$REQUIRED_NODE_VERSION")" != "$REQUIRED_NODE_VERSION" ]]; then
          echo "Node.js version 20.x or higher is required. Installing Node.js and Yarn..."

          # Install Node.js (if not installed or if the version is less than 20)
          curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -
          sudo apt-get install -y nodejs

          # Install Yarn
          npm install -g yarn

          echo "Node.js and Yarn installed successfully."
      else
          echo "Node.js version $NODE_VERSION is sufficient."
      fi

    # React setup: Create a new React app in the public/${DOMAIN} folder
    cd "public" && yarn create react-app "${DOMAIN}"
    echo "React app setup completed for ${DOMAIN} in 'public/${DOMAIN}'."

else
    echo "Invalid system choice. Please choose 'php' or 'react'."
    exit 1
fi
echo "Presetup finished successfully"

#7: ERMIS Install Ermis Node.js dependencies if node_modules doesn't exist
if [ ! -d "ermis/node_modules" ]; then
    echo "Ermis Node.js dependencies not found. Installing..."
    cd ermis && yarn install
    echo "Ermis Node.js dependencies installed."
    # Start Ermis using nodemon
    nodemon start
else
    echo "Ermis Node.js dependencies already installed."
fi

#8: VENUS Install Venus Node.js dependencies if node_modules doesn't exist
if [ ! -d "venus/node_modules" ]; then
    echo "Venus Node.js dependencies not found. Installing..."
    cd venus && yarn install
    echo "Venus Node.js dependencies installed."
else
    echo "Venus Node.js dependencies already installed."
fi

#9: Install Kronos Python virtualenv if newenv doesn't exist
if [ ! -d "kronos/newenv" ]; then
    echo "Kronos virtual environment not found. Creating new virtualenv and installing dependencies..."
    cd kronos
    if ! command -v python3 &>/dev/null; then
        echo "Python 3 is not installed. Please install Python 3."
        exit 1
    else
        echo "Python 3 is installed."
    fi
    # Check if venv is installed (for Python 3)
    if ! python3 -m venv --help &>/dev/null; then
        echo "venv is not installed. Installing python3-venv..."
        sudo apt update
        sudo apt install -y python3-venv
        echo "venv installed successfully."
    else
        echo "venv is already installed."
    fi

    python3 -m venv newenv
    source newenv/bin/activate
    pip install -r requirements.txt
    echo "Kronos virtual environment set up and dependencies installed."
    echo "Starting Kronos with Uvicorn..."
    cd kronos
    source newenv/bin/activate
    nohup uvicorn main:app --host 0.0.0.0 --port 3006 --reload &
    deactivate
    cd ${CURRENT_DIR}
else
    echo "Kronos virtual environment already exists."
fi

#10 Permissions find nginx user Directories to 755 (rwxr-xr-x) Files to 644 (rw-r--r--)
find ${CURRENT_DIR} -type d -exec chmod 755 {} \;
find ${CURRENT_DIR} -type f -exec chmod 644 {} \;
# Extract user from /etc/nginx/nginx.conf
USER=$(grep -oP '^user\s+\K\w+' /etc/nginx/nginx.conf)

# Check if the user was found
if [ -z "$USER" ]; then
    echo "Error: Could not find Nginx user in /etc/nginx/nginx.conf"
    exit 1
fi
# Set the correct ownership for the directory and its contents
sudo chown -R "$USER:$USER" "${CURRENT_DIR}"
echo "Permissions and ownership set for ${CURRENT_DIR} using user $USER."

echo "Presetup finished successfully."