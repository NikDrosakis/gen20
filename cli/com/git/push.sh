#!/bin/bash

    # Custom error pages
    error_page 404 = /error.php?error=404;
    error_page 500 = /error.php;
    location = /error.php {
        internal;
        root /var/www/gs/cli;  # Directory where error.php is located
        try_files $uri =404;  # Ensure the file exists
    }
	
	
	/var/lib/docker/overlay2/8afc178cc5f05abed92d15d69cfc568d2912e0c06eeefb395236d0ac9a651b49/diff/home/coder/.config/code-server
	
code-server pass 38fc5d0ec4593492ad5610cc
docker run -d \
  -p 8080:8080 \
  --name coder \
  -v /var/www/gs:/home/coder/.config \
  -v /etc/letsencrypt/live/vivalibro.com:/etc/letsencrypt/live/admin.vivalibro.com \
  -e PASSWORD="n130177!" \
  codercom/code-server:latest
  
  docker exec -it gscode /bin/sh
  
  code-server pass 38fc5d0ec4593492ad5610cc
  
  
docker run -d \
  -p 8080:8080 \
  --name coder \
        --user root \
  -v /var/www/gs:/home/coder/project \
   -v /usr/bin/php:/usr/bin/php \
  -v /etc/letsencrypt/live/vivalibro.com:/etc/letsencrypt/live/admin.vivalibro.com \
  -e PASSWORD="n130177!" \
  codercom/code-server:latest


  
  docker exec -it gscode /bin/sh
  
  
 #create version.sh with two params  $1 for push to  # repository  https://github.com/NikDrosakis/GEN20s.git
 
  # with GITHUB_ACCESS_TOKEN=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
 
#params $1 tag message which checks maria latest decimal 
# decimal get the next decimal +0.01 from gpm.versioning.version 
# git add .
# git commit -m $2 to table gpm.versioning as title column 
# git push to   # repository is https://github.com/NikDrosakis/GEN20.git
 
 #if there is a success message, insert into database 
# Detailed Commit Information in column summary 
# i want also a cron shell file every one hour to get the diff and update
 
# Get the commit message from the command line argument
commit_message="$1"

# Check if a commit message was provided
if [ -z "$commit_message" ]; then
    echo "Error: Commit message is required."
    exit 1
fi

# Add all changes
git add .

# Commit changes
git commit -m "$commit_message"

# Get the current date and time for the tag
tag_date=$(date +%Y%m%d-%H%M%S)

# Create a tag with the date and time
git tag "release-$tag_date"

# Push changes and tag
git push origin main --tags

# --- WebSocket Notification ---
# (Assuming you have a function `sendMessage` in your ermis service)
curl -X POST -H "Content-Type: application/json" \
     -d '{"type": "git_update", "message": "New code pushed and tagged"}' \
     http://wss://vivalibro:3010/send # Replace with your WSI endpoint

echo "Code pushed, committed, and tagged successfully!"