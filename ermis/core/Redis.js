// core.Redis.js
const Redis = require('ioredis');
require('dotenv').config();

const config = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASS
};

class Redis {
    constructor() {
        this.redisClient = new Redis(config);
        this.redisSubscriber = new Redis(config);

        // Error handling for Redis connections
        this.redisClient.on('error', (err) => {
            console.error('Redis Client Error:', err);
        });

        this.redisSubscriber.on('error', (err) => {
            console.error('Redis Subscriber Error:', err);
        });

        // Default subscription
        const defaultChannel = process.env.REDIS_CHANNEL || 'vivalibro';
        this.redisSubscriber.subscribe(defaultChannel, (err, count) => {
            if (err) {
                console.error('Failed to subscribe:', err);
            } else {
                console.log(`Subscribed to ${count} channel(s).`);
            }
        });

        this.redisSubscriber.on('message', (channel, message) => {
            console.log(`Received message: ${message} from channel: ${channel}`);
        });
    }

    // Publish a message to a Redis channel
    publish(channel, message) {
        this.redisClient.publish(channel, JSON.stringify(message));
    }

    // Subscribe to a Redis channel and handle messages with the provided callback
    subscribe(channel, onMessage) {
        this.redisSubscriber.subscribe(channel, (err) => {
            if (err) {
                console.error(`Failed to subscribe to Redis channel ${channel}:`, err);
            }
        });

        this.redisSubscriber.on('message', (subscribedChannel, message) => {
            if (subscribedChannel === channel) {
                onMessage(message);
            }
        });
    }

    // Set a value in Redis
    async set(key, value) {
        try {
            await this.redisClient.set(key, JSON.stringify(value));
        } catch (err) {
            console.error('Redis Set Error:', err);
        }
    }

    // Get a value from Redis
    async get(key) {
        try {
            const value = await this.redisClient.get(key);
            return JSON.parse(value);
        } catch (err) {
            console.error('Redis Get Error:', err);
        }
    }

    // Get all keys matching a pattern
    async keys(pattern = '*') {
        try {
            return await this.redisClient.keys(pattern);
        } catch (err) {
            console.error('Redis Keys Error:', err);
        }
    }

    // Get a list of values for multiple keys
    async list(keys) {
        try {
            const pipeline = this.redisClient.pipeline();
            keys.forEach((key) => pipeline.get(key));
            const results = await pipeline.exec();
            return results.map(([err, value]) => (err ? null : JSON.parse(value)));
        } catch (err) {
            console.error('Redis List Error:', err);
        }
    }
}

module.exports = new RedisService();
