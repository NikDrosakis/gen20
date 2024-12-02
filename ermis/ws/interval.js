
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

module.exports = {
    interval
};
