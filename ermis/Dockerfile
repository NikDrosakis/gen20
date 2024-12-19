# Use Node.js v20-alpine base image
FROM node:20-alpine

# Set the root directory as an environment variable
ENV ROOT /var/www/gs

# Set working directory
WORKDIR $ROOT

# Copy all files from the current directory to the container
COPY . $ROOT

# Install dependencies (if you have a package.json file)
RUN npm install

# Expose the port your application will run on (e.g., 3000)
EXPOSE 3000

# Command to run the application
CMD ["node", "index.js"]
