// wsWorker.js
const connections = ['ermis', 'venus'];
const uris = {
    ermis: `wss://vivalibro.com:3010/?user=`,
    venus: `wss://vivalibro.com:3009/?user=`
};
const my={};
const G={};
my.userid='1';
G.SYSTEM='vivalibrocom';
G.page='books';
G.parenting_areas= {
    "h1": "h", "h2": "h", "h3": "h",
    "sl1": "sl", "sl2": "sl", "sl3": "sl",
    "sr1": "sr", "sr2": "sr", "sr3": "sr",
    "fr": "f", "fc": "f", "fl": "f"
};
const wsConnections = {};

const soc = {
    init: (connectionName, uri) => {
        const ws = new WebSocket(uri);

        ws.onopen = soc.open(connectionName);
        ws.onmessage = soc.get(connectionName);
        ws.onerror = soc.error(connectionName);
        ws.onclose = soc.close(connectionName, uri);

        wsConnections[connectionName] = ws;
        return ws;
    },

    open: (connectionName) => (e) => {
        const user = !!my.userid ? my.userid : '1';
        console.info(`${G.SYSTEM}:${G.page} Connection, ${connectionName} established with user:`, user);
        const mes = { system: G.SYSTEM, page: G.page, type: "open", text: "PING", userid: user, to: user, cast: "one" };

        soc.send(connectionName, JSON.stringify(mes));
        postMessage({ connection: connectionName, status: 'open' });
    },

    close: (connectionName, uri) => (e) => {
        if (e.wasClean) {
            console.log(`Connection ${connectionName} closed cleanly, code=${e.code}, reason=${e.reason}`);
        } else {
            console.error(`Connection ${connectionName} died unexpectedly`);
        }
        setTimeout(() => {
            soc.reconnect(connectionName, uri);
        }, 10000);
        postMessage({ connection: connectionName, status: 'closed' });
    },
    load: async function(area, html) {
        if (!!area && !!html) {
            // Create a new div for the cubo area
            let cuboAreaDiv = document.createElement("div");
            cuboAreaDiv.id = area;
            cuboAreaDiv.className = 'cubo';

            // Find the parenting area for the cubo
            let cuboAreaElement = document.getElementById(G.parenting_areas[area]);

            if (!!cuboAreaElement) {
                // Append the new div to the parent area
                cuboAreaElement.appendChild(cuboAreaDiv);

                // Check if the area exists and update its innerHTML with the content
                let cuboAreaSelector = document.querySelector(`#${area}`);
                if (cuboAreaSelector) {
                    cuboAreaSelector.innerHTML = html;
                } else {
                    console.error(`Element with id ${area} not found.`);
                }
            } else {
                console.error(`Parent element for area ${area} not found.`);
            }
        } else {
            console.error('Invalid area or html');
        }
    },
    reconnect: (connectionName, uri) => {
        console.log(`Reconnecting ${connectionName}...`);
        soc.init(connectionName, uri);
    },

    error: (connectionName) => (e) => {
        console.error(`WebSocket ${connectionName} error occurred:`, e);
    },

    send: (connectionName, mes) => {
        const ws = wsConnections[connectionName];
        var user = !!my.userid ? my.userid : 0;
        mes.userid = user;

        if (["venus", "N", "my", "peer", "io"].includes(mes.type)) {
            mes.cast = 'one';
        }

        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(mes);
        } else {
            console.error(`${mes.system}:${mes.page} WebSocket ${connectionName} is not open. Unable to send message:`, mes);
        }
    },

    get: (connectionName) => async (e) => {
console.log("runninng get")
        const message = JSON.parse(e.data);
        console.log(message);
        postMessage(message);
    }
};

// Initialize WebSocket connections
connections.forEach(connection => {
    soc.init(connection, `${uris[connection]}${my.userid}`);
});
