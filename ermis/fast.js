const fastify = require('fastify')();
const cors = require('@fastify/cors');
const cookieParser = require('@fastify/cookie');
const compression = require('@fastify/compress');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Register Fastify plugins
fastify.register(compression);
fastify.register(cookieParser);
fastify.register(cors, { credentials: true, origin: process.env.whitelist });

require('dotenv').config();

const logFilePath = 'ermis.log';
let consoleLoggingEnabled = false;

function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${message}\n`;

    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        }
    });

    if (consoleLoggingEnabled) {
        console.log(message);
    }
}

// Domain and SSL Configuration
const isLocalhost = process.env.DOMAIN === 'localhost';
const keyPath = isLocalhost
    ? path.join(__dirname, './setup/nginx/ssl/ssl.key')
    : `/etc/letsencrypt/live/${process.env.DOMAIN}/privkey.pem`;
const certPath = isLocalhost
    ? path.join(__dirname, './setup/nginx/ssl/ssl.crt')
    : `/etc/letsencrypt/live/${process.env.DOMAIN}/fullchain.pem`;

// Load certificates
const privateKey = fs.readFileSync(keyPath, 'utf8');
const certificate = fs.readFileSync(certPath, 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Start Fastify server with HTTPS
const PORT = process.env.ERMIS_PORT || 3010;
fastify.listen({
    port: PORT,
    host: '0.0.0.0',
    https: credentials
}, (err, address) => {
    if (err) {
        console.log(err);
        process.exit(1);
    }
    log(`Server listening at ${address}`);
});

// Handle errors
fastify.setErrorHandler((err, req, res) => {
    log(`Error: ${err.stack}`);
    res.status(500).send('Something broke!');
});
