// index.js
const express = require('express');
//Swagger for Ending Points
const swaggerUi = require("swagger-ui-express");
const swaggerDocs = require("./swagger.json");
const path = require('path'); // Import the path module
// Use ROOT_DIR from the environment or fallback
require('dotenv').config();
const ROOT = process.env.ROOT || path.resolve(__dirname);
console.log('Root Directory:', ROOT);
//RUN Ermis WebSocket
const { setupWebSocket } = require('./ws');  // Import WebSocket setup function

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
const fun = require("./services/gaia/functions");

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

//integrations
const apiRouter = require('./services/gaia/start');
const timetableRouter = require('./services/timetable/timetableRouter');
const openaiRoutes = require('./services/openai/routes');
const aistudio = require('./services/aistudio/routes');
const botpressRouter = require('./services/botpress/test1');
const huggingface = require('./services/huggingface/routes');
const test = require('./services/test/start');
const rapidapi = require('./services/rapidapi/start');
const mongoRouter = require('./services/mongo/routes');

//includes
app.use('/ermis/v1/gaia',apiRouter);
app.use('/ermis/v1/timetable', timetableRouter);
app.use('/ermis/v1/openai', openaiRoutes);
app.use('/ermis/v1/chatgpt', aistudio);
app.use('/ermis/v1/botpress', botpressRouter); // Use Botpress route
app.use('/ermis/v1/huggingface', huggingface); // Use Botpress route
app.use('/ermis/v1/test', test); // Use test route
app.use('/ermis/v1/rapidapi', rapidapi); // Use test route
app.use('/ermis/v1/mongo', mongoRouter); // Use test route

// Serve Swagger UI
app.use("/ermis/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
    explorer: true, // Allows for exploration of endpoints
    swaggerOptions: {
        urls: [
            {
                url: '/swagger.json', // Your swagger.json endpoint
                name: 'ermis API Docs'
            }
        ],
    }
}));
const server = https.createServer(credentials, app);
setupWebSocket(server);
server.listen("3010", function () {
    console.log('Server listening on port ' + "3010");
});