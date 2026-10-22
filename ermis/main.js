const fs = require("fs");
const https = require('https');
const path = require('path');
const { WServer } = require('./ws');
require('dotenv').config();

// SSL setup
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

const startTime = process.hrtime(); // Start timing right before server init

// Create HTTPS server without Express
const server = https.createServer(credentials);

// WebSocket execution timer
server.on('request', (req, res) => {
    const reqStartTime = process.hrtime();
    res.on('finish', () => {
        const diff = process.hrtime(reqStartTime);
        console.log(`HTTPS Request to ${req.url} took ${diff[0] * 1e3 + diff[1] / 1e6} ms`);
    });
});

// Run WebSocket Server
WServer(server);

const executionTime = process.hrtime(startTime);
console.log(`✅ WebSocket+HTTPS Server started in ${executionTime[0] * 1e3 + executionTime[1] / 1e6} ms`);

const PORT = process.env.ERMIS_PORT || 3010;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
