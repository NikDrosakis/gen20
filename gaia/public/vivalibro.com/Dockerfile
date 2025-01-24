#3 micro php
FROM php:8.2-fpm
# Install necessary PHP extensions
RUN apt-get update && apt-get install -y \
    libzip-dev \
    zip \
    && docker-php-ext-install pdo_mysql zip
# Set working directory
WORKDIR /app
# Copy your code
COPY . /app/public
COPY ../core /app/core
