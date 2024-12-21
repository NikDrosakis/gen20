async function peertopeer(wss,message) {
    // Broadcast the message
    if (message.to) {
        console.log("peertopeer", message.to)
        // let to = `user${to}`;
        const recipientWs = Array.from(wss.clients).find(client => client.userid === message.to);
        if (recipientWs) {
            console.log("found recipient and sending to", message.to)
            recipientWs.send(JSON.stringify(message));
        }
    }
}

module.exports = {
    peertopeer
};

