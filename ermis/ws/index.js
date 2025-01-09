const WebSocket = require('ws');
const EventEmitter = require('events');
const { stats } = require('./stats');
const Messenger = require('../core/Messenger');
const emitter = new EventEmitter();
emitter.setMaxListeners(1000);

let wss;

function WServer(server) {
    wss = new WebSocket.Server({ server });
/*
    // Redis subscription
    subscribe(process.env.REDIS_CHANNEL, (message) => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
*/

    // Health check for WebSocket connections
    setInterval(() => {
        wss.clients.forEach((ws) => {
            if (!ws.isAlive) return ws.terminate();
            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);

    wss.on('connection', async (ws, req) => {
        ws.isAlive = true;
        ws.on('pong', () => (ws.isAlive = true));

        stats(wss, ws, req); // Track stats
        //Instantiate Actions

       // const finalized_action_message = Messenger.buildMessage(executed_actions);

        //broadcast message event.
        /*
        if(finalized_action_message) {
            wss.clients.forEach(function each(client) {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    console.log("broadcast", finalized_messsage);
                    client.send(finalized_messsage);
                }
            });
        }
        */
        ws.on('message', async (data) => {
            try {
                let message = Buffer.isBuffer(data) ? JSON.parse(data.toString()) : JSON.parse(data);

                if (!message || typeof message.cast !== 'string') {
                    console.warn('Invalid message:', data);
                    return;
                }

                const finalized_messsage = Messenger.buildMessage(message);

                switch (message.cast) {
                    case "one":
                        if (message.to) {
                            console.log("peertopeer", message.to,message);
                            // let to = `user${to}`;
                            const recipientWs = Array.from(wss.clients).find(client => client.userid === message.to);
                            if (recipientWs) {
                                console.log("found recipient and sending to", message.to)
                                recipientWs.send(finalized_messsage);
                            }
                        }
                        break;
                    default:
                        //broadcast message event.
                            wss.clients.forEach(function each(client) {
                            if (client !== ws && client.readyState === WebSocket.OPEN) {
                                console.log("broadcast", finalized_messsage);
                                client.send(finalized_messsage);
                            }})
                        break;
                }
            } catch (err) {
                console.error('Error processing message:', err);
                ws.send(JSON.stringify({ error: 'Invalid message format or internal error.' }));
            }
        });
    });
}

module.exports = { WServer };