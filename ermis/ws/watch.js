//reload.js - Building file automation for reload & notifications
const fs = require('fs');
const path = require('path');
// Use ROOT_DIR from the environment or fallback
require('dotenv').config();
const ROOT = process.env.ROOT || path.resolve(__dirname);
const { publish } = require('./broadcast'); // Redis module

// Function to determine the base folder (system) based on the file path

// Function to watch a directory
function watchDirectory(directory) {
    fs.watch(ROOT+directory.folder, (eventType, file) => {
        if (file) {
            const fullPath = path.join(ROOT+directory.folder, file);
            const baseFolder = getBaseFolder(fullPath); // Get the base folder
            console.log(baseFolder)
            if (baseFolder) {
                const filename = file.split('.')[0];
                console.log(`${file} file changed in ${directory.folder}: ${eventType}`);
                publish(process.env.REDIS_CHANNEL,{ system: baseFolder, type: 'reload', filename:filename }); // Notify all clients to reload
            } else {
                console.warn(`Base folder not found for ${fullPath}`);
            }
        }
    });

    // Read the directory to find subdirectories
    fs.readdir(ROOT+directory.folder, { withFileTypes: true }, (err, files) => {
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
function getBaseFolder(filePath) {
    for (const dir of directoriesToWatch) {
        if (filePath.startsWith(dir.folder)) {
            return dir.system; // Return the system name if the path starts with the folder
        }
    }
    return null; // Return null if no matching base folder is found
}
function watch() {
    // Array of directories to watch
    const directoriesToWatch = [
        { folder: 'core', system: 'admin' },
        { folder: 'cubos', system: 'cubos' },
        { folder: 'public/vivalibro.com', system: 'vivalibrocom' },
        { folder: 'public/gen20.gr', system: 'gen20gr' },
        { folder: 'admin', system: 'admin' }
    ];
// Set up watchers for each directory
    directoriesToWatch.forEach(dir => {
        watchDirectory(dir);
    });
    console.log('Watching directories:', directoriesToWatch.map(dir => dir.folder).join(', '));
}


module.exports = {
    watch
};
