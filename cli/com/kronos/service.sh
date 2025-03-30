#!/bin/bash

# Load environment variables
source /var/www/gs/.env
echo $GSROOT
# Parameters: $1=name, $2=new or delete
SERVICE_NAME=$1
ACTION=$2
SERVICE_PATH="$GSROOT/kronos/services/$SERVICE_NAME"
cd "$GSROOT/kronos"

# Check if SERVICE_NAME and ACTION are passed
if [ -z "$SERVICE_NAME" ] || [ -z "$ACTION" ]; then
    echo "Usage: $0 <service_name> <new|delete>"
    exit 1
fi

# Create a new service
if [ "$ACTION" = "new" ]; then
    mkdir -p "$SERVICE_PATH" || { echo "Failed to create service directory"; exit 1; }
    touch "$SERVICE_PATH/start.py" "$SERVICE_PATH/routes.py" "$SERVICE_PATH/__init__.py"

    # Add content to start.py, routes.py, and __init__.py (Optional)
    echo "# Start file for $SERVICE_NAME service" > "$SERVICE_PATH/start.py"
    echo "# Routes file for $SERVICE_NAME service" > "$SERVICE_PATH/routes.py"
    echo -e "from fastapi import APIRouter\n\nrouter = APIRouter()\n\n@router.get('/')\ndef read_root():\n    return {'message': 'Welcome to $SERVICE_NAME'}" > "$SERVICE_PATH/routes.py"
    echo "# Init file for $SERVICE_NAME service" > "$SERVICE_PATH/__init__.py"

    # Update the database (use correct credentials)
    echo "Updating the database..."
    $QUERY="INSERT INTO $INTEGRATION_TABLE (systemsid, status, name) VALUES (7, 1, '$SERVICE_NAME');"
    echo $QUERY
    mysql -u "$DB_USER" -p"$DB_PASS" -h "$DB_HOST" -D "$DB_NAME" -e $QUERY || { echo "Database update failed"; exit 1; }

    # Update the main FastAPI app with the new service integration
    echo "Updating main app..."
    sed -i "/#integrations/a from services.$SERVICE_NAME.routes import router as ${SERVICE_NAME}_route" main.py
    sed -i "/#includes/a app.include_router(${SERVICE_NAME}_route, prefix=\"/apy/v1/$SERVICE_NAME\")" main.py

    echo "Service $SERVICE_NAME created successfully."

# Delete an existing service
elif [ "$ACTION" = "delete" ]; then
    # Remove the service folder
    echo "Deleting service $SERVICE_NAME..."
    rm -rf "$SERVICE_PATH" || { echo "Failed to delete service directory"; exit 1; }

    # Remove from the database (use correct credentials)
    echo "Removing from database..."
    mysql -u "$DB_USER" -p"$DB_PASS" -h "$DB_HOST" -D "$DB_NAME" -e "DELETE FROM $INTEGRATION_TABLE WHERE name='$SERVICE_NAME';" || { echo "Failed to remove service from database"; exit 1; }

    # Remove the lines from main.py
    echo "Updating main app..."
    sed -i "/from services.$SERVICE_NAME.routes import router as ${SERVICE_NAME}_route/d" main.py
    sed -i "/app.include_router(${SERVICE_NAME}_route, prefix=\"\/apy\/v1\/$SERVICE_NAME\")/d" main.py

    echo "Service $SERVICE_NAME deleted successfully."

else
    echo "Invalid action: $ACTION. Use 'new' or 'delete'."
    exit 1
fi
