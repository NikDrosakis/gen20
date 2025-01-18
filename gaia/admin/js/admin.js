// Separate async function for file upload //tab a
// Function to apply a layout schema
async function closePanel(channel=2) {
    // Get the mainpage element
    const ch='ch'+channel;
    const mainpage = document.getElementById('mainpage');
    // Modify the style to switch to 2-column grid layout
    mainpage.style.gridTemplateColumns = '1fr';
    mainpage.style.gridTemplateRows = '1fr';
    // Check if ch2 already exists
    let chId = document.getElementById(ch);
    if (chId) {
        // If it exists, clean its content and remove it
        chId.remove();
    }
    gs.cooDel('openDocChannel');gs.cooDel('openGuideChannel');
}

async function openPanel(filepath) {
    // Get the mainpage element
    const mainpage = document.getElementById('mainpage');

    // Modify the style to switch to 2-column grid layout
    mainpage.style.gridTemplateColumns = '2fr 1fr';
    mainpage.style.gridTemplateRows = '1fr';

    // Check if ch2 already exists
    let ch2 = document.getElementById('ch2');
    if (ch2) {
        // If it exists, clean its content and remove it
        ch2.remove();
    }

    // Create a new div element for ch2
    ch2 = document.createElement('div');
    ch2.id = 'ch2';
    ch2.title = 'CHANNEL 2';
    ch2.style.display = 'block';
    ch2.className = 'channel top-right';

    // Append ch2 after ch1
    const ch1 = document.getElementById('ch1');
    ch1.after(ch2);

    // Load the file into ch2
    await gs.api.loadfile(G.ADMIN_ROOT + filepath, 'ch2', function () {
        const folder = !!gs.coo('current_folder') ? gs.coo('current_folder') : G.MEDIA_ROOT;
    });
}


// This function will trigger when dragging starts on an image
function handleDragStart(event) {
    const filename = event.target.getAttribute('data-filename');
    event.dataTransfer.setData('text/plain', filename);
}

// Allow the drop by preventing the default behavior
function handleDragOver(event) {
    event.preventDefault();
}

// This function will handle dropping the image onto the file input area
async function handleDrop(event) {
    event.preventDefault();
    // Get the file name from the dragged image
    const filename = event.dataTransfer.getData('text/plain');

    // Update the input or the preview image with the dropped image
    const imgInput = document.getElementById('img');
    const imgPreview = document.querySelector('.gs-span button img');
    let table = G.sub;
    const db = G.has_maria.replace('gen_','').split('.')[0];
    // Set the image preview to the dragged image
    imgPreview.src = filename;
    await gs.api.maria.q(`update ${table}
                          set img=?
                          where id = ?`, [imgPreview.src, G.id]);
    // You can optionally update the file input with the image URL as a value if needed for form submission
    imgInput.setAttribute('data-dropped', filename); // Storing filename for use
}
async function switchChannels(schema) {
    const mainpage = document.getElementById('mainpage');
    //change css grid
    // console.log(schema);
    const layouts = {
        '0': {name: '1', columns: "1fr", rows: "1fr", channels: 1},
        '1': {name: '1X2', columns: "2fr 1fr", rows: "1fr", channels: 2},  // 70-30
        '2': {name: '2X1', columns: "1fr 1fr", rows: "1fr", channels: 2},  // 50%
        '3': {name: '3', columns: "1fr 1fr 1fr", rows: "1fr", channels: 3},
        '4': {name: '4', columns: "1fr 1fr", rows: "1fr 1fr", channels: 4},
        '5': {name: '6', columns: "1fr 1fr 1fr", rows: "1fr 1fr", channels: 6}
    };
    console.log(schema)
    mainpage.style.gridTemplateColumns = layouts[schema].columns;
    mainpage.style.gridTemplateRows = layouts[schema].rows;
    //save
    //   console.log(schema.channels);
    const keys = Object.keys(G.channels[G.page]);

    //  const chosen = keys.slice(0, schema.channels).reduce((result, key) => {
    //    result[key] = G.channels[G.page][key];
    //apply to pages
    //  var finalizechange = await setChannel(`channel${key}`,G.channels[G.page][key].file);
    //  return result;
    //}, {});
    //  console.log(chosen)
    const chosen = 6;

    const channels_num = layouts[schema].channels;
    console.log("channels_num", channels_num)
    //   gs.coo(`channels_${G.page}`, JSON.stringify(chosen));
    for (let key = 0; key <= 5; key++) {
        //for (const key in chosen) {
        if (key <= channels_num) {
            try {
                await setChannel(`channel${key}`, G.channels[G.page][key].file);
                document.getElementById('channel' + key).style.display = 'block';
            } catch (error) {
                console.error(`Error setting channel ${key}:`, error);
            }
        } else {
            document.getElementById('channel' + key).style.display = 'none';
        }
    }
}

async function setChannel(targetContainerId, file) {
    console.log('Changing item to:', targetContainerId, 'File:', file);
    try {
        const fileloading = await gs.api.loadfile(encodeURIComponent(file), targetContainerId);
        if (fileloading.success) {
            console.log('Successfully set channel', targetContainerId, file);
        } else {
            // Handle the case where fileloading or fileloading.success is not as expected
            console.error('Failed to set channel', targetContainerId, file);
        }
    } catch (error) {
        console.error(`Error loading file for ${targetContainerId}:`, error);
    }
}


// Save state function (to be customized for your needs)
async function dragChangeChannel(targetContainerId, draggedItem) {
// Get the ID of the container and item involved
    var draggedItemHref = draggedItem.querySelector('a').href;
    var page = draggedItemHref.replace(G.ADMIN_URL, '');
    var file = `${G.ADMIN_ROOT}main/${page}/${page}.php`;
    //here get the API and loadfile idea to include a new file instead of the whole page
    console.log('Dragged item:', page, 'to', targetContainerId);
    const fileloading = await gs.api.loadfile(encodeURIComponent(file), targetContainerId);
    if (fileloading && fileloading.success) {
        //save to cookie
        gs.coo(targetContainerId, file);
    }
}

//MAIN MENU & CHANNELS DRAG EFFECT
// Initialize main menu draggable items
function initializeMainMenuDraggables() {
    const menuContainer = document.getElementById('mainmenu');
    const menuItems = document.querySelectorAll('#mainmenu li a');

    // Initialize draggable attributes and event listeners for menu items
    menuItems.forEach(item => {
        item.classList.add('draggablemenu');
        item.setAttribute('draggable', 'true');
        item.style.cursor = 'move';
    });

    Sortable.create(menuContainer, {
        group: {
            name: 'sharedchannels',
            pull: 'clone',  // Allow dragging out of the container
            put: false   // Prevent dropping back into the original container
        },
        sort: false,
        animation: 150,
        handle: '.draggablemenu'
    });
}

// Initialize droppable areas for channels
function initializeDroppableChannels() {
    let droppableMenuAreas = document.querySelectorAll('.channel');

    droppableMenuAreas.forEach(function (area) {
        let sortableInstance = Sortable.create(area, {
            group: 'sharedchannels',  // Allows dragging between containers
            animation: 150,
            sort: false,  // Disable sorting within the area
            onAdd: function (evt) {
                const target = evt.to;
                const item = evt.item;

                if (target.children.length > 0) {
                    // Check if the item is already present in the target container
                    if (!target.contains(item)) {
                        target.appendChild(item);
                    }
                } else {
                    target.appendChild(item);  // Append if target is empty
                }

                dragChangeChannel(evt.to.id, evt.item);
            },
            onUpdate: function (evt) {
                dragChangeChannel(evt.to.id, evt.item);
            }
        });

        activeSortableInstances.push(sortableInstance);
    });
}

// Cleanup function to unbind/uninitialize sortable instances when not in use
function cleanupDroppableChannels() {
    activeSortableInstances.forEach(instance => {
        instance.destroy();  // Destroy sortable instance
    });
    activeSortableInstances = [];  // Clear the instances array
}

// Function to handle channel change logic (custom implementation)
function dragChangeChannel(channelId, item) {
    // Your custom logic for handling channel changes
    console.log(`Item moved to channel: ${channelId}`);
}

// Initialize the sidebar drag-and-drop setup
function initializeSidebarDragAndDrop() {
    initializeMainMenuDraggables();
    initializeDroppableChannels();
}

// Function to reinitialize drag-and-drop for channels when needed
function reinitializeChannels() {
    cleanupDroppableChannels();  // Cleanup previous instances
    initializeDroppableChannels();  // Initialize new instances
}

// Bind/unbind events and sortable instances as necessary
function toggleChannelActivation(isActive) {
    if (isActive) {
        initializeSidebarDragAndDrop();  // Initialize channels
    } else {
        cleanupDroppableChannels();  // Unbind events and clean up
    }
}

///FORM COMMON FUNCTIONS
async function saveContent(col, table) {
    try {
        let value;
        // Check if the field is an editor (CKEditor)
        if (typeof CKEDITOR !== "undefined" && CKEDITOR.instances[col]) {
            // Update the textarea with the latest content from CKEditor
            CKEDITOR.instances[col].updateElement();
            value = CKEDITOR.instances[col].getData(); // Get data from CKEditor
        } else {
            value = document.getElementById(col).value; // Get data from regular textarea
        }
        // Ensure value and column are defined
        if (!value || !col) {
            throw new Error('Column or value is missing');
        }
        if (!G.id) {
            throw new Error('G.id is not defined');
        }
        const row = col; // Assuming you want to use the column name for the database update
        console.log(`Saving content for ${table}.${col}:`, value);
        // Call your savePost function
        const rowToSave = await gs.api.maria.q(`UPDATE ${table}
                                                SET ${row}=?
                                                WHERE id = ?`, [value, G.id]);
        if (rowToSave.success) {
            console.log(`Saved ${G.id}`);
            gs.success("Save content");
        }
    } catch (error) {
        console.error('Error saving content:', error);
    }
}

async function updatePost(event, table) {
    const input = event.target;
    const id = input.id;
    const field = input.name;
    const value = input.value;
    try {
        await gs.api.maria.q(`UPDATE ${field}
                              SET ${field}=?
                              WHERE id = ?`, [value, G.id]);
        console.log(`Updated ${field} for post ID ${G.id}`);
    } catch (error) {
        console.error(`Error updating ${field}:`, error);
    }
}
/*

async function updateForm(selectElement, method, table='') {
    const output = method;
    // Handle method-specific parameters
    handleMethodSpecificParams(method, selectElement, table);
    this.id = selectElement.value;
    try {
        // Fetch the result from the local method
   const tableName = {"table":table}
        console.log(method, tableName)
        const getResult = await gs.api.get(method, tableName);
        console.log(getResult);
        // Handle response based on method
        if (getResult.data) {
            updateUI(getResult.data, output, method);
        } else {
            console.log("No result for method:", method);
        }
    } catch (error) {
        console.error("Error fetching tables:", error);
    }
}
function handleMethodSpecificParams(method, selectElement, table) {
    switch (method) {
        case 'listMariaTables':
            // Clear the previous selections
            gs.coo('selected_db', selectElement.value);
            gs.cooDel('selected_table');
            document.getElementById('listMariaTables').innerHTML = '';
            document.getElementById('buildTable').innerHTML = '';
            table = selectElement.value;
            break;
        case 'buildTable':
            table = table ?? selectElement.value;
            gs.coo('selected_table', table);
        //    updateSchemaAndTable(table);
            break;
        // Additional cases can be added here as needed
    }
}
async function updateSchemaAndTable(table) {
    // Fetch and update the schema and comparison report
    const compareWithStandardReport = await gs.api.get("compareWithStandardReport", table);
    const buildTableID = document.getElementById('compareWithStandardReport');
    if (compareWithStandardReport.data) {
        buildTableID.innerHTML = compareWithStandardReport.data.join('<br/>');
    }
    const buildSchema = await gs.api.get("buildSchema", table);
    const buildSchemaID = document.getElementById('buildSchema');
    if (buildSchema.data) {
        buildSchemaID.innerHTML = buildSchema.data;
    }
}
function updateUI(data, output, method) {
    const nextMethodElement = document.getElementById(output);
    nextMethodElement.innerHTML = '';

    // Add default placeholder option
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = '--Select--';
    nextMethodElement.appendChild(emptyOption);

    // Handle array data (for dropdowns)
    if (Array.isArray(data)) {
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            nextMethodElement.appendChild(option);
        });
    } else if (method === 'buildTable') {
        // For 'buildTable' method, insert HTML table data directly
        nextMethodElement.innerHTML = data;
    }
}
      */


function createPagination(totalPages, currentPage, folder, limit) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = ''; // Clear previous pagination links
    // 1. Previous Button
    if (currentPage > 1) {
        const prevLink = document.createElement('a');
        prevLink.href = '#';
        prevLink.classList.add('prev-link');
        prevLink.textContent = 'Previous';
        prevLink.addEventListener('click', (e) => {
            e.preventDefault();
            loadMedia(folder, currentPage - 1, limit);
        });
        pagination.appendChild(prevLink);
    }
    // 2. First Page
    const firstLink = document.createElement('a');
    firstLink.href = '#';
    firstLink.classList.add('page-link');
    firstLink.textContent = '1';
    if (currentPage === 1) {
        firstLink.classList.add('active');
    }
    firstLink.addEventListener('click', (e) => {
        e.preventDefault();
        loadMedia(folder, 1, limit);
    });
    pagination.appendChild(firstLink);
    const maxVisiblePages = 3; // Adjust as needed
    let startPage = Math.max(1, currentPage - 1); // Start from the page before current
    let endPage = Math.min(totalPages, currentPage + 1); // End on the page after current

    if (startPage > 2) {
        pagination.appendChild(document.createTextNode('...'));
    }
    for (let i = startPage; i <= endPage; i++) {
        const pageLink = document.createElement('a');
        pageLink.href = '#';
        pageLink.classList.add('page-link');
        pageLink.textContent = i;
        // Set 'active' class for the current page
        if (i === currentPage) {
            pageLink.classList.add('active');
        }
        pageLink.addEventListener('click', (e) => {
            e.preventDefault();
            loadMedia(folder, i, limit);
        });
        if (currentPage != 1 && currentPage < totalPages) {
            pagination.appendChild(pageLink);
        }
    }
    if (endPage < totalPages - 1) {
        pagination.appendChild(document.createTextNode('...'));
    }
    // 4.  Last Page
    const lastLink = document.createElement('a');
    lastLink.href = '#';
    lastLink.classList.add('page-link');
    lastLink.textContent = totalPages;
    if (currentPage === totalPages) {
        lastLink.classList.add('active');
    }
    lastLink.addEventListener('click', (e) => {
        e.preventDefault();
        loadMedia(folder, totalPages, limit);
    });
    pagination.appendChild(lastLink);

    // 5.  Next Button
    if (currentPage < totalPages) {
        const nextLink = document.createElement('a');
        nextLink.href = '#';
        nextLink.classList.add('next-link');
        nextLink.textContent = 'Next';
        pagination.appendChild(nextLink);
        nextLink.addEventListener('click', (e) => {
            e.preventDefault();
            loadMedia(folder, currentPage + 1, limit);
        });
    }
}

// For Previous Page
async function previd() {
    try {
        let prev = await gs.api.maria.f(`SELECT id
                                         FROM ${G.sub}
                                         WHERE id < ${G.id}
                                         ORDER BY id DESC LIMIT 1`);
console.log(prev)
        if (prev.success) {
            location.href = `/${G.page}/${G.sub}?id=${prev.data.id}`;
        } else {
            console.log("No previous page found");
        }
    } catch (error) {
        console.error("Error fetching previous page:", error);
    }
};

// For Next Page
async function nextid() {
    try {
        let next = await gs.api.maria.f(`SELECT id
                                         FROM ${G.sub}
                                         WHERE id > ${G.id}
                                         ORDER BY id ASC LIMIT 1`);
        if (next.success) {
            location.href = `/${G.page}/${G.sub}?id=${next.data.id}`;
        } else {
            console.log("No next page found");
        }
    } catch (error) {
        console.error("Error fetching next page:", error);
    }
};

// Tab switching logic
function tab(element) {
    // Get the parent tab group container
    var parent = element.closest('.tabs');
    if (!parent) {
        console.error('Parent tab group not found');
        return; // Exit the function if no parent is found
    }

    // Get the tab id (class name) from the clicked element's data-tab attribute
    var dataTab = element.getAttribute('data-tab');
    console.log('Tab class:', dataTab);

    // Remove 'current' class from all tab links within this tab group
    parent.querySelectorAll('.tab-link').forEach(function (link) {
        link.classList.remove('current');
    });

    // Remove 'current' class from all tab contents within this tab group
    document.querySelectorAll('.tab-content').forEach(function (content) {
        content.classList.remove('current');
    });

    // Add 'current' class to the clicked tab link
    element.classList.add('current');

    // Add 'current' class to the correct tab content within this tab group
    var tabContent = document.getElementById(dataTab);
    if (tabContent) {
        tabContent.classList.add('current');
    } else {
        console.error('Tab content not found for class:', dataTab);
    }
}





    // Wrap in an async function

/*
*
* CHARTS
*
* */
function buildChart2(data, type, chartId) {
    // Parse the input data
    data = JSON.parse(data);

    // Check if data has 'res' key
    if (!data.res) {
        console.error("Invalid data format. 'res' key is missing.");
        return;
    }

    // Extract labels and data points
    const labels = data.res.map(item => item.label || item.week);
    const dataPoints = data.res.map(item => item.total || item.num_posts);

    // Prepare datasets
    const dataset = {
        label: "Chart Data",
        data: dataPoints,
        backgroundColor: getRandomColor(),
        borderColor: getRandomColor(),
        borderWidth: 1
    };

    // Destroy existing chart if it exists
    if (Chart.getChart(chartId)) {
        Chart.getChart(chartId).destroy();
    }

    // Create the chart using Chart.js
    const ctx = document.getElementById(chartId).getContext('2d');
    new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [dataset]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            const label = tooltipItem.label || '';
                            const value = tooltipItem.raw || 0;
                            return `${label}: ${value}`;
                        }
                    }
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}


function buildChart(data, type, chartId) {
    // Parse the input data
   // console.log(data)
    data = JSON.parse(data);

    // Extract unique weeks (x-axis labels)
    const weeks = [...new Set(
        Object.values(data).flatMap(systemData => systemData.map(weekData => weekData.week))
    )];

    // Prepare datasets by system
    const datasets = Object.entries(data).map(([systemName, systemData]) => {
        const dataset = {
            label: systemName,  // Label for each system
            data: aggregateProgress(systemData, weeks),  // Aggregated progress data for each system
            borderColor: getRandomColor(),  // Unique color for each dataset
            backgroundColor: type === 'bar' ? getRandomColor() : 'transparent', // Set background color for bar chart
            fill: type === 'line',  // Fill for line charts
            tension: type === 'line' ? 0.1 : 0  // Smooth line for line charts
        };

        // For pie charts, set backgroundColor to an array of random colors
        if (type === 'pie') {
            dataset.backgroundColor = [];
            dataset.data.forEach(() => {
                dataset.backgroundColor.push(getRandomColor()); // Add a random color for each slice
            });
            delete dataset.borderColor; // Remove borderColor for pie charts
            delete dataset.fill; // Remove fill for pie charts
            delete dataset.tension; // Remove tension for pie charts
        }

        return dataset;
    });

    // Destroy existing chart if it exists
    if (Chart.getChart(chartId)) { // Check if a chart exists
        Chart.getChart(chartId).destroy(); // Destroy the existing chart
    }

    // Create the chart using Chart.js
    const ctx = document.getElementById(chartId).getContext('2d');
    new Chart(ctx, {
        type: type,
        data: {
            labels: type === 'pie' ? Object.keys(data) : weeks,  // X-axis labels (weeks) for bar/line and system names for pie
            datasets: datasets  // System-specific progress data
        },
        options: {
            responsive: true, // Make the chart responsive
            scales: {
                y: {
                    beginAtZero: true  // Ensure Y-axis starts from 0 for bar and line charts
                }
            },
            plugins: {
                // Custom plugin for displaying labels on pie chart slices
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            const label = tooltipItem.label || '';
                            const value = tooltipItem.raw || 0;
                            return `${label}: ${value}`; // Display label and value
                        }
                    }
                },
                // Optionally enable legend if desired
                legend: {
                    display: true,
                    position: 'top' // Position of the legend
                }
            }
        }
    });
}






// Function to aggregate progress data (remove duplicate weeks and match with x-axis weeks)
function aggregateProgress(systemData, weeks) {
    const progressMap = new Map();

    systemData.forEach(({ week, progress }) => {
        // Keep the highest progress value for each unique week
        if (!progressMap.has(week) || progressMap.get(week) < progress) {
            progressMap.set(week, progress);
        }
    });

    // Ensure progress for all weeks is returned (fill missing weeks with 0 progress)
    return weeks.map(week => progressMap.get(week) || 0);
}

// Utility function to generate random colors for datasets
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}