#!/bin/bash
# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi
 #debian12 shell script versioning.sh with two params  $1 for commit message to  # repository  https://github.com/NikDrosakis/GEN20.git
 # with GITHUB_ACCESS_TOKEN=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

#step 1 > get new  NEW_VERSION= from gen_admin.versions.version_tag get the next (+0.01) decimal

#step 2 > # COMMIT_MESSAGE= param $1
# git commit -m $2 to table gen_admin.versions.title, git tag NEW_VERSION gen_admin.version.version_tag
# git push to   # repository is https://github.com/NikDrosakis/GEN20.git

#step 3 > NEW_VERSION as version_tag (decimal) insert into gen_admin.versions

#CREATE TABLE `versions` (
 # `id` int(11) NOT NULL,
  #`version_tag` decimal(5,2) UNSIGNED NOT NULL DEFAULT 0.00,
  #`title` varchar(200) DEFAULT NULL,
  #`total_changes` mediumint(8) UNSIGNED NOT NULL DEFAULT 0,
  #`summary` longtext #from git summary
  #`created` datetime NOT NULL DEFAULT current_timestamp()
#) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci; 
# Check for required parameters
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <commit_message>"
    exit 1
fi
# Parameters
COMMIT_MESSAGE=$1
# Navigate to the local repository
cd "$GSROOT" || exit 1

#1: Get the new version number
NEW_VERSION=$(mysql -u$DB_USER -p$DB_PASS -D$DB_NAME -se "SELECT MAX(version_tag) + 0.001 FROM versions")
echo ${NEW_VERSION}

# Check if NEW_VERSION is empty or not a number
if ! [[ "$NEW_VERSION" =~ ^[0-9]+(\.[0-9]+){1,2}$ ]]; then
    echo "Failed to get the new version number. Exiting."
    exit 1
fi

#2: Get the latest commit summary and total changes
LATEST_COMMIT_MESSAGE=$(git log -1 --pretty=%B)
TOTAL_CHANGES=$(git rev-list --count HEAD)

# Commit and tag the new version
git tag "$NEW_VERSION"
git add .
git commit -m "$COMMIT_MESSAGE"

# Push changes and tag to GitHub
git push origin main --set-upstream origin main
#git push origin "$NEW_VERSION"


#3: Insert the new version into the database
MYSQL_QUERY="INSERT INTO versions (version_tag, title, summary, total_changes) VALUES ($NEW_VERSION, '$COMMIT_MESSAGE', '$LATEST_COMMIT_MESSAGE', $TOTAL_CHANGES);"
mysql -u$DB_USER -p$DB_PASS -h$DB_HOST -D$DB_NAME -e "$MYSQL_QUERY"

echo "Git pushed, Versioning completed successfully."

#4 download new version of db to mysqldump with IF NOT EXIST WITHOUT ALTER setup/maria/gen_${NEW_VERSION}.sql
DUMP_DIR="setup/maria/"
SQL_FILE="${DUMP_DIR}/gen_${NEW_VERSION}.sql"
mysqldump -u $DB_USER -p$DB_PASSWORD --no-set-names --skip-triggers --routines --create-options --if-exists $DB_NAME > $SQL_FILE