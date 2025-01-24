
// Start the WebSocket connection
const userid=!!gs.coo('GSID') ?  gs.coo('GSID') : '1';
const my={};
my.userid=!!gs.coo('GSID') ?  gs.coo('GSID') : '1';
//gs.soc.start(`${G.TEMPLATE}.com:${G.aconf.config.ws_port}/${uid}`);
// Start the WebSocket Worker

// Function to update UI indicators based on WebSocket status
function updateConnectionIndicator(connection, isConnected) {
    if (isConnected) {
        const notificationweb_panel = document.getElementById('notificationweb_panel');
        if (connection === 'ermis' && notificationweb_panel) {
            notificationweb_panel.className = 'green indicator';
        }
        const wsy_panel = document.getElementById('wsy_panel');
        if (connection === 'ermis' && wsy_panel) {
            wsy_panel.className = 'green indicator';
        }
        const venus_panel = document.getElementById('venus_panel');
        if (connection === 'venus' && venus_panel) {
            venus_panel.className = 'green indicator';
        }
    } else {
        // Reset indicators if not connected
        const notificationweb_panel = document.getElementById('notificationweb_panel');
        if (notificationweb_panel) {
            notificationweb_panel.className = '';
        }
        // Add similar resets for other panels as needed
    }
}


// Usage examples for WebSocket instance creation
const connections = ['ermis', 'venus'];
const uris = { ermis: `vivalibro.com:3010/?user=${my.userid}`, venus: `vivalibro.com:3009/?user=${my.userid}` };
connections.forEach(connection => {
    const ws = gs.soc.init(connection, uris[connection]);
    window[`ws${connection}`] = ws;  // Store WebSocket instance in window for global access if needed
});
setTimeout(() => {
    checkWebSocketStatus();
}, 5000);
// Define a function to check the status of each WebSocket connection
function checkWebSocketStatus() {
    connections.forEach(connection => {
        const ermisnstance = window[`ws${connection}`];
        console.log(connection);
        if (ermisnstance) {
            switch (ermisnstance.readyState) {
                case WebSocket.CONNECTING:
                    console.log(`${connection} WebSocket is connecting...`);
                    break;
                case WebSocket.OPEN:
                    console.log(`${connection} WebSocket is open and ready.`);
                    if(connection=='ermis') {
                        const notificationweb_panel= document.getElementById('notificationweb_panel');
                        if(notificationweb_panel){notificationweb_panel.className = 'green indicator';}
                        const wsy_panel= document.getElementById('wsy_panel');
                        if(wsy_panel){wsy_panel.className = 'green indicator';}
                    }
                    if(connection=='venus') {
                        const venus_panel= document.getElementById('venus_panel');
                        if(venus_panel){venus_panel.className = 'green indicator';}
                    }
                    break;
                case WebSocket.CLOSING:
                    console.log(`${connection} WebSocket is closing...`);
                    break;
                case WebSocket.CLOSED:
                    console.log(`${connection} WebSocket is closed.`);
                    break;
                default:
                    console.log(`${connection} WebSocket status is unknown.`);
            }
        } else {
            console.log(`No WebSocket instance found for ${connection}`);
        }
    });
}


document.addEventListener('DOMContentLoaded', async function () {
    /***********LOAD MAIN*****************/
    if ((G.page == "home" || G.page == "book" || G.page == "libraries" || G.page == "writer" || G.page == "publisher") && G.id == '') {
        //    const booklist = await get_booklist();
        // Container for the book cards


    //temp commented    await solr_vivalibro_search();

    }
      //  await start_cubos();
    //socapi.start(soc_success());
})
/***********INSTANTIATE WEBSOCKETS*****************/

//const socapy = WSClient(3006, 'indicator2');
/***********LOAD WIDGETS*****************/


/*
const socapy = gs.soc.start("3006",'indicator2');
                socapy.start().then(() =>{
                        document.getElementById('indicator2').className='green indicator';
                    })
                    .catch(err => {
                        console.error('WebSocket connection');
                        document.getElementById('indicator2').className = 'red indicator';
                        document.getElementById('c_active_users').innerHTML = '';
                        // Attempt to reconnect after 10 seconds
                        setTimeout(() => {
                            socapy.start()
                                .then(() =>{
                                    console.log('WebSocket connection successfully opened')
                                    document.getElementById('indicator2').className='red indicator';
                                })
                                .catch(err => console.error('Reconnection failed:', err));
                        }, 10000);
                    });
*/

// Start the WebSocket connections
/*socapi.start()
    .then(() => {
        document.getElementById('indicatorMain').className = 'green';
    })
    .catch(err => {
        console.error('WebSocket connection for main failed');
        document.getElementById('indicator').className = 'red';
        document.getElementById('c_active_users').innerHTML = '';
        setTimeout(() => {
            socMain.start()
                .then(() => {
                    console.log('WebSocket connection for main successfully opened');
                    document.getElementById('indicatorMain').className = 'green';
                })
                .catch(err => console.error('Reconnection for main failed:', err));
        }, 10000);
    });

socapy.start()
    .then(() => {
        document.getElementById('indicatorApy').className = 'green';
    })
    .catch(err => {
        console.error('WebSocket connection for apy failed');
        document.getElementById('indicator2').className = 'red indicator';
        //document.getElementById('c_active_users').innerHTML = '';
        setTimeout(() => {
            socApy.start()
                .then(() => {
                    console.log('WebSocket connection for apy successfully opened');
                    document.getElementById('indicator2').className = 'red indicator';
                })
                .catch(err => console.error('Reconnection for apy failed:', err));
        }, 10000);
    });

            });

        }
}}
*/