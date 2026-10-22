#!/bin/bash
#0 DOMAIN to CHOOSE ENVIRONMENT FOR SETUP IF LOCALHOST run docker-compose else continue
#1 PHP & MODULES INTALLATION, COMPOSER
#2 COMPOSER INSTALLATION
#3 MARIA INSTALLATION
#3A redis
# 3B mongo
#4 GENDB MYSQL INSTALLATION
#5 PUBLIC PHP OR REACT
#6 DB MYSQL
#TODO 6B REDIS
#TODO 6C MONGO
#7 ERMIS
#8 VENUS
#9 KRONOS
#10 MARS
#11 PERMISSIONS

#get .env vars
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi
IP=$(dig +short myip.opendns.com @resolver1.opendns.com)

#0 ENVIRONMENT choose server or docker environment
#Set the default domain to localhost for microservices if not already set
DOMAIN=${DOMAIN:-localhost}
echo "Using domain: $DOMAIN"

# TODO: Check if the environment is localhost or not and handle accordingly
if [[ "$DOMAIN" == "localhost" ]]; then
    echo "Environment is localhost. Proceeding with Docker Compose configuration from $ROOT/docker-compose.yml"
    if [ -f "$ROOT/docker-compose.yml" ]; then
        echo "Docker Compose file found. Running docker-compose..."
        docker-compose up -d
    else
        echo "docker-compose.yml file not found in $ROOT. Ensure it's in the correct location."
    fi
else
    # Check if the domain is reachable (ping the domain)
    echo "Checking if domain $DOMAIN is reachable..."
    if ping -c 1 "$DOMAIN" &> /dev/null; then
        echo "$DOMAIN is reachable. Continuing with the existing setup..."
    else
        echo "$DOMAIN is not reachable. Please check the domain or network connectivity."
        exit 1
    fi
fi

#Check if Composer is installed
if ! command -v composer &> /dev/null; then
    echo "Composer not found. Installing Composer..."
    curl -sS https://getcomposer.org/installer | php
    sudo mv composer.phar /usr/local/bin/composer
    echo "Composer installed successfully!"
else
    echo "Composer is already installed."
fi

#1 PHP Check for PHP Version > 8.0
PHP_VER=$(php -v 2>/dev/null | grep -oP '^PHP \K[0-9]+\.[0-9]+')
if [[ -z "$PHP_VER" || $(echo "$PHP_VER < 8.0" | bc) -eq 1 ]]; then
    echo "PHP 8.0+ is required. Do you want to install it? (yes/no)"
    read -r INSTALL_PHP
    if [[ "$INSTALL_PHP" == "yes" ]]; then
        sudo apt update
        sudo apt install -y php$PHP_VER php$PHP_VER-fpm php$PHP_VER-mysql
        sudo apt install -y \
 php$PHP_VER-bz2 php$PHP_VER-calendar php$PHP_VER-core php$PHP_VER-ctype php$PHP_VER-curl php$PHP_VER-date \
            php$PHP_VER-dom php$PHP_VER-exif php$PHP_VER-ffi php$PHP_VER-fileinfo php$PHP_VER-filter php$PHP_VER-ftp \
            php$PHP_VER-gd php$PHP_VER-gettext php$PHP_VER-hash php$PHP_VER-iconv php$PHP_VER-igbinary php$PHP_VER-imagick \
            php$PHP_VER-intl php$PHP_VER-json php$PHP_VER-libxml php$PHP_VER-mbstring php$PHP_VER-mcrypt php$PHP_VER-mongodb \
            php$PHP_VER-mysqli php$PHP_VER-mysqlnd php$PHP_VER-openssl php$PHP_VER-pcntl php$PHP_VER-pcre php$PHP_VER-pdo \
            php$PHP_VER-pdo-mysql php$PHP_VER-pdo-sqlite php$PHP_VER-phar php$PHP_VER-posix php$PHP_VER-random \
            php$PHP_VER-readline php$PHP_VER-redis php$PHP_VER-reflection php$PHP_VER-session php$PHP_VER-shmop \
            php$PHP_VER-simplexml php$PHP_VER-sockets php$PHP_VER-sodium php$PHP_VER-spl php$PHP_VER-sqlite3 php$PHP_VER-standard \
            php$PHP_VER-sysvmsg php8.2-redis php$PHP_VER-sysvsem php$PHP_VER-sysvshm php$PHP_VER-tokenizer php$PHP_VER-xml php$PHP_VER-xmlreader \
            php$PHP_VER-xmlwriter  php$PHP_VER-xsl php$PHP_VER-opcache php$PHP_VER-zip php$PHP_VER-zlib php$PHP_VER-dev
      sudo apt install -y php-yaml php-pear php-dev build-essential
      sudo pecl install mongodb
      sudo pecl install igbinary
      sudo pecl install redis
      sudo systemctl enable php$PHP_VER-fpm
      sudo systemctl start php$PHP_VER-fpm
        echo "PHP $PHP_VER & Modules installed successfully!"
    else
        echo "PHP 8.0+ is required. Exiting."
        exit 1
    fi
else
    echo "PHP version $PHP_VER is already installed."
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
REQUIRED_VERSION="11.4"

# Check if MariaDB/MySQL is installed and the version is detected
if [[ -z "$MYSQL_VERSION" ]]; then
    echo "MariaDB is not installed. Do you want to install it? (yes/no)"
    curl -LsS https://r.mariadb.com/downloads/mariadb_repo_setup | sudo bash -s -- --mariadb-server-version="mariadb-${REQUIRED_VERSION}"
    read -r INSTALL_MYSQL
    if [[ "$INSTALL_MYSQL" == "yes" ]]; then
        sudo apt update
        sudo apt install sudo apt-get install mariadb-server mariadb-client mariadb-backup
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

#3A REDIS
#3B MONGO
sudo apt install redis-server redis-tools

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

#6B
  apt install redis-server && pecl install redis

#6C
 apt install mongodb

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
        apt install python3-dev
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