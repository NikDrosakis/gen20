// /var/www/gs/public/ermis/ws/main.js
const WebSocket = require('ws');
const { stats } = require('./stats');
const { peertopeer } = require('./peertopeer');
const SessionManager = require('../core/SessionManager');
const RedisService = require('../core/Redis');

class WSServer {
    constructor(server, config = {}) {
        console.log('🔧 Initializing WebSocket server...');

        this.wss = new WebSocket.Server({
            server,
            path: '/ws',
            maxPayload: config.maxPayload || 10 * 1024 * 1024,
            clientTracking: true,
            perMessageDeflate: false,
            handleProtocols: () => false
        });

        this.clients = new Map();
        this.sessionManager = new SessionManager();
        this.redis = RedisService; 
        this.setup();

        console.log('✅ WebSocket server initialized with sessions and Redis');
    }

    setup() {
        this.wss.on('connection', (ws, req) => {
            // Get user from cookies
            const cookies = req.headers.cookie || '';
            const uidMatch = cookies.match(/GENUID=([^;]+)/);
            const nameMatch = cookies.match(/GENNAME=([^;]+)/);
            const imgMatch = cookies.match(/GENIMG=([^;]+)/);

            const userId = uidMatch ? uidMatch[1] : 'anonymous';
            const userName = nameMatch ? nameMatch[1] : 'Guest';
            const userImg = imgMatch ? decodeURIComponent(imgMatch[1]) : null;

            const clientId = Date.now() + '-' + Math.random().toString(36).slice(2, 6);

            // Create session
            this.sessionManager.createSession(clientId, userId, {
                userName,
                userImg,
                ip: req.socket.remoteAddress,
                userAgent: req.headers['user-agent']
            }).then(session => {
                this.clients.set(clientId, { ws, session, userId, userName, userImg });

                console.log(`✅ Client connected: ${clientId} (user: ${userName}, id: ${userId})`);
                console.log(`📊 Active sessions: ${this.clients.size}`);

                // Send welcome
                ws.send(JSON.stringify({
                    type: 'connected',
                    clientId,
                    sessionId: session.id,
                    userId,
                    userName,
                    userImg,
                    timestamp: Date.now()
                }));
            });

            // Stats tracking
            stats(this.wss, ws, req);

            // Redis subscription for this user
            const userChannel = `user:${userId}`;
            if (this.redis && this.redis.subscribe) {
                this.redis.subscribe(userChannel, (msg) => {
                    if (ws.readyState === WebSocket.OPEN) {
                        try {
                            ws.send(msg);
                        } catch (e) {
                            console.error('Error sending subscription message:', e);
                        }
                    }
                });
            }

            ws.on('message', async (data) => {
                try {
                    const message = data.toString();
                    console.log(`📨 Message from ${clientId}:`, message.substring(0, 100));

                    const parsed = JSON.parse(message);
                    await this.handleMessage(ws, parsed, clientId);

                } catch (error) {
                    console.error('❌ Error processing message:', error);
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: error.message,
                        timestamp: Date.now()
                    }));
                }
            });

            ws.on('close', async () => {
                const client = this.clients.get(clientId);
                if (client) {
                    await this.sessionManager.closeSession(client.session.id);
                    this.clients.delete(clientId);
                }
                console.log(`🔴 Client disconnected: ${clientId}`);
                console.log(`📊 Active sessions: ${this.clients.size}`);
            });

            ws.on('error', (error) => {
                console.error(`❌ WebSocket error (${clientId}):`, error.message);
            });

            // Keep-alive ping
            const pingInterval = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.ping();
                }
            }, 30000);

            ws.on('close', () => clearInterval(pingInterval));
        });

        console.log('✅ WebSocket server ready on path: /ws');
    }

    async handleMessage(ws, message, clientId) {
        const client = this.clients.get(clientId);
        if (!client) return;

        await this.sessionManager.updateSession(client.session.id, {
            lastActivity: Date.now()
        });

        switch (message.type) {
            case 'ping':
                ws.send(JSON.stringify({
                    type: 'pong',
                    timestamp: Date.now()
                }));
                break;

            case 'chat':
                await this.handleChat(ws, message, clientId, client);
                break;

            case 'get_session':
                const session = await this.sessionManager.getSession(client.session.id);
                ws.send(JSON.stringify({
                    type: 'session_info',
                    session,
                    timestamp: Date.now()
                }));
                break;

            case 'get_sessions':
                const sessions = await this.sessionManager.getActiveSessions();
                ws.send(JSON.stringify({
                    type: 'sessions_list',
                    sessions,
                    count: sessions.length,
                    timestamp: Date.now()
                }));
                break;

            case 'broadcast':
                if (this.redis && this.redis.publish) {
                    this.redis.publish(process.env.REDIS_CHANNEL || 'vivalibro', {
                        type: 'broadcast',
                        message: message,
                        from: client.userId,
                        timestamp: Date.now()
                    });
                }
                break;

            case 'peer':
                // Peer-to-peer messaging
                console.log("📨 Peer message:", message);

                const { to, content } = message;

                // Αναζήτηση recipient
                const recipient = Array.from(this.wss.clients).find(
                    client => client.userid === to && client.readyState === WebSocket.OPEN
                );

                if (recipient) {
                    // ✅ ΣΤΕΙΛΕ JSON STRING
                    const payload = JSON.stringify({
                        type: 'peer_message',
                        from: client.userId,
                        content: content,
                        timestamp: Date.now()
                    });
                    recipient.send(payload);

                    // Αποστολή επιβεβαίωσης στον sender
                    ws.send(JSON.stringify({
                        type: 'peer_sent',
                        to: to,
                        content: content,
                        timestamp: Date.now()
                    }));

                    console.log(`✅ Message sent to ${to}`);
                } else {
                    console.log(`❌ User ${to} not online`);
                    ws.send(JSON.stringify({
                        type: 'peer_error',
                        message: 'User not online',
                        to: to,
                        timestamp: Date.now()
                    }));
                }
                break;

            default:
                ws.send(JSON.stringify({
                    type: 'echo',
                    message,
                    timestamp: Date.now()
                }));
        }
    }

    async handleChat(ws, message, clientId, client) {
        const content = message.messages?.[0]?.content || '';
        const words = content.split(' ');
        const streamId = message.id || Date.now();

        await this.sessionManager.addMessage(client.session.id, {
            role: 'user',
            content: content
        });

        ws.send(JSON.stringify({
            type: 'chunk',
            content: '🤔 ',
            id: streamId
        }));

        for (let i = 0; i < words.length; i++) {
            if (ws.readyState !== WebSocket.OPEN) break;

            const chunk = words[i] + ' ';
            ws.send(JSON.stringify({
                type: 'chunk',
                content: chunk,
                id: streamId
            }));

            await this.sessionManager.addMessage(client.session.id, {
                role: 'assistant',
                content: chunk,
                streamId: streamId,
                isStreaming: true
            });

            await new Promise(r => setTimeout(r, 60));
        }

        ws.send(JSON.stringify({
            type: 'done',
            id: streamId
        }));

        await this.sessionManager.addMessage(client.session.id, {
            role: 'assistant',
            content: content,
            streamId: streamId,
            isStreaming: false,
            done: true
        });
    }

    async getStats() {
        const sessionStats = await this.sessionManager.getStats();
        return {
            ...sessionStats,
            connections: this.clients.size
        };
    }

    close(callback) {
        this.wss.close(callback);
    }
}

module.exports = { WSServer };