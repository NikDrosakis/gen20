FROM node:20-alpine

# No need to COPY ./ermis since it's mounted via volumes in docker-compose.yml
WORKDIR /app

# Install dependencies (if any)
RUN npm install

EXPOSE 3005

CMD ["node", "index.js"]