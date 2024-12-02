#!/bin/bash

# Root of the app
ROOT_DIR="/GEN20-console-app"

# Create directories
mkdir -p $ROOT_DIR/{bin,services,resources,configs,src/{core,ui,api},tests,docs}

# Create subdirectories for services
mkdir -p $ROOT_DIR/services/{AI,DB,Monitoring,Network}

# Create config subdirectories
mkdir -p $ROOT_DIR/configs/systemd

# Create deploy subdirectories
mkdir -p $ROOT_DIR/deploy/proxmox-vm

# Add sample scripts in bin
cat << 'EOL' > $ROOT_DIR/bin/install.sh
#!/bin/bash
# Installation script
echo "Setting up the system..."
# Your installation commands here
EOL

cat << 'EOL' > $ROOT_DIR/bin/builder.sh
#!/bin/bash
# Builder script for packaging and deployment
echo "Building the application..."
# Your building commands here
EOL

cat << 'EOL' > $ROOT_DIR/bin/logs.sh
#!/bin/bash
# Log management script
echo "Collecting logs..."
# Your log management commands here
EOL

cat << 'EOL' > $ROOT_DIR/bin/versioning.sh
#!/bin/bash
# Versioning management script
echo "Managing versioning..."
# Your versioning commands here
EOL

cat << 'EOL' > $ROOT_DIR/bin/kronos.sh
#!/bin/bash
# GPY service handler
echo "Running GPY services..."
# Your GPY commands here
EOL

cat << 'EOL' > $ROOT_DIR/bin/ermis.sh
#!/bin/bash
# ermis service handler
echo "Running ermis services..."
# Your ermis commands here
EOL

# Add sample service structure
cat << 'EOL' > $ROOT_DIR/services/AI/README.md
# AI Services
This directory will contain all AI-related microservices.
EOL

cat << 'EOL' > $ROOT_DIR/services/DB/README.md
# Database Services
This directory will contain all database-related microservices.
EOL

cat << 'EOL' > $ROOT_DIR/services/Monitoring/README.md
# Monitoring Services
This directory will contain performance, health checks, and log collectors.
EOL

cat << 'EOL' > $ROOT_DIR/services/Network/README.md
# Networking Services
This directory will contain networking services such as Nginx or HAProxy.
EOL

# Create a docker-compose.yml in configs
cat << 'EOL' > $ROOT_DIR/configs/docker-compose.yml
version: '3'
services:
  app:
    image: myapp:latest
    ports:
      - "8080:8080"
    volumes:
      - ./src:/app
    networks:
      - app-net
networks:
  app-net:
    driver: bridge
EOL

# Add basic README for deploy
cat << 'EOL' > /var/www/gs/setup/proxmox-vm/README.md
# Proxmox VM Deployment
This directory contains the necessary scripts to provision a VM in Proxmox.
EOL

# Create a sample source code file
cat << 'EOL' > $ROOT_DIR/src/core/app.php
<?php
// Core PHP Class
class App {
  public function run() {
    echo "Running core application...";
  }
}
?>
EOL

# Add sample documentation
cat << 'EOL' > $ROOT_DIR/docs/README.md
# GEN20 Console Application
This directory contains the documentation for the console application.
EOL

# Set execute permissions for scripts
chmod +x $ROOT_DIR/bin/*.sh

echo "Directory structure and initial setup completed!"
