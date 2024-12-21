// index.js
const express = require('express');
const path = require('path'); // Import the path module
// Use ROOT_DIR from the environment or fallback
require('dotenv').config();
const ROOT = process.env.ROOT || path.resolve(__dirname);
console.log('Root Directory:', ROOT);

//RUN Ermis WebSocket
const { realTimeConnection } = require('./ws');

const app = express();
const fs = require("fs"),
    {promisify} = require("util"),
    https = require('https'),
    cors = require("cors"),
    cookieParser = require('cookie-parser'),
    compression = require('compression'),
    bodyParser = require("body-parser");
const privateKey = fs.readFileSync('/etc/letsencrypt/live/'+process.env.DOMAIN+'/privkey.pem', 'utf8'),
certificate = fs.readFileSync( '/etc/letsencrypt/live/'+process.env.DOMAIN+'/fullchain.pem', 'utf8'),
credentials = {key: privateKey, cert: certificate};

// Import the API routes
app.use(express.static("public"));
app.use(cookieParser());

app.use(cors({credentials: true, origin: process.env.whitelist}));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
app.use(bodyParser.urlencoded({limit: '300mb', extended: true}));
app.use(express.json());

//Instantiate actions
const { exeActions,exeActionGrps } = require('./action');
exeActionGrps(app);

const server = https.createServer(credentials, app);
//Running Web Socket Server for RealTime Actions
realTimeConnection(server,exeActions);
server.listen("3010", function () {
    console.log('Server listening on port ' + "3010");
});