// /var/www/gs/public/ermis/ws/stats.js
const uaParser = require('ua-parser-js');
let deviceStats = {};
let activeConnections = 0;
let uniqueUserSet = new Set();

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
            delete deviceStats[key];
        }
    }
    uniqueUserSet.delete(uniqueUserKey);
}

function broadcastActiveUsers() {
    const uniqueUserCount = uniqueUserSet.size;
    const message = {
        system: 'vivalibrocom',
        page: '',
        type: 'html',
        id: 'active_users',
        html: uniqueUserCount === 0 ? '' : `<em class="c_Bottom cred">${uniqueUserCount}</em>`,
        title: 'broadcastActiveUsers'
    };
    // publish(message);
}

const stats = (wss, ws, req) => {
    const urlParams = new URLSearchParams(req.url.replace('/', ''));
    const userid = urlParams.get('userid') || '1';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // ✅ ΑΠΟΘΗΚΕΥΣΗ USERID ΣΤΟ WS
    ws.userid = userid;
    ws.isAlive = true;

    // Increment active connections count
    activeConnections++;

    // Update device statistics
    updateDeviceStats(userAgent, ip);

    // Interval to check active connections
    const interval = setInterval(() => {
        wss.clients.forEach(ws => {
            if (ws.isAlive === false) {
                return ws.terminate();
            }
            // ws.isAlive = false; // Reset isAlive for next check
        });
    }, 40000);

    // Handle the pong response
    ws.on('pong', () => {
        ws.isAlive = true;
    });

    // Clear the interval and decrement active connections when the WebSocket server closes
    wss.on('close', () => {
        activeConnections--;
        decrementDeviceStats(userAgent, ip);
        clearInterval(interval);
        broadcastActiveUsers();
    });
};

module.exports = {
    stats
};