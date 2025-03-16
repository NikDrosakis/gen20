#!/bin/bash
description="back gen20 fs, upload zip to google drive"
# Load environment variables from .env file
source /var/www/gs/cli/configs/.env

# Set variables
TIMESTAMP=$(date +"%Y-%m-%d")
VERSION=$(mysql -u $DB_USER -p$DB_PASS -D gen_admin -se "SELECT version FROM versions ORDER BY id DESC LIMIT 1;")
BACKUP_FILE="backup_$VERSION_$TIMESTAMP.zip"
DOCKER_COMPOSE_FILE="/var/www/gs/docker-compose.yml"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILE"

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Step a) Backup databases
echo "Backing up MySQL databases..."
mariadb-dump -u $DB_USER -p$DB_PASS --triggers --routines --databases vivalibro gen_admin > $BACKUP_DIR/mysql_dbs.sql

echo "Backing up Solr..."
mariadb-dump -u $DB_USER -p$DB_PASS solr_vivalibro > $BACKUP_DIR/solr_vivalibro.sql

echo "Backing up ArangoDB..."
#mongodump --db dros --out $BACKUP_DIR/dros

# Step b) Backup filesystem
echo "Backing up filesystem..."
zip -r $BACKUP_DIR/fs_backup.zip /var/www/gs -x "*.git*" "*.ignore"

# Step c) Copy Docker setup files
echo "Copying Docker setup files..."
cp $DOCKER_COMPOSE_FILE $BACKUP_DIR/
cp -r /var/www/gs/dockerfiles $BACKUP_DIR/dockerfiles

# Step d) Create the final backup ZIP file
echo "Creating backup ZIP..."
zip -r $BACKUP_PATH $BACKUP_DIR/*

# Step e) Upload to Google Drive and Dropbox (using rclone, install if not present)
echo "Uploading to Google Drive and Dropbox..."
rclone copy $BACKUP_PATH gdrive:/backups/
rclone copy $BACKUP_PATH dropbox:/backups/

# Clean up temporary files
echo "Cleaning up..."
rm -rf $BACKUP_DIR/mysql_dbs.sql $BACKUP_DIR/fs_backup.zip $BACKUP_DIR/dockerfiles

echo "Backup complete! File: $BACKUP_FILE"
