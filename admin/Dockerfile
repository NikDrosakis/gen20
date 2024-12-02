FROM php:8.3-cli

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy your GPM code
COPY . ./admin
# Copy the shared core from the core-builder stage
COPY --from=core-builder /app/core /var/www/html/core
# (Optional) Set the entrypoint if GPM is a command-line tool
ENTRYPOINT ["php", "index.php"]