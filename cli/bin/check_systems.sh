#!/bin/bash

# Define the endpoints and expected responses
declare -A endpoints
endpoints["vivalibro"]="https://vivalibro.com"
endpoints["admin"]="https://vivalibro.com/admin"
endpoints["api"]="https://vivalibro.com/api/v1/maria/fa"
endpoints["kronos"]="https://vivalibro.com/apy/v1"
endpoints["ermis"]="https://vivalibro.com/ermis/v1"

# Function to check HTTP status
check_http_status() {
    local url=$1
    local expected_status=$2
    echo "Checking $url"
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    if [ "$status_code" -eq "$expected_status" ]; then
        echo "Success: $url returned status $status_code"
    else
        echo "Error: $url returned status $status_code"
    fi
}

# Function to check API POST request
check_api_post() {
    local url=$1
    local post_data=$2
    local expected_status=$3
    echo "POST to $url with data: $post_data"
    local response=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d "$post_data" "$url")
    if [ "$response" -eq "$expected_status" ]; then
        echo "Success: POST to $url returned status $response"
    else
        echo "Error: POST to $url returned status $response"
    fi
}

# Perform checks
echo "Performing health checks..."
check_http_status "${endpoints["vivalibro"]}" 200
check_http_status "${endpoints["admin"]}" 200
check_api_post "${endpoints["api"]}" '{"SELECT * from user"}' 200
check_http_status "${endpoints["kronos"]}" 200
check_http_status "${endpoints["ermis"]}" 200

echo "Health checks completed."
echo "Press any key to continue..."
read -n 1

