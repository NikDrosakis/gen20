const WebSocket = require('ws');
const fs = require('fs');
const https = require('https');
const Redis = require('ioredis');
const config = require("../config.json");
const uaParser = require('ua-parser-js');

// Redis client setup
const redis = new Redis({
    host: 'localhost',  // Redis server host
    port: 6379,         // Redis server port
    password: 'yjF1f7uiHttcp' // Use this if your Redis server requires a password
});

// Read SSL credentials
const privateKey = fs.readFileSync("/etc/letsencrypt/live/" + config.domain + "/privkey.pem", 'utf8'),
    certificate = fs.readFileSync("/etc/letsencrypt/live/" + config.domain + "/fullchain.pem", 'utf8'),
    credentials = { key: privateKey, cert: certificate };

// Create HTTPS server
const app = https.createServer(credentials);
const wss = new WebSocket.Server({ server: app });

let activeConnections = 0;
let deviceStats = {};
let uniqueUserSet = new Set();

function isJson(str) {
    try {
        return JSON.parse(str);
    } catch {
        return false;
    }
}

// Broadcast a message to all connected clients
function broadcastMessage(message) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

function updateDeviceStats(userAgent, ip) {
    const deviceInfo = uaParser(userAgent);
    const { browser, os, device } = deviceInfo;

    const key = `${browser.name || 'Unknown Browser'} - ${os.name || 'Unknown OS'} - ${device.type || 'Unknown Device'}`;
    const uniqueUserKey = `${ip}-${browser.name}-${device.type || 'web'}`;
    if (!deviceStats[key]) {
        deviceStats[key] = 0;
    }
    deviceStats[key]++;
    uniqueUserSet.add(uniqueUserKey);
}

function decrementDeviceStats(userAgent, ip) {
    const deviceInfo = uaParser(userAgent);
    const { browser, os, device } = deviceInfo;
    const key = `${browser.name || 'Unknown Browser'} - ${os.name || 'Unknown OS'} - ${device.type || 'Unknown Device'}`;
    const uniqueUserKey = `${ip}-${browser.name}-${device.type || 'web'}`;
    if (deviceStats[key]) {
        deviceStats[key]--;
        if (deviceStats[key] === 0) {
            delete deviceStats[key];  // Remove key if count reaches zero
        }
    }
    uniqueUserSet.delete(uniqueUserKey);
}

wss.on('connection', (ws, req) => {
    const urlParams = new URLSearchParams(req.url.replace('/', ''));
    const uid = urlParams.get('uid') || 'guest';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Capture the IP address of the client
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    activeConnections++;
    console.log(`User ${uid} connected from IP ${ip}. Active connections: ${activeConnections}`);

    // Update device statistics
    updateDeviceStats(userAgent, ip);

    // Store active user in Redis
    redis.sadd('active_users', uid);

    // Handle incoming messages
    ws.on('message', (data) => {
        const mes = isJson(data.toString());
        if (!mes) {
            console.error('Invalid JSON:', data);
            return;
        }
        const readymes = JSON.stringify(mes);
        if (mes.type === 'PING') {
            ws.send(JSON.stringify({ type: 'PONG' })); // Send PONG response
            ws.isAlive = true; // Mark this connection as alive
            return;
        }
        switch (mes.cast) {
            case 'all':
                broadcastMessage(readymes);
                break;
            case 'one':
                if (mes.to) {
                    const to = `user${mes.to}`;
                    const recipientWs = Array.from(wss.clients).find(client => client.uid === mes.to);
                    if (recipientWs) {
                        recipientWs.send(readymes);
                    }
                }
                break;
        }
    });

    // Handle disconnection
    ws.on('close', () => {
        activeConnections--;
        console.log(`User ${uid} disconnected. Active connections: ${activeConnections}`);

        // Remove user from active users set in Redis
        redis.srem('active_users', uid);

        // Decrement device statistics
        decrementDeviceStats(userAgent, ip);

        // Broadcast updated active users
        broadcastActiveUsers();
    });

    ws.isAlive = true;
    ws.uid = uid;  // Assign UID to WebSocket instance

    // Broadcast updated active users
    broadcastActiveUsers();
});

// Function to broadcast unique active users count
function broadcastActiveUsers() {
    const uniqueUserCount = uniqueUserSet.size;
    const message = JSON.stringify({
        type: 'html',
        id: 'active_users',
        html: uniqueUserCount === 0 ? '' : `<em class="c_Bottom cred">${uniqueUserCount}</em>`,
        cast: "all"
    });
    broadcastMessage(message);
}

// Interval to check active connections
const interval = setInterval(() => {
    wss.clients.forEach(ws => {
        if (ws.isAlive === false) {
            return ws.terminate();
        }
        ws.isAlive = false;
    });

    // Log device statistics periodically
    console.log('Device Statistics:', deviceStats);
    console.log('Unique Users:', uniqueUserSet.size);
}, 30000);

wss.on('close', () => {
    clearInterval(interval);
});

// Start HTTPS server
app.listen(config.ws_port, () => {
    console.log(`WebSocket server running on port ${config.ws_port}`);
});
