#!/bin/bash

# Get port from command arguments (for "gen kill 3010", $3 would be 3010)
PORT="$2"

if [ -z "$PORT" ]; then
    echo "Usage: gen kill <PORT>"
    exit 1
fi

# Verify it's a number between 1-65535
if ! [[ "$PORT" =~ ^[0-9]+$ ]] || [ "$PORT" -lt 1 ] || [ "$PORT" -gt 65535 ]; then
    echo "Error: Port must be a number between 1 and 65535"
    exit 1
fi

# Find PIDs listening on the port
PIDS=$(lsof -ti :"$PORT" 2>/dev/null)

if [ -z "$PIDS" ]; then
    echo "No processes found running on port $PORT"
    exit 0
fi

echo "Found processes on port $PORT:"
ps -p "$PIDS" -o pid,user,command

read -p "Kill these processes? [y/N] " -n 1 -r
echo  # move to new line

if [[ "$REPLY" =~ ^[Yy]$ ]]; then
    echo "Killing processes..."
    # Kill processes one by one for better error handling
    for PID in $PIDS; do
        if kill -9 "$PID" 2>/dev/null; then
            echo "Killed PID $PID"
        else
            echo "Failed to kill PID $PID (no permission or already dead)"
        fi
    done
else
    echo "Aborted"
fi