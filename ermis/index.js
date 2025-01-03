// index.js
const express = require('express');
//RUN Ermis WebSocket
const { realTimeConnection } = require('./ws');

const app = express();
const fs = require("fs");
const https = require('https');
const cors = require("cors");
const cookieParser = require('cookie-parser');
const compression = require('compression');

const privateKey = fs.readFileSync(`/etc/letsencrypt/live/${process.env.DOMAIN}/privkey.pem`, 'utf8');
const certificate = fs.readFileSync(`/etc/letsencrypt/live/${process.env.DOMAIN}/fullchain.pem`, 'utf8');
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

// HTTPS Server
const server = https.createServer(credentials, app);

//Instantiate Actions
const { exeActions } = require('./action');
exeActions(app);

//Running Web Socket Server for RealTime Actions
realTimeConnection(server,app,exeActions);

const PORT = process.env.ERMIS_PORT || 3010;
server.listen(PORT, function () {
    console.log('Server listening on port ' + "3010");
});