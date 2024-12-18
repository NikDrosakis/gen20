if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

###> symfony/framework-bundle ###
APP_ENV=dev
APP_SECRET=c016250ceb22a9204b189aa201160522
GSROOT='/var/www/gs'
CLIROOT='/var/www/gs/cli'
DB_USER='root'
DB_PASS="n130177!"
DB_NAME="gen_admin"
DB_HOST="localhost"
INTEGRATION_TABLE="gpm.resources"
REPO_URL="https://github.com/NikDrosakis/GEN20.git"
ACCESS_TOKEN="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"
BACKUP_DIR="/var/www/backup"
SETUP_DIR="/var/www/gs/setup"

echo ${CLIROOT}
echo ${DB_PASS}
echo ${DB_HOST}