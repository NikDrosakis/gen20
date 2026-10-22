require('dotenv').config();
const cors = require('@fastify/cors');
const cookieParser = require('@fastify/cookie');
const compression = require('@fastify/compress');
const fs = require('fs');
const zlib = require('zlib'); // Add this with other requires
const path = require('path');
const https = require('https');

// Load the certificates
// Determine the paths based on the environment

// SSL Configuration
const isLocalhost = process.env.DOMAIN === 'localhost';
const keyPath = isLocalhost
    ? path.join(__dirname, './setup/nginx/ssl/ssl.key')
    : `/etc/letsencrypt/live/${process.env.DOMAIN}/privkey.pem`;
const certPath = isLocalhost
    ? path.join(__dirname, './setup/nginx/ssl/ssl.crt')
    : `/etc/letsencrypt/live/${process.env.DOMAIN}/fullchain.pem`;


const privateKey = fs.readFileSync(keyPath, 'utf8');
const certificate = fs.readFileSync(certPath, 'utf8');
const credentials = { key: privateKey, cert: certificate };

const fastify = require('fastify')({
    logger: true,
    https: credentials,
    http2: true,
    maxRequestsPerSocket: 1000,
    requestTimeout: 30000
});


// Fastify 5.x plugin system
fastify.register(require('@fastify/cors'), {
    origin: process.env.WHITELIST ? process.env.WHITELIST.split(',') : true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
});

fastify.register(require('@fastify/cookie'), {
    secret: process.env.COOKIE_SECRET || 'your-strong-secret-here',
    hook: 'onRequest',
    parseOptions: {
        httpOnly: true,
        secure: true,
        sameSite: 'lax'
    }
});

fastify.register(require('@fastify/compress'), {
    global: true,
    threshold: 1024,
    encodings: ['gzip', 'deflate', 'br'], // Explicitly list supported encodings
    brotliOptions: {
        params: {
            [zlib.constants.BROTLI_PARAM_QUALITY]: 4
        }
    },
    zlib: zlib // Pass the zlib instance directly
});

// Create HTTP/2 server
const server = require('http2').createSecureServer({
    allowHTTP1: true,
    minVersion: 'TLSv1.3',
    key: privateKey,
    cert: certificate
}, fastify.server);

require('dotenv').config();

const logFilePath = 'ermis.log';
let consoleLoggingEnabled = true; // Enabled by default for debugging

function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${message}\n`;

    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) console.error('Error writing to log file:', err);
    });

    if (consoleLoggingEnabled) {
        console.log(message);
    }
}


const startTime = process.hrtime();
// WebSocket Server
const { WSServer } = require('./ws/main');
// Get the raw Node server from Fastify
const nodeServer = fastify.server;
const wss = new WSServer(nodeServer,{
    maxPayload: 10 * 1024 * 1024, // 10MB
    skipUTF8Validation: false,
    perMessageDeflate: {
        zlibDeflateOptions: {
            level: 3,
            memLevel: 8
        },
        zlibInflateOptions: {
            chunkSize: 16 * 1024
        },
        threshold: 1024
    }
});


// Start server
fastify.listen({
    port: process.env.PORT || 3010,
    host: '0.0.0.0'
}, (err) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    console.log(`
  🚀 Ermis Server v0.5.0
  ├─ HTTPS: https://localhost:${fastify.server.address().port}
  ├─ WebSocket: wss://localhost:${fastify.server.address().port}
  ├─ PID: ${process.pid}
  └─ Node: ${process.version}
  `);
});

const executionTime = process.hrtime(startTime);
console.log(`✅ Express Actual server startup time: ${executionTime[0] * 1e3 + executionTime[1] / 1e6} ms`);