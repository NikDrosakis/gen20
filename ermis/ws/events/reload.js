const fs = require('fs');
const path = require('path');
const { broadcastMessage } = require('../../core/Redis'); // Redis module
/*
* reload event
* */
// Array of directories to watch
const directoriesToWatch = [
    { folder: '/var/www/gs/core', system: 'vivalibrocom' },
    { folder: '/var/www/gs/public/vivalibro.com', system: 'vivalibrocom' },
    { folder: '/var/www/gs/admin', system: 'admin' }
];
// Function to determine the base folder (system) based on the file path
function getBaseFolder(filePath) {
    for (const dir of directoriesToWatch) {
        if (filePath.startsWith(dir.folder)) {
            return dir.system; // Return the system name if the path starts with the folder
        }
    }
    return null; // Return null if no matching base folder is found
}
// Function to watch a directory
function watchDirectory(directory) {
    fs.watch(directory.folder, (eventType, file) => {
        if (file) {
            const fullPath = path.join(directory.folder, file);
            const baseFolder = getBaseFolder(fullPath); // Get the base folder
console.log(baseFolder)
            if (baseFolder) {
                const filename = file.split('.')[0];
                console.log(`${file} file changed in ${directory.folder}: ${eventType}`);
                broadcastMessage('vivalibro',{ system: baseFolder, type: 'reload', filename:filename }); // Notify all clients to reload
            } else {
                console.warn(`Base folder not found for ${fullPath}`);
            }
        }
    });

    // Read the directory to find subdirectories
    fs.readdir(directory.folder, { withFileTypes: true }, (err, files) => {
        if (err) {
            console.error(`Error reading directory ${directory.folder}:`, err);
            return;
        }

        files.forEach(filem => {
            if (filem.isDirectory()) {
                // If it's a directory, watch it recursively
                watchDirectory({ folder: path.join(directory.folder, filem.name), system: directory.system });
            }
        });
    });
}

// Set up watchers for each directory
directoriesToWatch.forEach(dir => {
    watchDirectory(dir);
});

console.log('Watching directories:', directoriesToWatch.map(dir => dir.folder).join(', '));
