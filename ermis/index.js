const express = require('express');
const app = express();
const fs = require("fs");
const cli = require("./core/Cli");
const https = require('https');
const cors = require("cors");
const cookieParser = require('cookie-parser');
const compression = require('compression');
const path = require('path'); // Add this line

require('dotenv').config();

// Logging setup
const logFilePath = '/var/www/gs/log/ermis.log';
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

// Check if the domain is localhost
const isLocalhost = process.env.DOMAIN === 'localhost';

// Determine the paths based on the environment
const keyPath = isLocalhost
    ? path.join(__dirname, './setup/nginx/ssl/ssl.key')
    : `/etc/letsencrypt/live/${process.env.DOMAIN}/privkey.pem`;

const certPath = isLocalhost
    ? path.join(__dirname, './setup/nginx/ssl/ssl.crt')
    : `/etc/letsencrypt/live/${process.env.DOMAIN}/fullchain.pem`;

// Load the certificates
const privateKey = fs.readFileSync(keyPath, 'utf8');
const certificate = fs.readFileSync(certPath, 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Middleware
app.use(express.static("public"));
app.use(cookieParser());
app.use(cors({ credentials: true, origin: process.env.whitelist }));
app.use(express.urlencoded({ limit: '300mb', extended: true }));
app.use(express.json());

// Error-handling middleware (last)
app.use((err, req, res, next) => {
    log(`Error: ${err.stack}`);
    res.status(500).send('Something broke!');
});

const action = require('./action');
action.actionLoop();

const startTime = process.hrtime(); // ✅ Right before server creation
// HTTPS Server
const server = https.createServer(credentials, app);

//RUN Ermis WebSocket
const { WSServer} = require('./ws/main');

// Handle dynamic method execution
/*
const filename = process.argv[2];

if (filename) {
    const { runCli } = require('./core/Cli');
    if (filename === 'log') {
        consoleLoggingEnabled = !consoleLoggingEnabled;
        log(`Console logging ${consoleLoggingEnabled ? 'enabled' : 'disabled'}.`);

    } else {
        runCli(filename);
    }
} else {
    log("❌ Σφάλμα: Δεν δόθηκε μέθοδος για το Ermis.");
    process.exit(1);
}
*/

// WebSocket Server Configuration
const wsConfig = {
    maxConnections: 1000,
    connectionTimeout: 30000,
    pingInterval: 25000,
    maxPayload: 10 * 1024 * 1024 // 10MB
};

// Initialize WebSocket Server
try {
    const wss = new WSServer(server, wsConfig);

    server.on('error', (err) => {
        console.error('Server error:', err);
        // Implement your recovery logic here
    });

    const PORT = process.env.ERMIS_PORT || 3010;
    server.listen(PORT, function () {
        log('Server listening on port ' + PORT);
    });


    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('SIGTERM received. Closing WebSocket server...');
        wss.close(() => {
            server.close(() => {
                console.log('Server terminated gracefully');
                process.exit(0);
            });
        });
    });

} catch (err) {
    console.error('Failed to start WebSocket server:', err);
    process.exit(1);
}

const executionTime = process.hrtime(startTime);
console.log(`✅ Express Actual server startup time: ${executionTime[0] * 1e3 + executionTime[1] / 1e6} ms`);