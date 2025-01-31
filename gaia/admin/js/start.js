//offline
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('offline-cache').then((cache) => {
            return cache.addAll([
                '/',
                '/index.php',
                '/generic.php',
                '/css/dashboard.css',
                '/css/core.css',
                '/js/gen.js',
                '/js/start.js',
                '/js/admin.js',
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
// Start the WebSocket connection
const userid=G.my.id ?? 0;


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

// WebSocket instance creation
const ws = gs.soc.init('ermis', `vivalibro.com:3010/?user=${G.my.userid}`);
window[`wsermis`] = ws;  // Store WebSocket instance in window for global access if needed
setTimeout(() => {
    checkWebSocketStatus();
}, 15000);
// Define a function to check the status of each WebSocket connection
function checkWebSocketStatus() {
        const ermisnstance = window[`wsermis`];
        if (ermisnstance) {
            switch (ermisnstance.readyState) {
                case WebSocket.CONNECTING:
                    console.log(`ermis WebSocket is connecting...`);
                    break;
                case WebSocket.OPEN:
                    console.log(`ermis WebSocket is open and ready.`);
                     const notificationweb_panel= document.getElementById('notificationweb_panel');
                       if(notificationweb_panel){notificationweb_panel.className = 'green indicator';}
                        const ermis_panel= document.getElementById('wsy_panel');
                        if(ermis_panel){ermis_panel.className = 'green indicator';}
                    break;
                case WebSocket.CLOSING:
                    console.log(`ermis WebSocket is closing...`);
                    break;
                case WebSocket.CLOSED:
                    console.log(`ermis WebSocket is closed.`);
                    break;
                default:
                    console.log(`ermis WebSocket status is unknown.`);
            }
        } else {
            console.log(`No WebSocket instance found for ermis`);
        }
}

//start all the gseditors
//document.addEventListener('DOMContentLoaded', function () { // Wait for DOM to be ready
  //  const textareas = document.querySelectorAll('textarea.gseditor');
//    textareas.forEach(textarea => {
  //      gs.ui.editor(textarea.id);
//    });
//});




//admin tabs
var at= gs.coo(G.mode+'_tab');
if(at!=false){
    // Set the class attribute of the element with ID 't' + at
    const titleElement = document.getElementById('t' + at);
    if (titleElement) {
        titleElement.className = 'gs-titleActive';
    }

// Set the display style of the element with ID at
    const targetElement = document.getElementById(at);
    if (targetElement) {
        targetElement.style.display = 'block';
    }
}
//prevent contenteditable creative divs
// Select all <code> elements with the contenteditable attribute
document.querySelectorAll('code[contenteditable]').forEach(function(codeElement) {
    codeElement.addEventListener('keydown', function(e) {
        // Trap the return key being pressed
        if (e.keyCode === 13) {
            // Insert 2 <br> tags (if only one <br> tag is inserted, the cursor won't go to the next line)
            document.execCommand('insertHTML', false, '<br><br>');
            // Prevent the default behavior of the return key press
            e.preventDefault();
        }
    });
});

//set notification bar to sidebar
//bufAsync('sidebar','widgets/notification/public');
// Instantiate the ActivityManager
/*
	const activityManager = new ActivityManager();
	$.get('/admin/xhr.php', {a:'errors'},function(res) {
		// Assuming errors is an array of strings
		//console.log(res)
		for(var i in res){
		activityManager.add(res[i]);
		}
	},'json');
*/
//set globals_menu
//const bufferize = new AsyncBufferWorker();
//bufferize.asyncBufferWorker('#globals_menu', '/var/www/admin/compos/global')
//POST
const layoutSchemas = {
    6: {
        columns: '1fr 1fr 1fr', // 3 columns
        rows: '1fr 1fr',        // 2 rows
    },
    4: {
        columns: '1fr 1fr',   // 2 columns
        rows: '1fr 1fr',
    },
    2: {
        columns: '1fr',       // 1 column
        rows: '1fr 1fr',      // 2 rows
    },
    1: {
        columns: '1fr',
        rows: '1fr'
    }
};


// Call initLayout() on page load or when a user changes the layout
// INITIALIZE DRAG AND DROP
var activeSortableInstances = [];  // Store active sortable instances to unbind later
document.addEventListener('DOMContentLoaded', initializeSidebarDragAndDrop);

//FORM + TABLE COMMON FUNCTIONS
document.addEventListener('DOMContentLoaded', () => {

/**
* binding for global internal connecting methods in async method (with php api)
*/
gs.api.binding();
/**
* TABLE pages with id set
*/
    if (G.has_maria && G.id=='') {

        //MAKE SORTABLE
        if(G.sub==''){
            //create 6channel sort
       //     gs.ui.sort(`UPDATE ${G.has_maria} SET sort=? WHERE id = ?`, "list", G.has_maria);
        }else {

        }

        /*
            if (G.id == '') {

              const tableBody = document.querySelector(`#${table}_table tbody`);
              // Event handler for new row
              //document.getElementById(`create_new_${table}`).addEventListener("click", function (event) {
              //    handleNewRow(event, table, newformlist);  // Pass both the event and the table to the function
              //});
              // Event handler for input changes (name, title, status, template)
              tableBody.addEventListener('input', (event) => {
                  updateRow(event, table);
              });
              tableBody.addEventListener('change', (event) => {
                  updateRow(event, table);
              });
              tableBody.addEventListener('click', async (event) => {
                  deleteRow(event, table);
              })
    */
        } else {
            /**
             * _edit.php pages with id set
             */
            const PostBody = document.getElementById('form_post');
            // Event handler for input changes (name, title, status, template)
            if (PostBody) {
                console.log("Adding event listeners to PostBody");
                // Add event listener for input changes in all gs-input fields
                PostBody.addEventListener('input', (event) => {
                    // Check if the input has the class 'gs-input'
                    if (event.target.classList.contains('gs-input')) {
                        console.log('fired');
                        updatePost(event, table);
                    }
                });
                PostBody.addEventListener('change', (event) => {
                    // Check if the input has the class 'gs-input'
                    if (event.target.classList.contains('gs-select')) {
                        console.log('fired');
                        updatePost(event, table);
                    }
                });
            }

        }

});