FROM php:8.3-cli

WORKDIR /app

# Copy your apiv1 code
COPY . /var/www/html

# Copy the shared core from the core-builder stage
COPY --from=core-builder /app/core /var/www/html/core

ENTRYPOINT ["php", "index.php"]