const soc = {
    ws: null,  // Store the WebSocket instance here

    start: () => {
        return new Promise((resolve, reject) => {
            const user = G.my?.id || 0;
            soc.ws = new WebSocket(`wss://${G.HTTP_HOST}:${G.aconf.config.ws_port}/${user}`);

            // Set up WebSocket event listeners
            soc.ws.onopen = (event) => {
                console.info("good", `Connection established for user ${user}`);
                soc.open(event);
                resolve(event); // Resolve the promise when the connection is opened
            };

            soc.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                reject(error); // Reject the promise on connection error
            };

            soc.ws.onclose = soc.close;
            soc.ws.onmessage = soc.get;

            // Start periodic PING messages
            soc.pingInterval = setInterval(() => {
                soc.ping();
            }, 30000);
        });
    },

    ping: () => {
        const mes = {type: "PING", cast: "one"};
        soc.send(mes);
    },

    open: (e) => {
        const user = G.my?.id || 0;
        const mes = {type: "open", text: "PING", userid: user, cast: "all"};
        soc.send(mes);
    },

    close: (e) => {
        if (e.wasClean) {
            console.log("error", `Connection closed cleanly, code=${e.code} reason=${e.reason}`);
        } else {
            console.log("error", `Connection died unexpectedly`);
        }
        document.getElementById('indicator').className = 'red';

        // Clear PING interval
        clearInterval(soc.pingInterval);

        // Attempt to reconnect after 15 seconds
        setTimeout(() => {
            soc.start().catch(err => console.error('Reconnection failed:', err));
        }, 15000);
    },

    send: (mes) => {
        const user = G.my?.id || 0;
        if (user !== 0) {
            switch (mes.type) {
                case "N":
                    mes.rule = "true";
                    mes.fun = "api.red.get('N'+G.my.id,d=>loadN(d));";
                    mes.time = new Date().toISOString();
                    break;
                case "io":
                    mes.rule = "true";
                    break;
            }
            mes.uid = G.my.id;
            mes.name = G.my.name;
            if (["chat", "N", "my", "peer", "io"].includes(mes.type)) {
                mes.cast = 'one';
            }
        } else {
            mes.uid = 0;
            mes.name = "guest";
            mes.cast = 'one';
            mes.to = 0;
            mes.fun = "console.log('reply from server')";
        }
    },
    get: (ev) => {
        const data = JSON.parse(ev.data) || ev.data;
        switch (data.type) {
            case "status":
                console.log(data);
                break;
            case "update":
                console.log(data);
                break;
            case "notify":
                if (data.hasOwnProperty('rule')) {
                    if (eval(data.rule)) {
                        gs.notify("warn", data.text);
                    }
                } else {
                    gs.notify("warn", data.text);
                }
                break;
            case 'N':
            case 'my':
            case 'io':
            case 'com':
                if (eval(data.rule)) {
                    eval(data.fun);
                }
                break;
            case 'html':
                $(`#${data.id}`).html(data.html);
                break;
            case 'chat':
                if (data.hasOwnProperty('rule') && data.hasOwnProperty('fun')) {
                    if (eval(data.rule)) {
                        console.log(data.fun);
                        eval(data.fun);
                    }
                }
                break;
        }
    }
}