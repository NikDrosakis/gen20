const WebSocket = require('ws');
const EventEmitter = require('events');
const { stats } = require('./stats');

const emitter = new EventEmitter();
emitter.setMaxListeners(1000);

let wss;

function WServer(server,app,exeActions) {
    wss = new WebSocket.Server({ server });

    // Redis subscription
    subscribe(process.env.REDIS_CHANNEL, (message) => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

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

        ws.on('message', async (data) => {
            try {
                let message = Buffer.isBuffer(data) ? JSON.parse(data.toString()) : JSON.parse(data);

                if (!message || typeof message.cast !== 'string') {
                    console.warn('Invalid message:', data);
                    return;
                }

                switch (message.cast) {
                    case "one":
                        if (message.to) {
                            console.log("peertopeer", message.to,message);
                            // let to = `user${to}`;
                            const recipientWs = Array.from(wss.clients).find(client => client.userid === message.to);
                            if (recipientWs) {
                                console.log("found recipient and sending to", message.to)
                                recipientWs.send(message);
                            }
                        }
                        break;
                    default:  //broadcast event.
                            wss.clients.forEach(function each(client) {
                            if (client !== ws && client.readyState === WebSocket.OPEN) {
                                console.log("peertopeer", message);                            }
                                client.send(message, { binary: isBinary });
                            };
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