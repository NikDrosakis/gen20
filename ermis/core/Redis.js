// redis.js
const Redis = require('ioredis');
require('dotenv').config();
//dotenv.config({ path: '../.env' });
// Separate Redis clients for publisher and subscriber
const config={
    host: process.env.REDIS_HOST,
   port: process.env.REDIS_PORT,
   password: process.env.REDIS_PASS
};
//console.log(config)
const redisSubscriber = new Redis(config); // for subscribing
const redisClient = new Redis(config);
// Error handling for Redis connections
redisSubscriber.on('error', (err) => {
    console.error('Redis Subscriber Error:', err);
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});


// Subscribe to a channel using the subscriber connection
redisSubscriber.subscribe('vivalibro', (err, count) => {
    if (err) {
        console.error('Failed to subscribe:', err);
    } else {
        console.log(`Subscribed to ${count} channel(s).`);
    }
});

// Handle messages from the subscribed channel
redisSubscriber.on('message', (channel, message) => {
    console.log(`Received message: ${message} from channel: ${channel}`);
});

// Function to broadcast a message using Redis Pub/Sub
function broadcastMessage(channel, message) {
    redisClient.publish(channel, JSON.stringify(message));
}

// Function to handle incoming messages for a specific channel
function subscribe(channel, onMessage) {
    redisSubscriber.subscribe(channel, (err) => {
        if (err) {
            console.error(`Failed to subscribe to Redis channel ${channel}:`, err);
        }
    });

    redisSubscriber.on('message', (subscribedChannel, message) => {
        if (subscribedChannel === channel) {
            onMessage(message);
        }
    });
}

module.exports = {
    broadcastMessage,
    subscribe,
    redisClient,
    redisSubscriber // Export the redisSubscriber if needed elsewhere
};

