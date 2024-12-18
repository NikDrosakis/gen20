#!/bin/bash

# Database credentials
DB_USER="root"
DB_PASS="n130177!"
DB_NAME="gen_admin"
DB_HOST="localhost"

# Directory where widgets are stored
WIDGETS_DIR="/var/www/vivalibro/web/widgets"

# Function to process each widget
process_widget() {
    local widget_name="$1"
    local last_update_time="$2"
    local new_version="$3"

    # Path to the widget directory
    local widget_dir="$WIDGETS_DIR/$widget_name"
    local update_log_file="$widget_dir/update.log"

    # Check if the widget exists; if not, insert it
    mysql -u $DB_USER -p$DB_PASS -h $DB_HOST $DB_NAME <<EOF
    INSERT INTO widgets (name, version, created) 
    SELECT '$widget_name', 0.01, NOW() 
    WHERE NOT EXISTS (SELECT 1 FROM widgets WHERE name='$widget_name');
EOF

    # Find files in the widget directory that have been modified after the last update time, excluding update.log
    modified_files=$(find "$widget_dir" -type f ! -name "update.log" -newermt "$last_update_time")
	
    # If there are modified files, process them
    if [ -n "$modified_files" ]; then
        # Get the latest modification time among the modified files
        latest_mod_time=$(stat -c %y $(echo "$modified_files" | sort | tail -n 1))
		
        # Append changes to the update.log file
        echo "------------------------Version $new_version------------------------" >> "$update_log_file"
while read -r file; do
    if [ -n "$file" ] && [ "$(basename "$file")" != "update.log" ]; then
        file_name=$(basename "$file")
        mod_time=$(stat -c %y "$file" | cut -d'.' -f1)  # Format the modification time
        
        # Retrieve creation time (if available) and format it
        creation_time=$(stat -c %W "$file")
        if [ "$creation_time" -eq 0 ]; then
            creation_time="1970-01-01 00:00:00"  # Fallback if creation time is not available
        fi

        creation_time=$(date -d "@$creation_time" "+%Y-%m-%d %H:%M:%S")
        
        # Determine if the file is new or updated
        if [[ "$mod_time" > "$last_update_time" ]]; then
            if [[ "$creation_time" > "$last_update_time" ]]; then
                echo "++$file_name $mod_time" >> "$update_log_file"  # New file
            else
                echo "+$file_name $mod_time" >> "$update_log_file"  # Updated file
            fi
        fi
    fi
done <<< "$modified_files"

        # Update the widget_log table
        summary=$(echo "$modified_files" | xargs -I{} basename {} | tr '\n' ', ')
        summary=${summary::-2} # Remove the trailing comma and space

        mysql -u $DB_USER -p$DB_PASS -h $DB_HOST $DB_NAME <<EOF
        INSERT INTO cubo_actions (widget_id, version, summary, modified) 
        VALUES (
            (SELECT id FROM widgets WHERE name='$widget_name'), 
            '$new_version', 
            '$summary', 
            NOW()
        );
EOF

        # Update the widgets table with the new version and latest modification time
        mysql -u $DB_USER -p$DB_PASS -h $DB_HOST $DB_NAME <<EOF
        UPDATE widgets 
        SET version='$new_version', modified='$latest_mod_time' 
        WHERE name='$widget_name';
EOF
    fi
}

# Read all widgets in the directory and process them
find "$WIDGETS_DIR" -mindepth 1 -maxdepth 1 -type d | while read -r widget_dir; do
    widget_name=$(basename "$widget_dir")

    # Get the most recent modification time of any file in the widget's directory
    last_update_time=$(mysql -u $DB_USER -p$DB_PASS -h $DB_HOST -se "SELECT modified FROM widgets WHERE name='$widget_name'" $DB_NAME)

    # Fetch the current version from the database
    current_version=$(mysql -u $DB_USER -p$DB_PASS -h $DB_HOST -se "SELECT version FROM cubo_actions WHERE widget_id = (SELECT id FROM widgets WHERE name='$widget_name') ORDER BY modified DESC LIMIT 1;" $DB_NAME)
    
    # If there's no current version, start at 0.01
    if [ -z "$current_version" ]; then
        new_version="0.01"
    else
        # Increment the current version by 0.01 using awk for precision arithmetic
        new_version=$(echo "$current_version" | awk '{printf "%.2f", $1 + 0.01}')
    fi

    # Call the process_widget function
    process_widget "$widget_name" "$last_update_time" "$new_version"
done
