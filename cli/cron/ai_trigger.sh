#!/bin/bash

# Step 1: Set environment variables if necessary
export PATH="/var/www/gs/kronos/newenv/bin:$PATH"
export PYTHONPATH="/var/www/gs/kronos"

# Step 2: Navigate to your project directory
cd /var/www/gs/kronos

# Step 3: Run the Python script
python /var/www/gs/kronos/services/bloom/task_book_summaries.py >> /var/www/gs/log/task_book_summaries.log 2>&1
