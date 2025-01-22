const WebSocket = require('ws');
//const chat = require('../core/Chat');
const Rethink = require("../core/Rethink");
const EventEmitter = require('events');
const { stats } = require('./stats');
const Messenger = require('../core/Messenger');
const emitter = new EventEmitter();
emitter.setMaxListeners(1000);
let wss;


// Usage example:
(async () => {
    const rethink = new Rethink();
    await rethink.connect();

    // Insert a test message in the specified structure
    const message = {
        cid: 1,
        fn: {
            name: "cia",
            fname: "Central Intelligence Agency Lt",
            img: "/uploads/7da2f9c4f064fc722e146073fa05cf65.png"
        },
        fn0: {
            name: "megas",
            fname: "Megas",
            img: "/uploads/c5e80b56ea12f376b08a9818c68ba778.jpg"
        },
        modified: 1736872571,
        privacy: 1,
        uid: 61,
        unread: 1,
        chat: [
            {
                u: 1,
                c: "Hello 6",
                t: 1736872571
            },
            {
                u: 2,
                c: "Hello 7",
                t: 1736872581
            }
        ]
    };
    // await rethink.insertMessage(message);
    // Call upsert to insert or update chat for the cid
    await rethink.upsertChat(message);

    // Get all messages
    const allmes = await rethink.getMessages();
    console.table(allmes)
    // Close the connection
    await rethink.close();
})();

function WServer(server) {
    wss = new WebSocket.Server({ server });
/*
    // Redis subscription
    subscribe(process.env.REDIS_CHANNEL, (message) => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
*/
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
        //Instantiate Actions

       // const finalized_action_message = Messenger.buildMessage(executed_actions);

        //broadcast message event.
        /*
        if(finalized_action_message) {
            wss.clients.forEach(function each(client) {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    console.log("broadcast", finalized_messsage);
                    client.send(finalized_messsage);
                }
            });
        }
        */
        ws.on('message', async (data) => {
            try {
                let message = Buffer.isBuffer(data) ? JSON.parse(data.toString()) : JSON.parse(data);

                if (!message || typeof message.cast !== 'string' || !message.to) {
                    console.warn('Invalid message:', data);
                    return;
                }
               // chat.handleMessage(message, ws); // Use the Chat class to handle messages



                const finalized_messsage = await Messenger.buildMessage(message);

                switch (message.cast) {
                    case "one":
                        if (message.to) {
                            console.log("peertopeer", message.to,message);
                            // let to = `user${to}`;
                            const recipientWs = Array.from(wss.clients).find(client => client.userid === message.to);
                            if (recipientWs) {
                                console.log("found recipient and sending to", message.to)
                                try {
                                    recipientWs.send( JSON.stringify(finalized_messsage));
                                } catch (sendError) {
                                    console.error("Failed to send message to recipient:", sendError);
                                }
                            }
                        }
                        break;
                    default:
                        //broadcast message event.
                            wss.clients.forEach(function each(client) {
                            if (client !== ws && client.readyState === WebSocket.OPEN) {
                                console.log("broadcast", finalized_messsage);
                                client.send(finalized_messsage);
                            }})
                        break;
                }
            } catch (err) {
                console.error('Error processing message:', err);
                ws.send(JSON.stringify({ error: 'Invalid message format or internal error.' }));
            }
        });
    });
}
module.exports = { WServer };