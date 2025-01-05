#4 micro php api gateway
FROM php:8.2-fpm
WORKDIR /app
# Copy your apiv1 code
COPY ./apiv1 /app/apiv1
COPY ./core /app/core
ENTRYPOINT ["php", "index.php"]