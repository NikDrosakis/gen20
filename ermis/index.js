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

// HTTPS Server
const server = https.createServer(credentials, app);

//RUN Ermis WebSocket
const { WServer } = require('./ws');
WServer(server);

// Handle dynamic method execution
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

const PORT = process.env.ERMIS_PORT || 3010;
server.listen(PORT, function () {
    log('Server listening on port ' + PORT);
});