#!/bin/bash

# Load environment variables
if [ -f ./cli/configs/.env ]; then
    export $(grep -v '^#' ./cli/configs/.env | xargs)
fi
SCRIPT_NAME=$(basename "$0")
echo $SCRIPT_NAME;
# Get enabled status from the database
ENABLED=$(mysql -u"$DB_USER" -p"$DB_PASS" -h"$DB_HOST" -D"$DB_NAME" -se "SELECT enabled FROM cron_jobs WHERE script_name='$SCRIPT_NAME'")

# Exit if the script is not enabled
if [[ "$ENABLED" -eq 0 ]]; then
    echo "Cron job '$0' is disabled. Exiting."
    exit 0
else
      echo "Cron job '$0' is enabled."
fi


# logging.sh is a cron running every one hour so as to get the changes (without pushing remote)
#for each root folder of  that it is project
# STEP 1 perform  git add (and need to commit??? to get from git log)
# get last current max version_tag froom database
# INSERT INTO system_log changes and diff for separate folders in GEN20.git locally in /var/www/gs

# Detailed Commit Information in column summary for each (/var/www/gs/)folder=(system.name)
#INSERT INTO
# CREATE TABLE `system_log` (
  # `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  # `systemsid` int(10) UNSIGNED NOT NULL,
  # `version_tag` decimal(5,2) UNSIGNED NOT NULL DEFAULT 0.00,
  # `summary` longtext DEFAULT NULL,
  # `files_changed` mediumint(8) UNSIGNED NOT NULL DEFAULT 0,
  # `created` datetime NOT NULL DEFAULT current_timestamp()
# ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

# CREATE TABLE `systems` (
  # `id` smallint(10) UNSIGNED NOT NULL,
  # `name` varchar(100) NOT NULL,
  # `created` datetime NOT NULL DEFAULT current_timestamp(),
  # `modified` datetime NOT NULL DEFAULT current_timestamp(),
  # `version` decimal(5,2) UNSIGNED NOT NULL DEFAULT 0.00,
  # `description` text DEFAULT NULL,
  # `engineer` text DEFAULT NULL,
  # `capabilities` text DEFAULT NULL,
  # `experience` text DEFAULT NULL,
  # `construction_level` smallint(6) DEFAULT 0
# ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
# INSERT INTO `systems` (`id`, `name`, `created`, `modified`, `version`, `description`, `engineer`, `capabilities`, `experience`, `scalability_level`, `construction_level`) VALUES
# (1, 'vivalibro', '2024-08-28 00:00:03', '2024-08-28 03:43:41', 0.00, 'Vivalibro Web Application', 'Nik Drosakis', 'Frontend User Interface and Book Management', 'React, JavaScript, HTML, CSS', 'Medium', 80),
# (2, 'vlmob', '0000-00-00 00:00:00', '2024-08-28 03:43:41', 0.00, 'Vivalibro Mobile Application', 'Nik Drosakis', 'Mobile UI and Book Scanning', 'React Native, JavaScript', 'High', 60),
# (3, 'ermis', '0000-00-00 00:00:00', '2024-08-28 03:43:41', 0.00, 'API Web Services', 'Nik Drosakis', 'Provides API endpoints for data access and interactions', 'Node.js, Express.js, RESTful APIs', 'High', 90),
# (4, 'gen_admin', '0000-00-00 00:00:00', '2024-08-28 03:43:41', 0.00, 'Gaia Package Manager', 'Nik Drosakis', 'Manages project dependencies and automation', 'Shell scripting, Package Management', 'Low', 50),
# (5, 'admin', '0000-00-00 00:00:00', '2024-08-28 03:43:41', 0.00, 'Administration Panel', 'Nik Drosakis', 'Provides administrative tools for managing the application', 'PHP, MySQL, HTML, CSS', 'Medium', 70),
# (6, 'poetabook', '2024-08-27 15:00:50', '2024-08-28 03:43:41', 0.00, 'Poetabook Web Application', 'Nik Drosakis', 'Frontend UI for poetry management', 'React, JavaScript, HTML, CSS', 'Medium', 40),
# (7, 'kronos', '2024-08-27 23:18:07', '2024-08-28 03:43:41', 0.00, 'API with Python', 'Nik Drosakis', 'Provides API endpoints using Python', 'Python, Flask, RESTful APIs', 'Medium', 30),
# (8, 'games', '2024-08-28 01:29:51', '2024-08-28 03:43:41', 0.00, 'Games Module', 'Nik Drosakis', 'Provides games capabilities (chess, etc.)', 'JavaScript, Game Development Frameworks', 'Low', 20),
# (9, 'cubos', '2024-08-28 01:29:51', '2024-08-28 03:43:41', 0.00, 'Widgets of VLWEB VLMOB PBWEB PBMOB decoupled in /cubos', 'Nik Drosakis', 'Provides modular widgets', 'PHP class system integrated in ADMIN, controlled by GPM sybsystem', 'High', 20),
# (11, 'core', '2024-09-08 18:02:07', '2024-09-08 18:02:07', 0.00, 'PHP Classes, the core engine of GEN20\r\n', 'NikDrosakis', 'updated to 8.3, fully working', NULL, NULL, 3);

# Function to get the maximum version_tag from the database
version_tag() {
    mysql -u"$DB_USER" -p"$DB_PASS" -h"$DB_HOST" -D"$DB_NAME" -se "SELECT MAX(version_tag) FROM versions"
}
select_folder_by_id() {
    mysql -u"$DB_USER" -p"$DB_PASS" -h"$DB_HOST" -D"$DB_NAME" -se "SELECT github FROM systems WHERE id=$1"
}
select_all_gitfolders() {
    mysql -u"$DB_USER" -p"$DB_PASS" -h"$DB_HOST" -D"$DB_NAME" -N -e "SELECT id FROM systems WHERE github!='' "
}
# Function to insert a log entry into the system_log table
insert_log_entry() {
    local systemsid=$1
    local version_tag=$2
    local summary=$3
    local files_changed=$4
  mysql -u"$DB_USER" -p"$DB_PASS" -h"$DB_HOST" -D"$DB_NAME" -e "
    INSERT INTO system_log (systemsid, version_tag, summary, files_changed)
    VALUES ($systemsid, '$version_tag', '$summary', $files_changed)
    ON DUPLICATE KEY UPDATE
        summary = CONCAT(summary, '\n', '$summary'),
        files_changed = files_changed + $files_changed,
}

# Change to the repository directory
cd "$GSROOT" || exit 1
# Get the current max version_tag from the database
CURRENT_VERSION=$(version_tag)
# Loop through system IDs
for systemsid in $(select_all_gitfolders); do
    github=$(select_folder_by_id "$systemsid")

    # Add changes only in the specific folder (with trailing slash)
    git add "$github/"

    # Check if there are any staged changes in the current folder
    if ! git diff --cached --quiet -- "$github/"; then

        # Commit changes for the specific folder (with trailing slash)
        git commit -m "Update $github/" --quiet

        # Get commit summary for the specific folder (with trailing slash)
       # commit_summary=$(git log -1 --pretty=%B -- "$github/")
  commit_summary=$(git diff --name-status origin/main "$github/" | sed 's/^/    /' | sed 's/\t/   /')

        # Get files changed and new files for the specific folder (with trailing slash)
        files_changed=$(git diff --name-only HEAD~1 -- "$github/" | wc -l)

        # Insert the log entry
        insert_log_entry "$systemsid" "$CURRENT_VERSION" "$commit_summary" "$files_changed"
    fi
done

echo "Logging completed successfully."