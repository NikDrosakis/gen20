// Import required modules
const fs = require('fs');
const path = require('path');
const Maria = require('./core/Maria'); // Adjust the path as necessary
require('dotenv').config();
const ROOT = process.env.ROOT || path.resolve(__dirname);
const mariadmin = new Maria(process.env.MARIADMIN);
const { updateEndpointParams } = require('./action');

// Watch a specific directory
async function watchSystem(directory, systems) {
    const watcher = fs.watch(path.resolve(ROOT, directory.path), { recursive: true }, (eventType, file) => {
        if (file) {
            const fullPath = path.join(ROOT, directory.path, file);
            const dir = systems.find(d => fullPath.startsWith(path.resolve(ROOT, d.path)));
            const baseFolder = dir ? dir.name : null;
            console.log(baseFolder);
            const filename = path.parse(file).name;
            // watch update
            if(filename === 'routes.js'){
                //scan to get endpoints and params
                await updateEndpointParams(endpoints,params,baseFolder);
            }
            //execute action

        }
    });
    return watcher;
}

// Watch function to initialize all directories
async function fswatch() {
    const watchers = {};
    try {
        const systems = await mariadmin.fa("SELECT * FROM systems WHERE status='active'");

        if (!systems || systems.length === 0) {
            throw new Error("No active systems found for watching.");
        }
        systems.forEach(dir => {
            if (!watchers[dir.id]) {
                watchers[dir.id] = watchSystem(dir, systems);
                process.stdout.write(`👀 Watching directory: ${dir.path}\n`);
            }
        });
        return true;
    } catch (error) {
        console.info(`✗  Initializing watch:`, error.message);
        return false;
    }
}

// Build watch list from the database
async function buildWatch(rec) {
    try {
        const watchList = await mariadmin.fa(`SELECT actiongrp.keys, actiongrp.name as grpName, action.*
                                              FROM action LEFT JOIN actiongrp ON actiongrp.id = action.actiongrpid
                                              WHERE actiongrp.name='fswatch' ORDER BY action.sort;`);
        await fswatch(); // get json_merged_id_name_path_with_this
        return true;
    } catch (error) {
        console.trace(`✗  Setting up watch:`, error);
        return false;
    }
}

// Export buildWatch for use in action.js
module.exports = {
    buildWatch, fswatch
};
