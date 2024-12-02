#!/bin/bash

# Name of your Uvicorn process (adjust if needed)
PROCESS_NAME="uvicorn main:app"

# Get the PID (process ID) of the Uvicorn process if it's running
PID=$(pgrep -f "$PROCESS_NAME")

if [ -z "$PID" ]; then
    echo "Starting Uvicorn..."
  #  source newenv/bin/activate  # Activate your virtual environment
    uvicorn main:app --host 0.0.0.0 --port 3006 --reload --log-level debug &  # Start in the background
else
    echo "Stopping Uvicorn (PID: $PID)..."
    kill "$PID"
    echo "Uvicorn stopped."
    echo "Uvicorn restarting..."
      uvicorn main:app --host 0.0.0.0 --port 3006 --reload --log-level debug &  # Start in the background
fi