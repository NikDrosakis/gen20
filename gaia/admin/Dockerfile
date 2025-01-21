# Use the PHP 8.2 FPM image
FROM php:8.2-fpm

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Set working directory
WORKDIR /gaia

# Copy your application code
COPY . /gaia/admin
COPY ../core /gaia/core
COPY ../composer.json /gaia/composer.json

# Optional: Set the entrypoint if your PHP app requires it
ENTRYPOINT ["php", "/gaia/admin/index.php"]
