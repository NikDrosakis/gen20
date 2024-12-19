const WebSocket = require('ws');
const Redis = require('ioredis');
const Maria = require('../../core/Maria');
const config = require("../../config.json");
const uaParser = require('ua-parser-js'),fun=require("../gaia/functions");
const fs = require('fs');
const ROOT = process.env.ROOT || path.resolve(__dirname);
fs.watch(ROOT+'core', (eventType, filename) => {
    if (filename) {
        console.log(`${filename} file changed: ${eventType}`);
        broadcastMessage({ type: 'reload' }); // Notify all clients to reload
    }
});

let wss;  // WebSocket server instance
let activeConnections = 0;
let deviceStats = {};
let uniqueUserSet = new Set();
const recentlyBroadcastedActivities = new Set();
const { getCounters } = require('./types/vivalibro_N');  // Import the counters

// Initialize the Maria class with your MySQL config
const maria = new Maria({
    host: 'localhost',
    user: 'root',
    password: 'n130177!',
    database: 'gen_vivalibrocom'
});

// Initialize Redis client for both subscribing and publishing
const redisClient = new Redis({
    host: 'localhost',
    port: 6379,
    password: 'yjF1f7uiHttcp'
});

//async function loadCubos(page){

//}
// Function to broadcast a message using Redis Pub/Sub

function broadcastMessage(message) {
    // Broadcast the message
    redisClient.publish('broadcast_channel', JSON.stringify(message));
}

function setupWebSocket(server) {
    wss = new WebSocket.Server({ server });

    // Subscribe to Redis channel for broadcasts
    const redisClient  = new Redis({
        host: 'localhost',
        port: 6379,
        password: 'yjF1f7uiHttcp'
    });

    redisClient.subscribe('broadcast_channel', (err) => {
        if (err) {
            console.error('Failed to subscribe to Redis channel:', err);
        }
    });
    redisClient.on('message', (channel, message) => {
        if (channel === 'broadcast_channel') {
            // Broadcast the message to all connected clients
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        }
    });

    wss.on('connection', async (ws, req) => {
        const urlParams = new URLSearchParams(req.url.replace('/', ''));
        const userid = urlParams.get('userid') || '1';
        const userAgent = req.headers['user-agent'] || 'Unknown';
        // Capture the IP address of the client
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        activeConnections++;
     //   broadcastMessage({title:'connected',type:'console',text:`User ${uid} connected from IP ${ip}. Active connections: ${activeConnections}`});
        // Update device statistics
        updateDeviceStats(userAgent, ip);
        ws.on('open', () => {

        })
        // Handle incoming messages
        ws.on('message', async (data) => {
            let message;
            // If the data is a buffer, convert it to a string
            if (Buffer.isBuffer(data)) {
                data = data.toString();
            }
message=JSON.parse(data);
console.log(message.page)
            const activeClients = Array.from(wss.clients)
                .filter(client => client.readyState === WebSocket.OPEN)
                .map(client => client.userid);

            console.log("Active clients:", activeClients);
if(message.type=='open' && message.text=='PING' && message.system=='vivalibrocom') {
    await fetchCubosAndSend(message);
}
        });
        //broadcast N
        try {
            const counters = await getCounters();
//                   console.log(counters);
            broadcastMessage({ system:"vivalibrocom",page:'',type: 'N', text:counters,class:"c_square cblue" });
        } catch (err) {
            console.error('Failed to get counters:', err);
        }

        async function fetchCubosAndSend(message) {
            try {
                // Query to fetch cubo IDs and names from the database

                        const cubos = await maria.f(`
                            SELECT p.sr1, p.sr2, p.sl1, p.sl2,
                                   cn1.name AS sr1_name, cn2.name AS sr2_name,
                                   cn3.name AS sl1_name, cn4.name AS sl2_name
                            FROM page p
                                     LEFT JOIN pagecubos cn1 ON p.sr1 = cn1.id
                                     LEFT JOIN pagecubos cn2 ON p.sr2 = cn2.id
                                     LEFT JOIN pagecubos cn3 ON p.sl1 = cn3.id
                                     LEFT JOIN pagecubos cn4 ON p.sl2 = cn4.id
                            WHERE p.main = 'books';`); //[message.page

                        // Check if cubos were retrieved
                        if (!cubos) {
                            console.log('No cubos found for this page.');
                            return;
                        }

                const areas = [
                    {key: 'sr1', id: "slideshow"},
                    {key: 'sr2', id: "similar"},
                    {key: 'sl1', id: "summary"}
                ];
                areas.forEach(async area => {
                    if (area.id) {  // Process only non-null areas
                        let url = `https://vivalibro.com/cubos/index.php?cubo=${area.id}&area=${area.key}&file=public.php`;

                        try {
                            const response = await fetch(url);
                            if (!response.ok) throw new Error('Network response was not ok');

                            const html = await response.text();
                            const mes = JSON.stringify({
                                system: message.system,
                                page: message.page,
                                cast: "one",
                                type: "cubos",
                                html: html,
                                area: area.key,
                                userid: message.userid,
                                to: message.userid
                            });
                         //   console.log(mes)
                            await peertopeer(message.userid,mes);  // Send via WebSocket
                        } catch (error) {
                            console.error('Error fetching cubo HTML:', error);
                        }
                    }
                });
                //  }
            } catch (error) {
                console.error('Error fetching cubos from the database:', error);
            }

        }
        async function peertopeer(to,jsonized_message) {
            // Broadcast the message
           // if (to) {
            console.log("peertopeer",to)

               // let to = `user${to}`;
                const recipientWs = Array.from(wss.clients).find(client => client.userid === to);
                if (recipientWs) {
                    console.log("found recipient and sending cubos to",to)
                    recipientWs.send(jsonized_message);
                }
        //}
        }


        ws.isAlive = true;
        ws.userid = userid;  // Assign UID to WebSocket instance

        // Broadcast updated active users
        broadcastActiveUsers();

        // Handle disconnection
        ws.on('close', () => {
            activeConnections--;
            //console.log(`User ${ip} disconnected. Active connections: ${activeConnections}`);
            // Broadcast the disconnection event
            //    broadcastMessage({title:'disconnected',type:'console',text:`User ${uid} disconnected. Active connections: ${activeConnections}`});
            // Decrement device statistics
            decrementDeviceStats(userAgent, ip);

            // Broadcast updated active users
            broadcastActiveUsers();
        });
    });

// Function to broadcast unique active users count
    function broadcastActiveUsers() {
        const uniqueUserCount = uniqueUserSet.size;
        const message = {
            system: 'vivalibrocom',
            page: '',
            type: 'html',
            id: 'active_users',
            html: uniqueUserCount === 0 ? '' : `<em class="c_Bottom cred">${uniqueUserCount}</em>`,
            title:'broadcastActiveUsers'
        };
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
    }, 40000);

    wss.on('close', () => {
        clearInterval(interval);
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

module.exports = {
    setupWebSocket,
    broadcastMessage
};
