# Use the PHP 8.2 FPM image
FROM php:8.2-fpm

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Set working directory
WORKDIR /app

# Copy your application code
COPY . /app/admin
COPY ../core /app/core
COPY ../composer.json /app/composer.json

# Optional: Set the entrypoint if your PHP app requires it
ENTRYPOINT ["php", "/app/admin/index.php"]
