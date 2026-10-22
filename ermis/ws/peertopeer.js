// /var/www/gs/public/ermis/ws/peertopeer.js
async function peertopeer(wss, message) {
    // Broadcast the message
    if (message.to) {
        console.log("peertopeer", message.to, message);

        // Find recipient
        const recipientWs = Array.from(wss.clients).find(client => client.userid === message.to);
        if (recipientWs && recipientWs.readyState === 1) { // WebSocket.OPEN = 1
            console.log("found recipient and sending to", message.to);

            // ✅ ΠΡΕΠΕΙ ΝΑ ΣΤΕΙΛΕΙΣ STRING, ΟΧΙ OBJECT
            const payload = JSON.stringify(message);
            recipientWs.send(payload);

            // Also send confirmation to sender (optional)
            // const sender = Array.from(wss.clients).find(client => client.userid === message.from);
            // if (sender) {
            //     sender.send(JSON.stringify({
            //         type: 'peer_sent',
            //         to: message.to,
            //         content: message.content,
            //         timestamp: Date.now()
            //     }));
            // }
        } else {
            console.log("❌ Recipient not found or not open:", message.to);
            // Send error back to sender
            const sender = Array.from(wss.clients).find(client => client.userid === message.from);
            if (sender) {
                sender.send(JSON.stringify({
                    type: 'peer_error',
                    to: message.to,
                    error: 'User not online',
                    timestamp: Date.now()
                }));
            }
        }
    }
}

module.exports = {
    peertopeer
};