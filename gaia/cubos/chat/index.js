const WebSocket = require('ws');
const https = require('https');
const fs = require("fs");
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
//const { generateAIResponse, sendAIResponse } = require('./ai');
const { setMongo, getMongo } = require('./mongo');  // Using combined MongoDB functions

require('dotenv').config(); // Load environment variables

const privateKey = fs.readFileSync(process.env.PRIVATE_KEY_PATH, 'utf8');
const certificate = fs.readFileSync(process.env.CERTIFICATE_PATH, 'utf8');
const credentials = { key: privateKey, cert: certificate };

if (cluster.isMaster) {
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
    });
} else {
    const app = https.createServer(credentials).listen(3009, function () {
        console.log(`Worker ${process.pid} listening on port 3009`);
    });

    const wss = new WebSocket.Server({ server: app });

    // Periodically send AI messages
    //setInterval(() => sendAIResponse(wss), 30000);

    wss.on('connection', async (ws, req) => {
        const urlParams = new URLSearchParams(req.url.replace('/', ''));
        const uid = urlParams.get('user') || 'guest';

        const userAgent = req.headers['user-agent'] || 'Unknown';

        // Capture the IP address of the client
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

// WebSocket message handling
        ws.on('message', async (data) => {
            let message;
            // If the data is a buffer, convert it to a string
            if (Buffer.isBuffer(data)) {
                data = data.toString();
            }
            try {
                message = JSON.parse(data);
            } catch (err) {
                console.error('Failed to parse JSON:', err);
                return;
            }
    //        console.log(data)
            switch (message.type) {
                case 'PING':
                    ws.send(JSON.stringify({ type: 'PONG' })); // Send PONG response
                    ws.isAlive = true; // Mark this connection as alive
                    break;
                case 'get':
                    if(uid!='guest') {
                        const res = await getMongo('chat1', {cid: message.cid}); // You can handle this data as needed
                        const response = {
                            system:message.system,
                            page:message.page,
                            type: "res",
                            cid: res.cid,
                            text: res,
                            uid: 'user1',
                            to: 'user1',
                            cid:message.cid
                        };
                        console.log(response);
                        const stringified_message = JSON.stringify(response);
//                        const to = `user${message.to}`;
                        const recipientWs = Array.from(wss.clients).find(client => client.uid === uid);
                        if (recipientWs) {
                            recipientWs.send(stringified_message);
                        }
                    }
                    break;
                case 'update':
                    //const details={ system:G.system,page:G.page,mode:'chat'+ui,type:"set-update",query:{{cid:s.i(m.cid)},{$set:{modified:time()},$push:{chat:{u:who,c:txt,t:time()}},$inc:{[unr]:1}}},cast:'one',cid:parseInt(cid),text:txt,uid:my.userid,to:2};
                case 'insert':
                    console.log(message)
                    if (message.to) {
                        await setMongo(message.collection, message.type, message.where, message.query);
                        const to = `user${message.to}`;
                        const recipientWs = Array.from(wss.clients).find(client => client.uid === message.to);
                        if (recipientWs) {
                            ws.send(JSON.stringify({
                                system:message.system,
                                page:message.page,
                                type: message.type,
                                message: query,
                                message: message.to,
                                original: query
                            }));
                            recipientWs.send(message);
                        }
                        }
                    break;
            };
            // Handle disconnection
            ws.on('close', () => {
                //console.log(`User ${ip} disconnected. Active connections: ${activeConnections}`);
                // Broadcast the disconnection event
                //    broadcastMessage({title:'disconnected',type:'console',text:`User ${uid} disconnected. Active connections: ${activeConnections}`});
                // Decrement device statistics
            //    decrementDeviceStats(userAgent, ip);
            console.log('disconnected ',userAgent,ip)
                // Broadcast updated active users
               // broadcastActiveUsers();
            });

            ws.isAlive = true;
            ws.uid = uid;  // Assign UID to WebSocket instance
    })
    });
    function isJson(str) {
        try {
            return JSON.parse(str);
        } catch (e) {
            return false;
        }
    }
}

function intervals() {
    ws.clients.forEach(function each(ws) {
        var func="1==1";
        var readymes=JSON.stringify({rule:"true",fun:func,type:"com",text:"Interval 1",uid:ws.uid,cast:"one",name:"upvolume"});
        ws.send(readymes);
        ws.ping();
    });
}
