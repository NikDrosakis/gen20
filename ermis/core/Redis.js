// /var/www/gs/public/ermis/core/Redis.js
const Redis = require('ioredis');
require('dotenv').config();

const config = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASS || "yjF1f7uiHttcp"
};

class RedisService {
    constructor() {
        this.redisClient = new Redis(config);
        this.redisSubscriber = new Redis(config);

        // Error handling
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

    publish(channel, message) {
        this.redisClient.publish(channel, JSON.stringify(message));
    }

    subscribe(channel, onMessage) {
        this.redisSubscriber.subscribe(channel, (err) => {
            if (err) {
                console.error(`Failed to subscribe to Redis channel ${channel}:`, err);
            }
        });

        this.redisSubscriber.on('message', (subscribedChannel, message) => {
            if (subscribedChannel === channel) {
                try {
                    onMessage(JSON.parse(message));
                } catch (e) {
                    onMessage(message);
                }
            }
        });
    }

    async set(key, value) {
        try {
            await this.redisClient.set(key, JSON.stringify(value));
        } catch (err) {
            console.error('Redis Set Error:', err);
        }
    }

    async get(key) {
        try {
            const value = await this.redisClient.get(key);
            return JSON.parse(value);
        } catch (err) {
            console.error('Redis Get Error:', err);
            return null;
        }
    }

    async del(key) {
        try {
            await this.redisClient.del(key);
        } catch (err) {
            console.error('Redis Del Error:', err);
        }
    }

    async expire(key, seconds) {
        try {
            await this.redisClient.expire(key, seconds);
        } catch (err) {
            console.error('Redis Expire Error:', err);
        }
    }

    async keys(pattern = '*') {
        try {
            return await this.redisClient.keys(pattern);
        } catch (err) {
            console.error('Redis Keys Error:', err);
            return [];
        }
    }

    async list(keys) {
        try {
            const pipeline = this.redisClient.pipeline();
            keys.forEach((key) => pipeline.get(key));
            const results = await pipeline.exec();
            return results.map(([err, value]) => (err ? null : JSON.parse(value)));
        } catch (err) {
            console.error('Redis List Error:', err);
            return [];
        }
    }
}

module.exports = new RedisService();