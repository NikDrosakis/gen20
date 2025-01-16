FROM node:20-alpine

# No need to COPY ./ermis since it's mounted via volumes in docker-compose.yml
WORKDIR /ermis

# Install dependencies (if any)
RUN yarn install

EXPOSE 3010

CMD ["node", "index.js"]