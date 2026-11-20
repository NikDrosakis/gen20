// /index.js
// 1. Οι Πλανήτες & οι Βάσεις
const systems = [
    // Πλανήτες
    { id: 'god',      name: 'GOD',      r: 350, angle: 270, state: 'stopped', shape: 'circle', media: 'https://www.gstatic.com/culturalinstitute/searchar/assets/jupiter/desktop_light.mp4' },
    { id: 'moon',     name: 'MOON',     r: 350, angle: 330, state: 'stopped', shape: 'circle', media: 'https://www.gstatic.com/culturalinstitute/searchar/assets/earths_moon/desktop_light.mp4' },
    { id: 'gaia',     name: 'GAIA',     r: 350, angle: 30,  state: 'stopped', shape: 'circle', media: 'https://media.giphy.com/media/mf8UbIDew7e8g/giphy.gif' },
    { id: 'kronos',   name: 'KRONOS',   r: 350, angle: 90,  state: 'stopped', shape: 'circle', media: 'https://i.ytimg.com/vi/XvTSB5B0d0w/maxresdefault.jpg' },
    { id: 'mars',     name: 'MARS',     r: 350, angle: 150, state: 'stopped', shape: 'circle', media: 'https://www.gstatic.com/culturalinstitute/searchar/assets/mars/desktop_light.mp4' },

    // Βάσεις Δεδομένων (Τετράγωνες)
    { id: 'database', name: 'MariaDB',  r: 200, angle: 45,  state: 'stopped', shape: 'square', media: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRL58aHclEzkBlr4yhPwyynoyDPMVcyNqqIXPPpHHy9I7MwpAg-_zXx9HHAr6W1AtY6r0mTB5WDropFq3W12a2WXRJJ8BsGJ-wFSFBdqPBU&s=10' },
    { id: 'couchdb',  name: 'CouchDB',  r: 220, angle: 315, state: 'stopped', shape: 'square', media: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOUILGZX2cDGbfoIa7PE-97QL4mLdCzmM1e12FwRgmoW91lJdMn2A-1cwhuIDFlHszX3r2zwuAhB5IqI5ENDH_3xwgWhbINoW4LyFtZAtVqA&s=10' },
    { id: 'redis',    name: 'Redis',    r: 120, angle: 0,   state: 'stopped', shape: 'square', media: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTf5rqbnsf7gXv6hTVdeu7lCdpw1mrpcl6B_hXa_oxicCbH2XXxW8nVCAslf3ujrW7-FZzjK-RzU6sKm6bPrD7NSXNLzgBiruHpefwMyAI9PA&s=10' }
];

const connections = [
    { from: 'god', to: 'couchdb' },
    { from: 'gaia', to: 'database' },
    { from: 'god', to: 'moon' },
    { from: 'kronos', to: 'god' },
    { from: 'moon', to: 'gaia' }
];

const planetsGroup = document.getElementById('planets');
const orbitsGroup = document.getElementById('orbits');
const ptyLog = document.getElementById('pty-log');
const wsLog = document.getElementById('ws-log');

let ws;
let ptyWs;

// ============================================================
// 1. Σχεδίαση (μένει ίδια)
// ============================================================
function getCoordinates(r, angleDeg) {
    const angleRad = (angleDeg - 90) * (Math.PI / 180);
    return {
        x: 500 + (r * Math.cos(angleRad)),
        y: 500 + (r * Math.sin(angleRad))
    };
}

function drawPlanets() {
    planetsGroup.innerHTML = '';
    systems.forEach(sys => {
        const pos = getCoordinates(sys.r, sys.angle);
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', `planet ${sys.state}`);
        g.setAttribute('id', `planet-${sys.id}`);
        g.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);

        const isSquare = sys.shape === 'square';
        const size = isSquare ? 100 : 140;
        const radius = isSquare ? 50 : 70;
        const clipPath = isSquare ? 'url(#square-clip)' : 'url(#circle-clip)';

        if (sys.media) {
            if (sys.media.endsWith('.mp4')) {
                const fo = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
                fo.setAttribute('x', `-${radius}`); fo.setAttribute('y', `-${radius}`);
                fo.setAttribute('width', size); fo.setAttribute('height', size);
                fo.setAttribute('clip-path', clipPath);

                const video = document.createElement('video');
                video.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
                video.setAttribute('width', size); video.setAttribute('height', size);
                video.setAttribute('autoplay', ''); video.setAttribute('loop', ''); video.setAttribute('playsinline', ''); video.setAttribute('preload', 'auto');
                video.muted = true;
                video.style.objectFit = 'cover';
                if (isSquare) video.style.borderRadius = '10px';

                const source = document.createElement('source');
                source.setAttribute('src', sys.media); source.setAttribute('type', 'video/mp4');
                video.appendChild(source);

                if (sys.state === 'stopped') video.style.filter = 'grayscale(100%) opacity(0.3)';
                video.addEventListener('canplay', () => { video.play().catch(e => console.log("Autoplay blocked:", e)); });

                fo.appendChild(video);
                g.appendChild(fo);
            } else {
                const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
                image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', sys.media);
                image.setAttribute('x', `-${radius}`); image.setAttribute('y', `-${radius}`);
                image.setAttribute('width', size); image.setAttribute('height', size);
                image.setAttribute('clip-path', clipPath);
                if (sys.state === 'stopped') image.setAttribute('style', 'filter: grayscale(100%) opacity(0.3);');
                g.appendChild(image);
            }
        }

        if (isSquare) {
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('class', 'ring');
            rect.setAttribute('x', `-${radius}`); rect.setAttribute('y', `-${radius}`);
            rect.setAttribute('width', size); rect.setAttribute('height', size);
            rect.setAttribute('rx', '10');
            g.appendChild(rect);
        } else {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('class', 'ring');
            circle.setAttribute('cx', '0'); circle.setAttribute('cy', '0'); circle.setAttribute('r', radius);
            g.appendChild(circle);
        }

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '0'); text.setAttribute('y', radius + 30);
        text.textContent = sys.name;
        g.appendChild(text);

        g.addEventListener('click', () => {
            document.getElementById('ws-input').value = `${sys.id} esti`;
            document.getElementById('ws-input').focus();
        });
        planetsGroup.appendChild(g);
    });
}

function drawOrbits() {
    orbitsGroup.innerHTML = '';
    connections.forEach(conn => {
        const sysFrom = systems.find(s => s.id === conn.from);
        const sysTo = systems.find(s => s.id === conn.to);
        if(!sysFrom || !sysTo) return;

        const posFrom = getCoordinates(sysFrom.r, sysFrom.angle);
        const posTo = getCoordinates(sysTo.r, sysTo.angle);

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', posFrom.x); line.setAttribute('y1', posFrom.y);
        line.setAttribute('x2', posTo.x); line.setAttribute('y2', posTo.y);
        line.setAttribute('class', 'orbit');

        if(sysFrom.state === 'running' && sysTo.state === 'running') line.classList.add('active');
        orbitsGroup.appendChild(line);
    });
}

function updateGalaxyState(newState) {
    systems.forEach(sys => {
        if(newState[sys.id]) {
            sys.state = newState[sys.id];
            const planetEl = document.getElementById(`planet-${sys.id}`);
            if(planetEl) {
                planetEl.setAttribute('class', `planet ${sys.state}`);
                const mediaEl = planetEl.querySelector('image, video');
                if (mediaEl) {
                    if (sys.state === 'stopped') {
                        mediaEl.style.filter = 'grayscale(100%) opacity(0.3)';
                    } else {
                        mediaEl.style.filter = 'none';
                    }
                }
            }
        }
    });
    drawOrbits();
}

// ============================================================
// 2. WebSockets & Peer-to-Peer (ΝΕΟ)
// ============================================================
const MY_UID = 'galaxy:1'; // Το UID του Galaxy
const SOL_UID = 'sol:1';   // Το UID του Sol
const WS_TOKEN = 'Z2FsYXh5fDF8YWRtaW58MjExMDQ5MzA0NQ.0526882e7d5a397ccf407623471583019ef49a86d901aea52301c4a3b02cb1ef';   // pre-minted admin token (galaxy:1)

function makeCid(a, b) {
    return a < b ? `${a}-${b}` : `${b}-${a}`;
}

function connectWebSockets() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;

    // WebSocket για το Messaging Hub (Peer-to-Peer)
    const wsUrl = `${protocol}//${host}/god/v1/messaging/ws?token=${WS_TOKEN}`;
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        wsLog.innerHTML += `\n<span style="color:#00ff41">[WS] Connected as ${MY_UID}</span>`;
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);

            // chat: αποθηκευμένο μήνυμα (insert) ή απλό message
            if ((data.type === 'insert' || data.type === 'message') && data.c) {
                wsLog.innerHTML += `\n<span style="color:#ffaa00">[${data.uid || data.userid || '?'}]</span> ${data.c}`;
            }
            // σφάλμα από το hub
            else if (data.type === 'error' && data.c) {
                wsLog.innerHTML += `\n<span style="color:#ff5555">[ERR]</span> ${data.c}`;
            }
            // Αν είναι state update
            else if (data.type === 'state' && data.systems) {
                updateGalaxyState(data.systems);
            }
            else {
                wsLog.innerHTML += `\n<span style="color:#ccc">[RAW] ${JSON.stringify(data)}</span>`;
            }

            wsLog.scrollTop = wsLog.scrollHeight;
        } catch(e) {
            wsLog.innerHTML += `\n<span style="color:#ccc">${event.data}</span>`;
            wsLog.scrollTop = wsLog.scrollHeight;
        }
    };

    ws.onclose = () => {
        wsLog.innerHTML += `\n<span style="color:#ff0055">[WS] Disconnected. Retrying...</span>`;
        setTimeout(connectWebSockets, 3000);
    };

    // PTY WebSocket (μένει ίδιο)
    const ptyUrl = `${protocol}//${host}/god/v1/pty?userid=galaxy%3A1`;
    ptyWs = new WebSocket(ptyUrl);
    ptyWs.onopen = () => { ptyLog.innerHTML += `\n<span style="color:#00ff41">[PTY] Connected.</span>`; };
    ptyWs.onmessage = (event) => { ptyLog.innerHTML += `\n${event.data}`; ptyLog.scrollTop = ptyLog.scrollHeight; };
}

// ============================================================
// 3. Events (ΝΕΟ FORMAT)
// ============================================================
function sendRawWS(obj) {
    if(ws && ws.readyState === WebSocket.OPEN) {
        // Προσθέτουμε uid και modified αν δεν υπάρχουν
        const payload = {
            ...obj,
            uid: obj.uid || MY_UID,
            modified: obj.modified || Math.floor(Date.now() / 1000)
        };
        ws.send(JSON.stringify(payload));
    }
}

function sendWSCmd(cmd, targetUid = SOL_UID) {
    const cid = makeCid(MY_UID, targetUid);
    wsLog.innerHTML += `\n<span style="color:#00ff41">${MY_UID}> [to ${targetUid}] ${cmd}</span>`;
    sendRawWS({
        type: "message",
        cid: cid,
        c: cmd
    });
}

// ============================================================
// 4. Event Listeners
// ============================================================
document.getElementById('ws-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const cmd = e.target.value.trim();
        if(cmd) {
            // Αν το cmd ξεκινάει με "to ", αλλάζουμε τον στόχο
            if (cmd.startsWith('to ')) {
                const parts = cmd.split(' ');
                const target = parts[1];
                const actualCmd = parts.slice(2).join(' ');
                sendWSCmd(actualCmd, target);
            } else {
                sendWSCmd(cmd);
            }
            e.target.value = '';
        }
    }
});

document.getElementById('pty-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const cmd = e.target.value.trim();
        if(cmd && ptyWs && ptyWs.readyState === WebSocket.OPEN) {
            ptyLog.innerHTML += `\n<span style="color:#00ff41">gen> ${cmd}</span>`;
            ptyWs.send(cmd + '\n');
            e.target.value = '';
        }
    }
});

// Fallback για autoplay
document.body.addEventListener('click', () => {
    document.querySelectorAll('video').forEach(v => v.play());
}, { once: true });

// ============================================================
// 5. Εκκίνηση
// ============================================================
drawPlanets();
drawOrbits();
connectWebSockets();