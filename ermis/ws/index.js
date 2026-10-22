const WebSocket = require('ws');
//const chat = require('../core/Chat');
const EventEmitter = require('events');
const { stats } = require('./stats');
const Messenger = require('../core/Messenger');
const emitter = new EventEmitter();
emitter.setMaxListeners(1000);
let wss;



function WServer(server) {
    wss = new WebSocket.Server({ server });
    wss.setMaxListeners(1000);
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

        const statistics = stats(wss, ws, req); // Track stats
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
                           // console.log("peertopeer", message.to,message);
                            // let to = `user${to}`;
                            const recipientWs = Array.from(wss.clients).find(client => client.userid === message.to);
                            if (recipientWs) {
                                try {
                                    console.log("received message from", finalized_messsage.system, finalized_messsage.verba);
                                    //send reply to user
                                    recipientWs.send(JSON.stringify(finalized_messsage));

                                    //send message to admin
                                    if(finalized_messsage.system!='admin') {
                                        finalized_messsage.system = 'admin';
                                        console.log("publishing event", finalized_messsage.system, finalized_messsage.verba);
                                        recipientWs.send(JSON.stringify(finalized_messsage));
                                    }

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
                                client.send(JSON.stringify(finalized_messsage));
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