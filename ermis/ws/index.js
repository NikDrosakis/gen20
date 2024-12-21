const WebSocket = require('ws');
const EventEmitter = require('events');
const { watch } = require('./watch');
const { peertopeer } = require('./peertopeer');
const { stats } = require('./stats');
const { publish, subscribe } = require('./broadcast');

const emitter = new EventEmitter();
emitter.setMaxListeners(100); // Set appropriate limit
//Watching filesystem
watch();

let wss;

function realTimeConnection(server,exeActions) {
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
                        await peertopeer(wss, message);
                        break;
                    case "all":  //broadcast event.
                        publish('gen_channel', message);
                        break;
                    default:
                        console.warn(`Unknown message type: ${message.cast}`);
                }

                exeActions();
            } catch (err) {
                console.error('Error processing message:', err);
                ws.send(JSON.stringify({ error: 'Invalid message format or internal error.' }));
            }
        });
    });
}

module.exports = { realTimeConnection };