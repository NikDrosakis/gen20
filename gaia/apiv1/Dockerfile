#4 micro php api gateway
FROM php:8.2-fpm
WORKDIR /gaia
# Copy your apiv1 code
COPY ./apiv1 /gaia/apiv1
COPY ../core /gaia/core
ENTRYPOINT ["php", "index.php"]