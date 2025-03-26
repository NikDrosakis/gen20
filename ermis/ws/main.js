const WebSocket = require('ws');
const EventEmitter = require('events');
const { stats } = require('./stats');
const Messenger = require('../core/Messenger');

// Protocol Constants
const PROTOCOL = {
    HEADER_SIZE: 5, // 1 byte type + 4 byte length
    MESSAGE_TYPES: {
        JSON: 0x4A,   // 'J'
        BINARY: 0x42,  // 'B'
        PING: 0x50,    // 'P'
        PONG: 0x70     // 'p'
    }
};

let wss;

function WServer(server) {
    wss = new WebSocket.Server({
        server,
        perMessageDeflate: {
            zlibDeflateOptions: {
                chunkSize: 1024,
                memLevel: 7,
                level: 3
            },
            zlibInflateOptions: {
                chunkSize: 10 * 1024
            },
            threshold: 1024
        },
        maxPayload: 10 * 1024 * 1024 // 10MB
    });

    // Health check with binary pings
    const interval = setInterval(() => {
        const pingBuffer = Buffer.alloc(1);
        pingBuffer.writeUInt8(PROTOCOL.MESSAGE_TYPES.PING, 0);

        wss.clients.forEach((ws) => {
            if (!ws.isAlive) return ws.terminate();
            ws.isAlive = false;
            ws.ping(pingBuffer);
        });
    }, 30000);

    wss.on('connection', async (ws, req) => {
        ws.isAlive = true;
        ws.userid = req.headers['sec-websocket-key']; // Or extract from auth token

        // Binary pong response
        ws.on('pong', (data) => {
            if (data && data[0] === PROTOCOL.MESSAGE_TYPES.PING) {
                const pongBuffer = Buffer.alloc(1);
                pongBuffer.writeUInt8(PROTOCOL.MESSAGE_TYPES.PONG, 0);
                ws.isAlive = true;
                ws.send(pongBuffer);
            }
        });

        stats(wss, ws, req);

        ws.on('message', async (data) => {
            try {
                const message = decodeMessage(data);

                if (!message || typeof message.cast !== 'string' || !message.to) {
                    console.warn('Invalid message structure');
                    return ws.send(encodeError('Invalid message structure'));
                }

                const finalized_message = await Messenger.buildMessage(message);
                const encodedMessage = encodeMessage(finalized_message);

                switch (message.cast) {
                    case "one":
                        const recipient = findClient(message.to);
                        if (recipient) {
                            try {
                                console.log("Received message from", finalized_message.system, finalized_message.verba);
                                recipient.send(encodedMessage);

                                if (finalized_message.system !== 'admin') {
                                    finalized_message.system = 'admin';
                                    console.log("Publishing event", finalized_message.system, finalized_message.verba);
                                    recipient.send(encodeMessage(finalized_message));
                                }
                            } catch (sendError) {
                                console.error("Failed to send message:", sendError);
                            }
                        }
                        break;

                    default:
                        broadcast(encodedMessage, ws);
                        break;
                }
            } catch (err) {
                console.error('Message processing error:', err);
                ws.send(encodeError(err.message));
            }
        });
    });

    wss.on('close', () => clearInterval(interval));
}

// Protocol Functions
function encodeMessage(obj) {
    if (obj instanceof Buffer) {
        const header = Buffer.alloc(PROTOCOL.HEADER_SIZE);
        header.writeUInt8(PROTOCOL.MESSAGE_TYPES.BINARY, 0);
        header.writeUInt32BE(obj.length, 1);
        return Buffer.concat([header, obj]);
    }

    const str = JSON.stringify(obj);
    const header = Buffer.alloc(PROTOCOL.HEADER_SIZE);
    header.writeUInt8(PROTOCOL.MESSAGE_TYPES.JSON, 0);
    header.writeUInt32BE(Buffer.byteLength(str), 1);
    return Buffer.concat([header, Buffer.from(str)]);
}

function decodeMessage(data) {
    // Handle JSON messages (legacy)
    if (!Buffer.isBuffer(data)) {
        try {
            return typeof data === 'string' ? JSON.parse(data) : data;
        } catch {
            throw new Error('Invalid JSON message');
        }
    }

    // Binary protocol messages
    if (data.length < PROTOCOL.HEADER_SIZE) {
        throw new Error('Message too short');
    }

    const type = data.readUInt8(0);
    const length = data.readUInt32BE(1);
    const payload = data.slice(PROTOCOL.HEADER_SIZE);

    if (payload.length !== length) {
        throw new Error('Message length mismatch');
    }

    switch (type) {
        case PROTOCOL.MESSAGE_TYPES.JSON:
            return JSON.parse(payload.toString());
        case PROTOCOL.MESSAGE_TYPES.BINARY:
            return payload;
        default:
            throw new Error(`Unknown message type: 0x${type.toString(16)}`);
    }
}

function encodeError(message) {
    return encodeMessage({
        error: message,
        timestamp: Date.now()
    });
}

function findClient(userId) {
    return Array.from(wss.clients).find(c => c.userid === userId);
}

function broadcast(message, exclude = null) {
    wss.clients.forEach(client => {
        if (client !== exclude && client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

module.exports = { WServer };