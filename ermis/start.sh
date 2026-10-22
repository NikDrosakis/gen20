#!/bin/bash

clear

echo "Cleaning port 3010..."

lsof -ti:3010 | xargs -r kill -9

echo "Starting nodemon..."
nodemon start