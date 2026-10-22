#!/bin/bash

# Load local images into Docker
for image in ./setup/local/*.tar; do
  echo "Loading image: $image"
  docker load -i "$image"
done

# Start local Docker registry
docker run -d -p 5000:5000 --restart=always --name registry registry:2

# Tag and push images to local registry
docker tag debian:12 localhost:5000/debian:12
docker tag php:8.2-fpm localhost:5000/php:8.2-fpm
docker tag nginx:1.26 localhost:5000/nginx:1.26
docker tag mariadb:11.4 localhost:5000/mariadb:11.4
docker tag redis:latest localhost:5000/redis:latest
docker tag phpmyadmin:latest localhost:5000/phpmyadmin:latest

docker push localhost:5000/debian:12
docker push localhost:5000/php:8.2-fpm
docker push localhost:5000/nginx:1.26
docker push localhost:5000/mariadb:11.4
docker push localhost:5000/redis:latest
docker push localhost:5000/phpmyadmin:latest

# Start services
docker-compose up -d
