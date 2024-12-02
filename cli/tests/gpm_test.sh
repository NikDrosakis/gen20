#!/bin/bash

# Database credentials
DB_USER="root"
DB_PASSWORD="n130177!"
DB_NAME="gen_admin"
DB_HOST="localhost"

# Directory where widgets are stored
WIDGETS_DIR="/var/www/cubos"


# Function to process each widget
process_widget() {
    local widget_name="$1"
    local last_update_time="$2"
    local version="$3"

    # Check if the widget exists; if not, insert it
    mysql -u $DB_USER -p$DB_PASSWORD -h $DB_HOST $DB_NAME <<EOF
    INSERT INTO widgets (name, version, created) 
    SELECT '$widget_name', 0.01, NOW() 
    WHERE NOT EXISTS (SELECT 1 FROM widgets WHERE name='$widget_name');
EOF

    # Path to the widget directory
    local widget_dir="$WIDGETS_DIR/$widget_name"
    local update_log_file="$widget_dir/update.log"

    echo "Processing widget: $widget_name"
    echo "Widget directory: $widget_dir"
    echo "Last update time: $last_update_time"
    echo "Version: $version"

    # Check if the widget directory exists
    if [ ! -d "$widget_dir" ]; then
        echo "Widget directory $widget_dir does not exist."
        return
    fi

    # Find files in the widget directory that have been modified after the last update time
    modified_files=$(find "$widget_dir" -type f ! -name "update.log" -newermt "$last_update_time")

    # Debug output
    echo "Modified files:"
    echo "$modified_files"

    # Append changes to the update.log file if there are modified files
    if [ -n "$modified_files" ]; then
        # Increment the version number        	
        new_version=$(printf "%.2f" "$new_version")

        echo "------------------------Version $new_version------------------------" >> "$update_log_file"

        while read -r file; do
            if [ -n "$file" ]; then
                file_name=$(basename "$file")
                mod_time=$(stat -c %y "$file" | cut -d'.' -f1)  # Format the modification time

                # Retrieve creation time (if available) and format it
                creation_time=$(stat -c %W "$file")
                if [ "$creation_time" -eq 0 ]; then
                    creation_time="1970-01-01 00:00:00"  # Fallback if creation time is not available
                else
                    creation_time=$(date -d "@$creation_time" "+%Y-%m-%d %H:%M:%S")
                fi

                echo "File: $file_name, Modification Time: $mod_time, Creation Time: $creation_time"  # Debugging line

                # Determine if the file is new or updated
                if [[ "$mod_time" > "$last_update_time" ]]; then
                    if [[ "$creation_time" > "$last_update_time" ]]; then
echo "++$file_name $mod_time"                        
echo "$update_log_file"  
					echo "++$file_name $mod_time" >> "$update_log_file"  # New file
                    else
echo "++$file_name $mod_time"  
echo "$update_log_file" 
                        echo "+$file_name $mod_time" >> "$update_log_file"  # Updated file
                    fi
                fi
            fi
        done <<< "$modified_files"

        echo "Update log has been updated."

        # Update the widget_log table
        summary=$(echo "$modified_files" | xargs -I{} basename {} | tr '\n' ', ')
        summary=${summary::-2} # Remove the trailing comma and space

        mysql -u $DB_USER -p$DB_PASSWORD -h $DB_HOST $DB_NAME <<EOF
        INSERT INTO cubo_actions (widget_id, version, summary, modified) 
        VALUES (
            (SELECT id FROM widgets WHERE name='$widget_name'), 
            '$new_version', 
            '$summary', 
            NOW()
        );
EOF

        # Update the widgets table with the new version and latest modification time
        mysql -u $DB_USER -p$DB_PASSWORD -h $DB_HOST $DB_NAME <<EOF
        UPDATE widgets 
        SET version='$new_version', modified='$latest_mod_time' 
        WHERE name='$widget_name';
EOF
    fi
}

# Example call to the function for testing
#process_widget "slideshow" "2024-08-18 15:10:00" "0.01"

# Read all widgets in the directory and process them
find "$WIDGETS_DIR" -mindepth 1 -maxdepth 1 -type d | while read -r widget_dir; do
    widget_name=$(basename "$widget_dir")

    # Get the most recent modification time of any file in the widget's directory
last_update_time=$(mysql -u $DB_USER -p$DB_PASSWORD -h $DB_HOST -se "SELECT modified FROM widgets WHERE name='$widget_name'" $DB_NAME)
    if [ -z "$last_update_time" ]; then
        last_update_time="1970-01-01 00:00:00"
    fi

    # Fetch the current version from the database
    current_version=$(mysql -u $DB_USER -p$DB_PASSWORD -h $DB_HOST -se "SELECT version FROM widgets WHERE name='$widget_name';" $DB_NAME)
    
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
