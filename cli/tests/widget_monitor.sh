#!/bin/bash

# Directory to monitor (recursively)
MONITOR_DIR="/var/www/gs/public/cubos"

# Database credentials
DB_USER="root"
DB_PASS="n130177!"
DB_NAME="gen_admin"
DB_HOST="localhost"

process_changes() {
    local path="$1"
    local action="$2"
    local file="$3"
    echo "Processing change: $path $action $file" >> /var/log/widget_monitor_debug.log
    widget_name=$(basename "$(dirname "$path")")
    widget_id=$(mysql -u $DB_USER -p$DB_PASS -h $DB_HOST -se "SELECT id FROM cubos WHERE name='$widget_name'" $DB_NAME)
    if [ -z "$widget_id" ]; then
        mysql -u $DB_USER -p$DB_PASS -h $DB_HOST $DB_NAME <<EOF
        INSERT INTO cubos (name) VALUES ('$widget_name');
EOF
        widget_id=$(mysql -u $DB_USER -p$DB_PASS -h $DB_HOST -se "SELECT id FROM cubos WHERE name='$widget_name'" $DB_NAME)
    fi
    mysql -u $DB_USER -p$DB_PASS -h $DB_HOST $DB_NAME <<EOF
    INSERT INTO cubos_logs (widget_id, file, action, timestamp)
    VALUES ('$widget_id', '$file', '$action', NOW())
    ON DUPLICATE KEY UPDATE 
    file='$file', action='$action', timestamp=NOW();
EOF
}

inotifywait -m -r -e modify,create,delete "$MONITOR_DIR" |
while read -r path action file; do
    echo "Detected $action on $path$file" >> /var/log/widget_monitor_debug.log
    process_changes "$path" "$action" "$file"
done
