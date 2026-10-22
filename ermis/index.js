// /var/www/gs/ermis/index.js
const express = require('express');
const app = express();
const fs = require("fs");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const compression = require('compression');
const path = require('path');
const { exec } = require('child_process');
require('dotenv').config();

// ===== LOGGING =====
const logFilePath = '/var/www/gs/log/ermis.log';
function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${message}\n`;
    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) console.error('Error writing to log file:', err);
    });
    console.log(message);
}

// ===== MIDDLEWARE =====
app.use(express.static("public"));
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: [
        'https://gen20.net',
        'https://gen20.gr',
        'https://directorsunion.gr',
        'https://nikimourtzi.com',
        'http://localhost:5173',
        'http://localhost:3000'
    ]
}));
app.use(express.urlencoded({ limit: '300mb', extended: true }));
app.use(express.json());

// ===== HEALTH =====
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'ermis',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        connections: global.wssConnections || 0,
        sessions: global.wssSessions || 0
    });
});

app.get('/', (req, res) => {
    res.json({
        message: 'Ermis WebSocket Server',
        status: 'running',
        ws: '/ws',
        health: '/health',
        sessions: '/sessions',
        meta: '/meta/:domain/*'
    });
});

// ===== META SERVER - DYNAMIC IMPORT =====
let metaserver = null;

async function initMetaserver() {
    try {
        const module = await import('./services/metaserver/headify.mjs');
        metaserver = module.default;
        log('✅ MetaServer loaded successfully');
        return metaserver;
    } catch (error) {
        log(`❌ Failed to load MetaServer: ${error.message}`);
        return null;
    }
}

// ===== META SERVER ROUTES =====
app.get('/meta/:domain/*', async (req, res) => {
    try {
        if (!metaserver) {
            await initMetaserver();
            if (!metaserver) {
                return res.status(503).json({ error: 'MetaServer not available' });
            }
        }

        const fullPath = '/' + req.params[0];
        req.path = fullPath;
        await metaserver.metaHandler(req, res);
    } catch (error) {
        console.error('❌ Meta error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/admin/domains', async (req, res) => {
    try {
        if (!metaserver) {
            await initMetaserver();
            if (!metaserver) {
                return res.status(503).json({ error: 'MetaServer not available' });
            }
        }
        const domains = metaserver.getDomainsList();
        res.json({
            success: true,
            domains,
            count: domains.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/admin/reload-domains', async (req, res) => {
    try {
        if (!metaserver) {
            await initMetaserver();
            if (!metaserver) {
                return res.status(503).json({ error: 'MetaServer not available' });
            }
        }
        const result = metaserver.reloadDomains();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




// ===== WEBSOCKET =====
const server = require('http').createServer(app);
const { WSServer } = require('./ws/main');

const wsConfig = {
    maxConnections: 1000,
    connectionTimeout: 30000,
    pingInterval: 25000,
    maxPayload: 10 * 1024 * 1024,
    verifyClient: (info) => true
};

let wssInstance = null;

try {
    const wss = new WSServer(server, wsConfig);
    wssInstance = wss;

    setInterval(async () => {
        if (wssInstance) {
            const stats = await wssInstance.getStats();
            global.wssConnections = stats.connections || 0;
            global.wssSessions = stats.active || 0;
        }
    }, 5000);

    server.on('error', (err) => {
        console.error('Server error:', err);
    });

    // ===== SESSION ENDPOINTS =====
    app.get('/sessions', async (req, res) => {
        try {
            if (!wssInstance) {
                return res.status(503).json({ error: 'WebSocket server not ready' });
            }
            const sessions = await wssInstance.sessionManager.getActiveSessions();
            res.json({
                success: true,
                sessions,
                count: sessions.length
            });
        } catch (error) {
            console.error('❌ Sessions error:', error);
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/sessions/stats', async (req, res) => {
        try {
            if (!wssInstance) {
                return res.status(503).json({ error: 'WebSocket server not ready' });
            }
            const stats = await wssInstance.sessionManager.getStats();
            res.json({
                success: true,
                ...stats,
                connections: global.wssConnections || 0
            });
        } catch (error) {
            console.error('❌ Stats error:', error);
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/sessions/:id', async (req, res) => {
        try {
            if (!wssInstance) {
                return res.status(503).json({ error: 'WebSocket server not ready' });
            }
            const session = await wssInstance.sessionManager.getSession(req.params.id);
            if (!session) {
                return res.status(404).json({ error: 'Session not found' });
            }
            res.json({ success: true, session });
        } catch (error) {
            console.error('❌ Session error:', error);
            res.status(500).json({ error: error.message });
        }
    });

    app.delete('/sessions/:id', async (req, res) => {
        try {
            if (!wssInstance) {
                return res.status(503).json({ error: 'WebSocket server not ready' });
            }
            const session = await wssInstance.sessionManager.closeSession(req.params.id);
            if (!session) {
                return res.status(404).json({ error: 'Session not found' });
            }
            res.json({
                success: true,
                message: 'Session closed',
                session
            });
        } catch (error) {
            console.error('❌ Delete session error:', error);
            res.status(500).json({ error: error.message });
        }
    });

    app.post('/sessions/cleanup', async (req, res) => {
        try {
            if (!wssInstance) {
                return res.status(503).json({ error: 'WebSocket server not ready' });
            }
            const cleaned = await wssInstance.sessionManager.cleanup();
            res.json({
                success: true,
                message: `Cleaned ${cleaned} expired sessions`,
                cleaned
            });
        } catch (error) {
            console.error('❌ Cleanup error:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // ===== START SERVER =====
    const PORT = process.env.ERMIS_PORT || 3010;
    server.listen(PORT, '127.0.0.1', function () {
        log(`✅ Ermis WebSocket Server running on port ${PORT}`);
        log(`   Health: http://127.0.0.1:${PORT}/health`);
        log(`   WebSocket: ws://127.0.0.1:${PORT}/ws`);
        log(`   Sessions: http://127.0.0.1:${PORT}/sessions`);
        log(`   Meta: http://127.0.0.1:${PORT}/meta/:domain/*`);
        log(`   Nginx proxy: https://gen20.gr/ermis/v1/ws`);
    });

    process.on('SIGTERM', () => {
        console.log('SIGTERM received. Closing server...');
        if (wssInstance) {
            wssInstance.close(() => {
                server.close(() => {
                    console.log('Server terminated gracefully');
                    process.exit(0);
                });
            });
        } else {
            server.close(() => {
                console.log('Server terminated gracefully');
                process.exit(0);
            });
        }
    });

} catch (err) {
    console.error('❌ Failed to start WebSocket server:', err);
    process.exit(1);
}

// ===== INITIALIZE META SERVER =====
(async function init() {
    await runScripts();
    log('✅ MetaServer initialization complete');
})();


async function runScripts() {
    log('🔧 Running initialization scripts...');

    // Run routerize.mjs
    try {
        log('📦 Running routerize.mjs...');
        exec('node ./services/metaserver/routerize.mjs', (error, stdout, stderr) => {
            if (error) {
                log(`❌ Routerize error: ${error.message}`);
                return;
            }
            if (stderr) {
                log(`⚠️ Routerize stderr: ${stderr}`);
            }
            log(`✅ Routerize completed:\n${stdout}`);
        });
    } catch (error) {
        log(`❌ Failed to run routerize: ${error.message}`);
    }

    // Initialize MetaServer
    await initMetaserver();

    log('✅ Services initialization complete');
}

