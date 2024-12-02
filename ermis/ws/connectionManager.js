const uaParser = require('ua-parser-js');
const { broadcastMessage, subscribe } = require('../core/Redis'); // Redis module
let deviceStats = {};
let activeConnections = 0;
let uniqueUserSet = new Set();
const WebSocket = require('ws');
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

// Broadcast unique active users count
function broadcastActiveUsers() {
    const uniqueUserCount = uniqueUserSet.size;
    const message = {
        system: 'vivalibro',
        page: '',
        type: 'html',
        id: 'active_users',
        html: uniqueUserCount === 0 ? '' : `<em class="c_Bottom cred">${uniqueUserCount}</em>`,
        title: 'broadcastActiveUsers'
    };
    broadcastMessage(message);
}
const connectionManager = (wss, ws, req) => {
    const urlParams = new URLSearchParams(req.url.replace('/', ''));
    const userid = urlParams.get('userid') || '1';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    // Assign UID to WebSocket instance
     ws.userid = userid; // Store userid on the ws object
    ws.isAlive = true;
    //console.log(req.ws)

    // Increment active connections count
    activeConnections++;

    // Update device statistics
    updateDeviceStats(userAgent, ip);

    // Log active clients
  //  const activeClients = Array.from(wss.clients)
    //    .filter(client => client.readyState === WebSocket.OPEN)
      //  .map(client => client.userid);
    //console.log("Active clients:", activeClients);

    // Interval to check active connections
    const interval = setInterval(() => {
        wss.clients.forEach(ws => {
            if (ws.isAlive === false) {
                return ws.terminate();
            }
        //    ws.isAlive = false; // Reset isAlive for next check
        });
        // Log device statistics periodically
   //     console.log('Device Statistics:', deviceStats);
        console.log('Unique Users:', uniqueUserSet.size);
    }, 40000);

// Handle the pong response
    ws.on('pong', () => {
        ws.isAlive = true; // Reset isAlive on pong
    });

    // Clear the interval and decrement active connections when the WebSocket server closes
    wss.on('close', () => {
        activeConnections--;
        decrementDeviceStats(userAgent, ip);
        clearInterval(interval);
        broadcastActiveUsers();
    });
};


module.exports = connectionManager;