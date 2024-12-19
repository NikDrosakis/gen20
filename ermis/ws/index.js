    const WebSocket = require('ws');
    const EventEmitter = require('events');
    // Create an instance of EventEmitter
    const emitter = new EventEmitter();
    // Set the maximum number of listeners to 100,000
    emitter.setMaxListeners(100000);

    const reload = require('./events/reload');
    const { broadcastMessage, subscribe } = require('../core/Redis'); // Redis module
    //const { getCounters } = require('./notifications/vivalibro_N');  // Import the counters
    const { getNotification } = require('./notification');  // Import the counters
    const connectionManager = require('./connectionManager');

    let wss;  // WebSocket server instance

    function setupWebSocket(server) {
        wss = new WebSocket.Server({ server });

        // Subscribe to Redis broadcast_channel for messages
        subscribe('gen_channel', (message) => {
            // Broadcast the message to all connected clients
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        });

    wss.on('connection', async (ws, req) => {
    // Call the connection manager for active connections check
        connectionManager(wss,ws, req);
            // Handle incoming messages
        ws.on('message', async (data) => {
                let message;
                // If the data is a buffer, convert it to a string
                if (Buffer.isBuffer(data)) {
                    data = data.toString();
                }
                message=JSON.parse(data);
                console.log(message.page)

        switch(message.cast){
            case "one":    await peertopeer(message); break;
            case "all":  broadcastMessage('gen_channel',message);break;
        }
    });

        try {
                const notifications = await getNotification();
                broadcastMessage(process.env.REDIS_CHANNEL,{ system:"vivalibrocom",page:'',cast:'all',type: 'N', text:notifications,class:"c_square cblue" });
            } catch (err) {
                console.error('Failed to get counters:', err);
            }
            async function peertopeer(message) {
                // Broadcast the message
               if (message.to) {
                   console.log("peertopeer", message.to)
                   // let to = `user${to}`;
                   const recipientWs = Array.from(wss.clients).find(client => client.userid === message.to);
                   if (recipientWs) {
                       console.log("found recipient and sending to", message.to)
                       recipientWs.send(JSON.stringify(message));
                   }
               }
            }
        ws.isAlive = true;
        });
    }
    module.exports = {
        setupWebSocket
    };