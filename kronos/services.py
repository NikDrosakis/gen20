import os
import subprocess
import re
from fastapi import FastAPI, WebSocket
from core.Maria import Maria
app= FastAPI();

# Load environment variables from .env
def load_env_variables():
    if os.path.exists('.env'):
        with open('.env', 'r') as f:
            for line in f.readlines():
                if line.strip() and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value

# Helper function to log messages
def log(message):
    print(f"[INFO] {message}")

# Helper function to execute MySQL commands
mariadmin = Maria("gen_admin")

# Function to retrieve all existing action names
def get_existing_action_names():
    query = """
        SELECT action.id, action.names, systems.id as system_id,systems.name AS system, actiongrp.id as actiongrp_id,actiongrp.name AS actiongrp
        FROM action
        LEFT JOIN actiongrp ON action.actiongrpid = actiongrp.id
        LEFT JOIN systems ON action.systemsid = systems.id
    """
    results = mariadmin.fa(query)
    return results

# Function to parse router.py and extract endpoints
def parse_router_file(router_file):
    endpoints = []
    if os.path.exists(router_file):
        with open(router_file, 'r') as file:
            content = file.read()
            # Regex to find @router.get(), @router.post(), etc.
            routes = re.findall(r"@router\.(\w+)\([\"'](/[^\"']+)[\"']\)", content)
            endpoints = [f"{method.upper()}_{route}" for method, route in routes]
    return endpoints

# Define directories
ROOT = os.getcwd()
CUBO_DIR = os.path.join(ROOT, 'cubos')
KRONOS_SERVICES = os.path.join(ROOT, 'kronos', 'services')
ERMIS_SERVICES = os.path.join(ROOT, 'ermis', 'services')
GOD_SERVICES = os.path.join(ROOT, 'god', 'services')

# Handle services
def handle_services():
    log("Checking and updating services for Kronos, Ermis, and God...")

    # Get all existing action names
    existing_action_names = get_existing_action_names()

    # Loop through services directories
    for system_dir in [KRONOS_SERVICES, ERMIS_SERVICES, GOD_SERVICES]:
        # Extract SYSTEM_NAME from the folder structure
        system_name = system_dir.split(os.sep)[-2]

        # Loop through each service folder
        for service_dir in system_dir:
            service_path = os.path.join(system_dir, service_dir)
            if os.path.isdir(service_path):
                service_name = service_dir
                log(f"Processing service: {service_name} in {system_name}")

                # Parse the router file based on the system
                if system_name == 'kronos':
                    router_file = os.path.join(service_path, 'router.py')
                elif system_name == 'ermis':
                    router_file = os.path.join(service_path, 'routes.js')
                elif system_name == 'god':
                    router_file = os.path.join(service_path, 'routes.go')

                # Get the endpoints from the router file
                endpoints = parse_router_file(router_file)

                # For each endpoint, construct a unique action name
                for endpoint in endpoints:
                    action_name = f"{service_name}_{system_name}_{endpoint}"

                    # If this action name is not already in the database, insert it
                    if action_name not in existing_action_names:
                        query = f"""
                            -- Insert into actiongrp and get the ID
                            INSERT IGNORE INTO actiongrp (name, type)
                            VALUES ('{service_name}', 'service');

                            -- Use the ID for the next query
                            INSERT INTO action (names, actiongrpid, systemsid, type, status)
                            VALUES (
                                '{action_name}',
                                COALESCE(
                                    (SELECT id FROM actiongrp WHERE name='{service_name}' LIMIT 1),
                                    LAST_INSERT_ID()
                                ),
                                (SELECT id FROM systems WHERE name='{system_name}'),
                                'route',
                                'testing'
                            );
                        """
                        mariadmin.fa(query)
                        existing_action_names.add(action_name)

# Main function to run the script
def main():
    load_env_variables()
    handle_services()
    log("\n".join([str(route) for route in app.routes]))

if __name__ == "__main__":
    main()
