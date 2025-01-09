/**
status
default 5
    0 deprecated
    1 dangerous
    2 missing infrustucture
    3 needs updates
    4 inactived wrong failed
    5 new - IN_PROGRESS
    6 working testing experimental mode (may miss sth)
    7 alpha running - currently ready - active
    8 beta working
    9 stable
    10 stable depends others
'active','troubled','inactived','wrong','closed'
 */
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const fs = require('fs');
const express = require('express');
const app = express();
const path = require('path');
const Maria = require('./core/Maria');
const Messenger = require('./core/Messenger');
require('dotenv').config();
const ROOT = process.env.ROOT || path.resolve(__dirname);
const mariadmin = new Maria(process.env.MARIADMIN);
const redFlag = '\x1b[31m✗\x1b[0m';
let executionRunning = false;

const ACTION_STATUS = {
    DEPRECATED: 0,
    DANGEROUS: 1,
    MISSING_INFRASTRUCTURE: 2,
    NEEDS_UPDATES: 3,
    INACTIVE_WRONG_FAILED: 4,
    NEW: 5,
    WORKING_TESTING_EXPERIMENTAL: 6,
    ALPHA_RUNNING_READY: 7,
    BETA_WORKING: 8,
    STABLE: 9,
    STABLE_DEPENDS_OTHERS: 10
};

async function mainLoop() {
    if (executionRunning) {
        process.stdout.write('🏃‍♂️ Loop is already running');
        return; // Avoid concurrent executions
    }
    executionRunning = true;
    try {
        const preLoopCounts = await getActionStatusCounts();
        console.table(preLoopCounts);
        // Fetch only actions that need processing
        const actions = await mariadmin.fa(`
            SELECT actiongrp.keys, actiongrp.name as grpName, actiongrp.base, action.*
            FROM action
            LEFT JOIN actiongrp ON actiongrp.id = action.actiongrpid
            WHERE action.systemsid in (0,3) 
            ORDER BY action.sort;
        `);
        if (!actions || actions.length === 0) {
            process.stdout.write(`✗  No pending actions. Waiting...`);
            //Set next loop in 5 seconds
       //     setTimeout(mainLoop,5000)
        } else {
            const {total, success, statusStats, percentage} = await processActions(actions, app);
            process.stdout.write(`📊 ${success}/${total} --> ${percentage} %success`);
            const postLoopCounts = await getActionStatusCounts();
            process.stdout.write('🏁 Post-Loop Status Counts:');
            console.table(postLoopCounts);
        }
    } catch (err) {
        console.info(`✗  Error in main loop:`, err.message);
        //Set next loop in 10 seconds
      //  setTimeout(mainLoop,10000);
    } finally {
        executionRunning = false;
    }
}
async function processActions(actions) {
    let total = 0;
    let success = 0;
    const statusStats = {
        [ACTION_STATUS.DEPRECATED]: 0,
        [ACTION_STATUS.DANGEROUS]: 0,
        [ACTION_STATUS.MISSING_INFRASTRUCTURE]: 0,
        [ACTION_STATUS.NEEDS_UPDATES]: 0,
        [ACTION_STATUS.INACTIVE_WRONG_FAILED]: 0,
        [ACTION_STATUS.NEW]: 0,
        [ACTION_STATUS.WORKING_TESTING_EXPERIMENTAL]: 0,
        [ACTION_STATUS.ALPHA_RUNNING_READY]: 0,
        [ACTION_STATUS.BETA_WORKING]: 0,
        [ACTION_STATUS.STABLE]: 0,
        [ACTION_STATUS.STABLE_DEPENDS_OTHERS]: 0,
    };

    for (const rec of actions) {
        total++;
        try {
            const startTime = Date.now();
            let result = await executeAction(rec,app);
            const endTime = Date.now();
            const exeTime = endTime - startTime;

            if (result === true) {
                statusStats[ACTION_STATUS.ALPHA_RUNNING_READY]++;
                success++;
                await updateStatus(rec, ACTION_STATUS.ALPHA_RUNNING_READY, `Action completed`, exeTime);
            } else {
                statusStats[ACTION_STATUS.INACTIVE_WRONG_FAILED]++;
                await updateStatus(rec, ACTION_STATUS.INACTIVE_WRONG_FAILED, `Action failed`, exeTime);
            }

        } catch (err) {
            statusStats[ACTION_STATUS.NEEDS_UPDATES]++;
            console.error(`✗  Error processing action ${rec.id}:`, err);
            await updateStatus(rec, ACTION_STATUS.NEEDS_UPDATES, err.message);
        }
    }
    const percentage = total === 0 ? 0 : ((success / total) * 100).toFixed(2);
    return { total, success, statusStats, percentage };
}

async function getActionStatusCounts() {
    const queryParts = Object.entries(ACTION_STATUS).map(([key, val]) => `
    COUNT(CASE WHEN status = ${val} THEN 1 END) as ${key}
  `);

    const query = `SELECT ${queryParts.join(', ')} FROM action WHERE systemsid in(0,3)`;
    const statusCounts = await mariadmin.f(query);

    return statusCounts;
}
function getNextIntervalTime(actions){
    //Get the lowest interval time of the actions.
    if(!actions.length) return 10;
    const intervalTimes = actions.map(a => a.interval_time).filter(t=>t>0);
    if(!intervalTimes.length) return 10;
    return Math.min(...intervalTimes);
}
async function executeAction(rec) {
    try {
        switch (rec.type) {
            case 'route':
                await buildRoute(rec);
                return true;
            case 'int_resource':
                return await buildInternalResource(rec);
            case 'ext_resource':
                return await buildExternalResource(rec);
            case 'generate':
            case 'ai':
                return await buildAI(rec);
            case 'N':
                return await buildN(rec);
            case 'fs':
            //    await buildWatch(rec);
                return true;
            default:
                console.warn(`✗  Unknown type '${rec.type}' for action ID ${rec.id}.`);
                return false;
        }
    } catch (error) {
        console.error(`✗  Error executing action:`, error);
        return false;
    }
}

async function updateStatus(rec, newstatus, log = '', exeTime = 0) {
    await mariadmin.q(
        "UPDATE action SET status = ?, log = ?, updated = CURRENT_TIMESTAMP, exe_time = ? WHERE id = ?",
        [newstatus, log, exeTime, rec.id]
    )
        .then(() => process.stdout.write(`💾 Action ${rec.id} set to status ${newstatus}`))
        .catch((err) => console.info(`✗  Error updating action status:`, err));
}
function scanRoutes(router,prefix='') {
    const mappings = [];
    if (router && router.stack) {
        router.stack.forEach(layer => {
            if (layer.route) {
                const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
                const path = prefix+ layer.route.path;
                mappings.push(`${methods},${path}`);
            }
        });
    }
    return mappings;
}

async function buildRouteEndpoints(routes, prefix) {
    const routeMappings = scanRoutes(routes, prefix);
    if (routeMappings && routeMappings.length > 0) {
        console.info(`   Endpoint mappings for ${prefix}:`);
        routeMappings.forEach(mapping => console.info(`     ${mapping}`));
    }
    return routeMappings;
}

async function checkRouteHealth(rec) {
    const host = rec.base + 'health' || rec.base + 'ping';  // Construct base health URL
    try {
        const response = await fetch(host);  // Check the health URL
        if (!response.ok) {
            console.error(`✗ Health Check Failed: ${host} status: ${response.status}`);
            return false;  // Stop on failure
        } else {
            console.log(`✓ Health Check OK: ${host}`);
        }
    } catch (error) {
        console.error(`✗ Health Check Error for: ${host} ${error.message}`);
        return false;  // Stop on failure
    }
    return true;  // Health check passed
}

async function buildRoute(rec) {
    const routerPath = `services/${rec.grpName}/routes.js`;
    if (fs.existsSync(routerPath)) {
        try {
            const routes = require(`./services/${rec.grpName}/routes`);

            if(routes){
                app.use(`/ermis/v1/${rec.grpName}`, routes);
                console.info(`✓  ${rec.grpName} routed.`);
                //health check
                const healthCheckResult = await checkRouteHealth(rec);

                const routeMappings = await buildRouteEndpoints(routes, `/ermis/v1/${rec.grpName}`);
                return !!routeMappings;
            } else {
                console.info(`✗  Error: No valid router exported from ${routerPath}`);
                return false;
            }

        } catch (error) {
            console.error(`✗  Error loading route ${routerPath}:`, error);
            return false;
        }
    } else {
        console.info(`✗  Invalid path for action group: ${rec.grpName}`);
        return false;
    }
}
async function buildAI(rec) {
    try {
        // Parse the AI endpoint and method from `rec.endpoint`
        const [method, rawurl] = rec.endpoint.split(',');

        // Replace variables in the URL using `renderKeys`
        const url = await renderKeys(rawurl, rec);

        // Example: Only support POST method for AI operations
        if (method === 'POST') {
            process.stdout.write(`--> Processing AI POST request to: ${url}`);

            try {
                // Prepare payload based on `rec.keys` or other data
                const payload = JSON.parse(rec.payload || '{}');

                // Make the POST request to the AI service
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    throw new Error(`✗  HTTP error! status: ${response.status}`);
                }

                // Process the response data
                const data = await response.json();
                process.stdout.write(`${rec.name} AI responded with data:`, data);
                return true;
            } catch (fetchError) {
                console.info(`✗  Error processing AI POST request:`, fetchError.message);
                return false;
            }
        } else {
            console.info(`✗  Unsupported HTTP method for AI: ${method}`);
            return false;
        }
    } catch (err) {
        console.info(`✗  Error building AI route:`, err.message);
        return false;
    }
}

//check this endpoint: UNSPLASH_API_KEY=zUylrbwfwdI2Q9NiSV85oZZcF8oc6CIAJWEwC5sR91Y
async function renderKeys(rawurl, rec) {
    const keyValuePairs = rec.keys.split(',').reduce((acc, pair) => {
        const [key, value] = pair.split('=');
        if (key && value) {
            acc[key] = value;
        }
        return acc;
    }, {});
    try{
        const url = new URL(rawurl);
        for (const [key, value] of url.searchParams.entries()) {
            if (value.startsWith('{') && value.endsWith('}')) {
                const varName = value.slice(1, -1);
                url.searchParams.set(key, keyValuePairs.hasOwnProperty(varName) ? keyValuePairs[varName] : value)
            }
        }
        return url.toString();
    } catch(e){
        console.error(`✗  Error in render keys`,e.message,rawrul,rec);
    }
}


async function buildExternalResource(rec) {
    try {
        // Parse the method and URL
        const [method, rawurl] = rec.endpoint.split(',');

        // Replace variables in the URL using renderKeys function
        const url = await renderKeys(rawurl, rec);
        console.warn(url)
        // Only support GET method for now
        if (method === 'GET') {
            process.stdout.write(`--> Processing GET request to: ${url}`);
            try {
                // Make the fetch request
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`✗ HTTP! status: ${response.status}`);
                }
                // Process the response data
                const data = await response.json();
                process.stdout.write(`✓ ${rec.name} Responsed with data`);
                process.stdout.write(data);
                return true;
            } catch (err) {
                console.info(`✗  Processing GET request:`, err.message);
                return false;
            }
        } else {
            console.info(`✗  Unsupported HTTP method: ${method}`);
            return false;
        }
    } catch (err) {
        console.trace(`✗  Building API route:`, err.message);
        return false;
    }
}
async function buildInternalResource(rec) {
    // Check for requires first
    if (rec.requires) {
        try {
            const requiredModule = require(rec.requires);
            if(typeof requiredModule === 'function'){
                await requiredModule(app);
            }else{
                console.error(`Error loading required module ${rec.requires}: Module is not a function`);
                return false;
            }
        } catch (requireError) {
            console.error(`Error loading required module ${rec.requires}:`, requireError);
            return false;
        }
    }
        try {
           // Parse the method and URL
        const [method, path] = rec.endpoint.split(',');

        if(method !== 'GET'){
            console.trace(`✗  Unsupported HTTP method: ${method}`);
            return false;
        }
        if(!path){
            console.trace(`✗  Path not defined ${path}`);
            return false;
        }

        process.stdout.write(`--> Processing internal GET request to: ${path}`);
        // Simulate Express Route serving
        if(app){
            app.get(path, (req, res) => {
                // Your logic to handle the internal resource
                const file = `./services/${rec.grpName}/docs/index.html`
                if(fs.existsSync(file)){
                    res.sendFile(path.resolve(file));
                }else{
                    res.status(404).send('File not found');
                }
            });
            process.stdout.write(`✓ ${rec.name} served from internal endpoint`);
            return true;
        }else{
            console.trace(`✗  App is undefined `);
            return false;
        }


    } catch (err) {
        console.trace(`✗  Building API route:`, err.message);
        return false;
    }
}
async function buildChat(rec, app) {
    process.stdout.write(`Processing Chat action: ${rec.id}; `);
    return true;
}
async function buildStream(rec, app) {
    process.stdout.write(`Processing Stream action: ${rec.id}; `);
    return true;
}
async function buildAuthentication(rec, app) {
    process.stdout.write(`Processing Authenticate action: ${rec.id}; `);
    return true;
}
async function buildN(rec) {
    try {
        if (rec.statement || rec.execute) {
            // Pass the record directly to Messenger for message construction and publishing
            await Messenger.publishMessage(rec);
        }
        return true;
    } catch (error) {
        console.trace(`✗  Processing action N:`, error);
        return false;
    }
}

//Filesystem one record and send Message
async function buildWatch(rec) {
    // Fetch all 'ermis' rows with actiongrp.name=fswatch before run
    try {
        const watchList = await mariadmin.fa(`SELECT actiongrp.keys, actiongrp.name as grpName,action.*
                                              FROM action LEFT JOIN actiongrp ON actiongrp.id = action.actiongrpid
                                              WHERE actiongrp.name='fswatch' ORDER BY action.sort;`);
        await fswatch(); // get json_merged_id_name_path_with_this
        // return watchList;
        return true;
    } catch (error) {
        console.trace(`✗  Setting up watch:`, error);
        // Update the database for incorrect configuration
        return false
    }
}

// Watch a specific directory
function watchSystem(directory, systems) {
    const watcher=  fs.watch(path.resolve(ROOT, directory.path), {recursive:true}, (eventType, file) => {
        if (file) {
            const fullPath = path.join(ROOT, directory.path, file);
            const dir = systems.find(d => fullPath.startsWith(path.resolve(ROOT, d.path)));
            const baseFolder = dir ? dir.name : null;
            const filename = path.parse(file).name;
            //process.stdout.write(filename)
         /*   if (baseFolder) {
                Messenger.publishMessage({
                    system: baseFolder,
                    text: `${file} changed in ${directory.path}: ${eventType}`,
                    filename,
                    type: 'reload'
                });
            } */
        }
    });
    return watcher;
}

// Watch function to initialize all directories
// Execute actiongrp.name = watch
const watchers = {};
async function fswatch() {
    try {
        const systems = await mariadmin.fa("SELECT * FROM systems WHERE status='active'");
        if (!systems || systems.length === 0) {
            throw new Error("No active systems found for watching.");
        }
        systems.forEach(dir => {
            if (!watchers[dir.id]) {
                watchers[dir.id] = watchSystem(dir, systems);
                process.stdout.write(`👀 Watching directory: ${dir.path}`);
            }
        });

        // Clear old watchers
        //for (const id in watchers) {
          //  if (!systems.find(sys => sys.id == id)) {
            //    process.stdout.write(`Unwatching directory: ${id}`);
              //  watchers[id].close();
                //delete watchers[id];
            //}
        //}

    } catch (error) {
        console.info(`✗  Initializing watch:`, error.message);
        return false;
    }
}

//init watch
//fswatch();
//start main loop
mainLoop();
module.exports = { mainLoop };