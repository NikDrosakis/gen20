#!/bin/bash
# Load environment variables
if [ -f ./cli/configs/.env ]; then
    export $(grep -v '^#' ./cli/configs/.env | xargs)
fi
#new ermis.sh
#param $1=name $2 new || delete
#if param $2=new
# add new service folder ./services/$1
# inside add new start.js  ./services
# inside add new routes.js  ./services
# insert maria.gpm.resources table with name=$1, status=1, systemsid = 3
# append line under //resources `const $1Router = require('./services/$1/start');`
# append line under #includes  `app.use('/api/v1/$1',$1Router);`
##If param $2=delete
# rm -rf ./services/$1
#update maria.gpm.resources table set status=0 ie deleted


# param $1=name, $2=new || delete
GSROOT="/var/www/gs"
SERVICE_NAME=$1
ACTION=$2
SERVICE_PATH="$GSROOT/ermis/services/$SERVICE_NAME"

# Check if name and action are passed
if [ -z "$SERVICE_NAME" ] || [ -z "$ACTION" ]; then
  echo "Usage: ./ermis.sh <service_name> <new|delete>"
  exit 1
fi

# Create a new service
if [ "$ACTION" = "new" ]; then
  # Create the new service folder structure
  mkdir -p $SERVICE_PATH
  touch "$SERVICE_PATH/start.js"
  touch "$SERVICE_PATH/routes.js"

  # Add content to start.js and routes.js (Optional)
  echo "// Start file for $SERVICE_NAME service" > "$SERVICE_PATH/start.js"
  echo "// Routes for $SERVICE_NAME service" > "$SERVICE_PATH/routes.js"
  echo -e "const express = require('express');\nconst router = express.Router();\n\nrouter.get('/', (req, res) => {\n  res.send('Welcome to $SERVICE_NAME service');\n});\n\nmodule.exports = router;" > "$SERVICE_PATH/routes.js"

  # Insert into the database (use correct credentials)
  echo "Updating the database..."
  mysql -u $DB_USER -p$DB_PASS -D $DB_NAME -e "INSERT INTO $INTEGRATION_TABLE (name, status, systemsid) VALUES ('$SERVICE_NAME', 1, 3);"

  # Update the main Node.js app with the new service integration
  echo "Updating main app..."
  sed -i "/\/\/resources/a const ${SERVICE_NAME}Router = require('./services/$SERVICE_NAME/routes');" app.js
  sed -i "/#includes/a app.use('/ermis/v1/$SERVICE_NAME', ${SERVICE_NAME}Router);" app.js

  echo "Service $SERVICE_NAME created successfully."

# Delete an existing service
elif [ "$ACTION" = "delete" ]; then
  # Remove the service folder
  echo "Deleting service $SERVICE_NAME..."
  rm -rf $SERVICE_PATH

  # Mark the service as deleted in the database (use correct credentials)
  echo "Updating database to mark the service as deleted..."
  mysql -u $DB_USER -p$DB_PASS -D $DB_NAME -e "UPDATE $INTEGRATION_TABLE SET status=0 WHERE name='$SERVICE_NAME';"

  # Remove the lines from app.js
  echo "Updating main app..."
  sed -i "/const ${SERVICE_NAME}Router = require('.\/services\/$SERVICE_NAME\/routes');/d" app.js
  sed -i "/app.use('\/ermis\/v1\/$SERVICE_NAME', ${SERVICE_NAME}Router);/d" app.js

  echo "Service $SERVICE_NAME deleted successfully."

else
  echo "Invalid action: $ACTION. Use 'new' or 'delete'."
  exit 1
fi
