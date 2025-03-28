const WebSocket = require('ws');
const zlib = require('zlib');
const { stats } = require('./stats');
const Messenger = require('../core/Messenger');
const EventEmitter = require('events');
const emitter = new EventEmitter();
emitter.setMaxListeners(1000);
// Protocol Constants
const PROTOCOL = {
    HEADER_SIZE: 5, // 1 byte type + 4 byte length
    MAX_MESSAGE_SIZE: 10 * 1024 * 1024, // 10MB
    LEGACY_MAX_SIZE: 1 * 1024 * 1024, // 1MB for legacy JSON
    MESSAGE_TYPES: {
        JSON: 0x4A,   // 'J'
        BINARY: 0x42,  // 'B'
        PING: 0x50,    // 'P'
        PONG: 0x70,    // 'p'
        ERROR: 0x45,   // 'E'
        UPGRADE: 0x55  // 'U' for protocol upgrade
    }
};

class WSServer {
    constructor(server, config = {}) {
        this.config = {
            maxPayload: PROTOCOL.MAX_MESSAGE_SIZE,
            perMessageDeflate: this.getCompressionConfig(),
            ...config
        };

        this.wss = new WebSocket.Server({
            server,
            maxPayload: this.config.maxPayload,
            perMessageDeflate: this.config.perMessageDeflate
        });

        this.setupHeartbeat();
        this.setupConnectionHandlers();
    }

    // Add the missing authenticateConnection method
    authenticateConnection(req) {
        // Implement your actual authentication logic here
        // This is a basic example using the websocket key
        return req.headers['sec-websocket-key'] || 'anonymous';
    }

    // Add the missing handleMessageError method
    handleMessageError(ws, err) {
        console.error('Message processing error:', err);
        try {
            const errorResponse = this.encodeMessage({
                error: err.message,
                code: err.code || 'PROTOCOL_ERROR',
                timestamp: Date.now(),
                protocol: PROTOCOL.MESSAGE_TYPES.ERROR
            });
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(errorResponse);
            }
        } catch (encodeErr) {
            console.error('Failed to encode error response:', encodeErr);
        }
    }

    getCompressionConfig() {
        return {
            zlibDeflateOptions: {
                chunkSize: 16 * 1024,
                memLevel: 8,
                level: 3
            },
            zlibInflateOptions: {
                chunkSize: 32 * 1024,
                flush: zlib.constants.Z_SYNC_FLUSH
            },
            threshold: 1024,
            concurrencyLimit: 10,
            serverNoContextTakeover: true,
            clientNoContextTakeover: true
        };
    }

    setupHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            const pingBuffer = Buffer.alloc(1);
            pingBuffer.writeUInt8(PROTOCOL.MESSAGE_TYPES.PING, 0);

            this.wss.clients.forEach((ws) => {
                if (!ws.isAlive) {
                    ws.terminate();
                    return;
                }
                ws.isAlive = false;
                ws.ping(pingBuffer, { binary: true, mask: false });
            });
        }, 30000);
    }

    setupConnectionHandlers() {
        this.wss.on('connection', (ws, req) => {
            this.handleNewConnection(ws, req);
        });

        this.wss.on('close', () => {
            clearInterval(this.heartbeatInterval);
        });
    }

    handleNewConnection(ws, req) {
        ws.isAlive = true;
        ws.isUpgraded = false;
        ws.userid = this.authenticateConnection(req);

        // Message rate limiting
        ws.messageCount = 0;
        const rateLimitReset = setInterval(() => {
            ws.messageCount = 0;
        }, 60000);

        ws.on('pong', (data) => this.handlePong(ws, data));
        ws.on('message', (data) => this.handleMessage(ws, data));
        ws.on('error', (err) => this.handleError(ws, err));
        ws.on('close', () => clearInterval(rateLimitReset));

        stats(this.wss, ws, req);
    }

    handlePong(ws, data) {
        if (data && data[0] === PROTOCOL.MESSAGE_TYPES.PING) {
            const pongBuffer = Buffer.alloc(1);
            pongBuffer.writeUInt8(PROTOCOL.MESSAGE_TYPES.PONG, 0);
            ws.isAlive = true;
            ws.send(pongBuffer, { binary: true });
        }
    }

    async handleMessage(ws, data) {
        try {
            // Rate limiting
            if (++ws.messageCount > 1000) {
                throw new Error('Rate limit exceeded');
            }

            const message = this.decodeMessage(data, ws);
            this.validateMessageStructure(message);

            if (message.protocol === 'upgrade-request' && !ws.isUpgraded) {
                ws.send(this.encodeMessage({
                    protocol: 'upgrade-confirm',
                    version: 1
                }));
                ws.isUpgraded = true;
                return;
            }

            const finalizedMessage = await Messenger.buildMessage(message);
            const encodedMessage = this.encodeMessage(finalizedMessage);

            await this.routeMessage(ws, finalizedMessage, encodedMessage);
        } catch (err) {
            this.handleMessageError(ws, err);
        }
    }

    validateMessageStructure(message) {
        if (!message || typeof message.cast !== 'string' || !message.to) {
            throw new Error('Invalid message structure');
        }
    }

    async routeMessage(ws, message, encodedMessage) {
        switch (message.cast) {
            case "one":
                await this.handleDirectMessage(message, encodedMessage);
                break;
            default:
                this.broadcast(encodedMessage, ws);
                break;
        }
    }

    async handleDirectMessage(message, encodedMessage) {
        const recipient = this.findClient(message.to);
        if (!recipient) return;

        try {
            console.log("Routing message to", message.to);
            recipient.send(encodedMessage);

            if (message.system !== 'admin') {
                const adminMessage = { ...message, system: 'admin' };
                recipient.send(this.encodeMessage(adminMessage));
            }
        } catch (sendError) {
            console.error("Failed to send message:", sendError);
            throw sendError;
        }
    }

    handleError(ws, err) {
        console.error('WebSocket error:', err);
        ws.terminate();
    }

    decodeMessage(data, ws) {
        try {
            if (Buffer.isBuffer(data) && data.length >= PROTOCOL.HEADER_SIZE) {
                const type = data.readUInt8(0);
                if (Object.values(PROTOCOL.MESSAGE_TYPES).includes(type)) {
                    return this.decodeBinaryMessage(data);
                }
            }

            if (!ws.isUpgraded) {
                return this.handleLegacyJSON(data);
            }

            throw new Error('Invalid message format');
        } catch (err) {
            console.error('Decoding failed:', err);
            throw new Error(`Message decoding error: ${err.message}`);
        }
    }

    decodeBinaryMessage(data) {
        if (data.length < PROTOCOL.HEADER_SIZE) {
            throw new Error(`Message too short (${data.length} bytes)`);
        }

        const type = data.readUInt8(0);
        const length = data.readUInt32BE(1);
        const payload = data.slice(PROTOCOL.HEADER_SIZE);

        if (length > PROTOCOL.MAX_MESSAGE_SIZE) {
            throw new Error(`Message size ${length} exceeds limit`);
        }

        if (payload.length !== length) {
            throw new Error(`Length mismatch (expected ${length}, got ${payload.length})`);
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

    handleLegacyJSON(data) {
        const str = data.toString();

        if (!str.trim().startsWith('{') && !str.trim().startsWith('[')) {
            throw new Error('Invalid JSON prefix');
        }

        if (Buffer.byteLength(str) > PROTOCOL.LEGACY_MAX_SIZE) {
            throw new Error('Legacy message exceeds size limit');
        }

        try {
            return JSON.parse(str);
        } catch (err) {
            throw new Error(`Invalid JSON: ${err.message}`);
        }
    }

    encodeMessage(obj) {
        try {
            const isBinary = obj instanceof Buffer;
            const type = isBinary ? PROTOCOL.MESSAGE_TYPES.BINARY : PROTOCOL.MESSAGE_TYPES.JSON;
            const payload = isBinary ? obj : Buffer.from(JSON.stringify(obj));

            if (payload.length > PROTOCOL.MAX_MESSAGE_SIZE) {
                throw new Error(`Message too large (${payload.length} bytes)`);
            }

            const header = Buffer.alloc(PROTOCOL.HEADER_SIZE);
            header.writeUInt8(type, 0);
            header.writeUInt32BE(payload.length, 1);

            return Buffer.concat([header, payload]);
        } catch (err) {
            console.error('Encoding failed:', err);
            return this.encodeError({
                error: 'Failed to encode message',
                code: 'ENCODING_ERROR'
            });
        }
    }

    encodeError(errorObj) {
        return this.encodeMessage({
            ...errorObj,
            type: 'error',
            protocol: PROTOCOL.MESSAGE_TYPES.ERROR
        });
    }

    findClient(userId) {
        return Array.from(this.wss.clients).find(c =>
            c.userid === userId && c.readyState === WebSocket.OPEN
        );
    }

    broadcast(message, exclude = null) {
        this.wss.clients.forEach(client => {
            if (client !== exclude && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }
}

module.exports = { WSServer };