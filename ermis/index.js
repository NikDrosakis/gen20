// index.js
const express = require('express');
const app = express();
const fs = require("fs");
const https = require('https');
const cors = require("cors");
const cookieParser = require('cookie-parser');
const compression = require('compression');
//PROCESS ACTION LOOP

require('dotenv').config();
// Check if the domain is localhost
const isLocalhost = process.env.DOMAIN === 'localhost';

// Determine the paths based on the environment
const keyPath = isLocalhost
    ? path.join(__dirname, './setup/nginx/ssl/ssl.key') // Use local folder for localhost
    : `/etc/letsencrypt/live/${process.env.DOMAIN}/privkey.pem`; // Use Let's Encrypt certs for non-localhost

const certPath = isLocalhost
    ? path.join(__dirname, './setup/nginx/ssl/ssl.crt') // Use local folder for localhost
    : `/etc/letsencrypt/live/${process.env.DOMAIN}/fullchain.pem`; // Use Let's Encrypt certs for non-localhost

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
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const action = require('./action');
action.actionLoop();

//const watch = require('./watch');
//watch.fswatch();


// HTTPS Server
const server = https.createServer(credentials, app);

//RUN Ermis WebSocket
const { WServer } = require('./ws');
WServer(server);




const PORT = process.env.ERMIS_PORT || 3010;
server.listen(PORT, function () {
    console.log('Server listening on port ' + PORT);
});