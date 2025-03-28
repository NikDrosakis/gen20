#!/bin/bash
#VERSION - GITHUB - SETUP - BACKUP - RUN WORKFLOWS
# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi
#read commit message from first param
COMMIT_MESSAGE=$1
# Check if Git is installed; if not, install it
if ! command -v git &> /dev/null; then
    echo "[INFO] Git not found. Installing Git..."
    sudo apt update && sudo apt install git -y
    echo "[INFO] Git installed successfully."
else
    echo "[INFO] Git is already installed."
fi

# Navigate to the project directory
cd "$GSROOT" || { echo "[ERROR] Project directory not found."; exit 1; }

# Add the directory to Git's safe list if necessary
echo "[INFO] Checking safe.directory for $GSROOT..."
git config --global --add safe.directory "$GSROOT"
git config --global user.email "$DEV_EMAIL"
git config --global user.name "$GIT_USER"

# Display configuration for verification
echo "[INFO] Verifying Git configuration..."
#git config --list | grep -E "user\.email|user\.name|safe\.directory"

echo "[INFO] Git configuration complete."

# Initialize Git if not already initialized
if [ ! -d ".git" ]; then
    echo "[INFO] Git repository not found. Initializing repository..."
    git init
fi

# Check if the branch exists; if not, create 'main'
CURRENT_BRANCH=$(git branch --show-current)
if [ -z "$CURRENT_BRANCH" ]; then
    echo "[INFO] No branch detected. Creating '$BRANCH_NAME' branch..."
    git checkout -b $BRANCH_NAME
else
    echo "[INFO] Current branch: $CURRENT_BRANCH"
fi

# Check if the remote repository is configured; if not, set it
REMOTE_URL=$(git remote get-url origin 2>/dev/null)

if [ -z "$REMOTE_URL" ]; then
    echo "[INFO] Remote repository not found. Adding remote..."
    git remote add origin "$REPO_URL"
    echo "[INFO] Remote repository set to $REPO_URL"
else
    echo "[INFO] Remote repository already configured: $REMOTE_URL"
fi

# Verify if the remote repository matches 'gen20.git'
if [[ "$REMOTE_URL" != *"$EXPECTED_REPO"* ]]; then
    echo "[ERROR] Remote repository does not match $EXPECTED_REPO. Please verify."
    exit 1
else
    echo "[INFO] Verified repository matches $EXPECTED_REPO."
fi

# TODO: Fetch the next version number (+0.01 from current version)
# Step 1 > Get the new NEW_VERSION from the database (e.g., gen_admin.versions.version_tag)
NEW_VERSION=$(mariadb -u"$DB_USER" -p"$DB_PASS" -D"$DB_ADMINAME" -se "SELECT MAX(version_tag) + 0.001 FROM version")

# Check if NEW_VERSION is empty or not a valid decimal
if ! [[ "$NEW_VERSION" =~ ^[0-9]+(\.[0-9]+){1,2}$ ]]; then
    echo "Failed to get the new version number. Exiting."
    exit 1
fi

# Get the latest commit message and total changes count
LATEST_COMMIT_MESSAGE=$(git log -1 --pretty=%B)
TOTAL_CHANGES=$(git rev-list --count HEAD)


# TODO: Ensure that the GPG key is available for signing commits
# Ensure GPG key is imported and available
echo "[INFO] Ensuring GPG key is available..."
#curl -sSL https://github.com/nikosdrosakis.gpg | gpg --import
# Set the GPG key for Git to sign commits automatically
# Set the GPG key for Git to sign commits automatically
#git config --global --add safe.directory "$GSROOT"
git config --global user.email "$DEV_EMAIL"
git config --global user.name "$GIT_USER"
if ! git config --global --list | grep -q "safe.directory=/var/www/gs"; then
  # Add the directory only if it's not already present
  git config --global --add safe.directory /var/www/gs
  echo "[INFO] Added /var/www/gs to safe.directory"
fi
git config --global user.signingkey "$GPG_KEY_ID"
git config --global commit.gpgsign false
git config --global credential.helper store

# Set up the Git remote with the token
REPO_URL="https://${ACCESS_TOKEN}@github.com/${GIT_USER}/${EXPECTED_REPO}.git"
git remote set-url origin "$REPO_URL"

# Display the configured settings for confirmation
echo "[INFO] Git configuration for signing commits:"
#git config --global --list
echo "[INFO] GPG key ID: $GPG_KEY_ID"
echo "[INFO] GPG Email: $DEV_EMAIL"
echo "[INFO] Git User: $GIT_USER"


# Verify if GPG Key is available and list keys
echo "[INFO] List of GPG keys:"
gpg --list-secret-keys --keyid-format=long
echo "[INFO] Checking if GPG Agent is running..."
eval $(gpg-agent --daemon)
if pgrep gpg-agent > /dev/null; then
    echo "[INFO] GPG agent is running."
else
    echo "[ERROR] GPG agent is NOT running."
    exit 1
fi
# Check the path to gpg executable
echo "[INFO] Path to GPG executable:"
git config --global gpg.program

if [[ -z "$GPG_KEY_ID" || -z "$DEV_EMAIL" || -z "$GIT_USER" ]]; then
    echo "[ERROR] Environment variables related to git are not set."
    exit 1;
fi


# Step 4 > Tag, Commit, and Push the changes
# Check if the tag already exists
if git rev-parse "$NEW_VERSION" >/dev/null 2>&1; then
    echo "[INFO] Tag $NEW_VERSION already exists. Skipping tag creation."
else
    git tag "$NEW_VERSION"
    echo "[INFO] Tag $NEW_VERSION created."
fi
git add .
git commit -S${GPG_KEY_ID} -m "$COMMIT_MESSAGE"
# Push changes and tag to GitHub
git push origin "$BRANCH_NAME"
#git push origin "$NEW_VERSION"

# TODO: Check if git push fails and prevent further steps
if [ $? -ne 0 ]; then
    echo "[ERROR] Git push failed. Exiting."
    exit 1
fi

# TODO: Insert the new version into the database
# Step 5 > Insert the new version into the database
MYSQL_QUERY="INSERT INTO version (version_tag, title, summary, total_changes) VALUES ($NEW_VERSION, '$COMMIT_MESSAGE', '$LATEST_COMMIT_MESSAGE', $TOTAL_CHANGES);"
mariadb -u$DB_USER -p$DB_PASS -h$DB_HOST -D$DB_ADMINAME -e "$MYSQL_QUERY"
echo "Version tag updated successfully."

# TODO: Backup SQL and Files
# Step 6 > Backup SQL and Files
DUMP_DIR="setup/maria"
SQL_FILE="${DUMP_DIR}/gen_public_${NEW_VERSION}.sql"
ADMIN_SQL_FILE="${DUMP_DIR}/gen_admin_${NEW_VERSION}.sql"
mariadb-dump -u $DB_USER -p$DB_PASS --no-data --triggers --routines --events --create-options --no-set-names --add-drop-table=false $DB_ADMINAME > $SQL_FILE
mariadb-dump -u $DB_USER -p$DB_PASS --no-set-names --triggers --routines --events --create-options --add-drop-table=false $DB_ADMINAME > $ADMIN_SQL_FILE

# TODO: Check if the SQL files are successfully created and writable
if [ ! -e "$SQL_FILE" ] || [ ! -w "$SQL_FILE" ]; then
    echo "File does not exist or is not writable: $SQL_FILE"
    exit 1
else
    echo "SQL presetup file $SQL_FILE created"
fi

# TODO: Backup the filesystem excluding certain directories
# Backup the filesystem, excluding directories like node_modules
MYSQL_QUERY="INSERT INTO version (version_tag, title, summary, total_changes) VALUES ('$NEW_VERSION', '$(echo "$COMMIT_MESSAGE" | sed "s/'/''/g")', '$(echo "$LATEST_COMMIT_MESSAGE" | sed "s/'/''/g")', $TOTAL_CHANGES);"
mariadb -u$DB_USER -p$DB_PASS -h$DB_HOST -D$DB_ADMINAME -e "$MYSQL_QUERY"
echo "Version tag updated successfully."

tar --exclude='*/node_modules/*' --exclude='./genenv' -czf "/var/www/gs/backup/gen_backup_${NEW_VERSION}.tar.gz" /var/www/gs
echo "Filesystem backup completed."

