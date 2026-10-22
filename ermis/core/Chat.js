const rethink = require('./Rethink');

class Chat {
constructor(wss, dbConfig) {
    this.wss = wss;
    this.db = new rethink();
    this.db.connect().then(() => {
        console.log('Chat: Connected to rethink');
    }).catch((error) => {
        console.error('Chat: Error connecting to rethink:', error);
    });
}

async handleMessage(message, senderWs) {
    try {
        const parsedMessage = JSON.parse(message);
        const type = parsedMessage.type;
        this.db.createDatabaseAndTable()
        const allmes = rethink.getAllMessages();
        console.table(allmes);
        switch (type) {
            case "one":
                await this.handlePeerToPeerMessage(parsedMessage, senderWs);
                break;
            // Add other cases for different message types
            default:
                console.log("Unknown message type:", type);
        }
    } catch (error) {
        console.error("Error handling message:", error);
    }
}

async handlePeerToPeerMessage(message, senderWs) {
    if (message.to) {
        console.log("peertopeer", message.to, message);
        const recipientWs = Array.from(this.wss.clients).find(client => client.userid === message.to);
        if (recipientWs) {
            console.log("found recipient and sending to", message.to);
            try {
                await this.pushMessage(message);
                recipientWs.send(JSON.stringify(message));
            } catch (sendError) {
                console.error("Failed to send message to recipient:", sendError);
            }
        } else {
            console.log("recipient not found", message.to);
        }
    }
}

async pushMessage(message) {
    try {
        // Check if message already has _id, if not use cid
        if (!message._id) {
            message._id = message.cid;
        }
        await this.db.upsertMessage(message);
        console.log('Message saved to database:', message._id);
    } catch (error) {
        console.error('Error pushing message to database:', error);
    }
}
}

module.exports = Chat;