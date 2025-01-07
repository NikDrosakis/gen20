/**
 Build Action with methods => action.type

 Action Ermis is the beginning of Action with it's websocket server and fs.watch that dominates the system
Analogy to Kafka is Kafka producers for logging or notifications and consumers for action execution
 exeActions exported to index.js:
 `Instantiate Actions |  const { exeActions } = require('./action');exeActions(app);
 Running Web Socket Server for RealTime Actions; WServer(server,app,exeActions);
 Feature	            Kafka									Your DB-Driven Actions System
 Event Handling			Real-time, distributed messaging via topics.	WS RealTime Batch (before files) sequential processing of actions from/to DB.
 Scalability			Highly scalable for millions of messages.		Limited by DB performance and query execution time. (cache it's execution by in-memory Redis)
 Decoupling				Producers and consumers are loosely coupled.	Actions and systems are tightly coupled to DB schema (dbcentrism).
 Order Guarantees		Ensured per partition (configurable).			Explicitly managed via schema order_level, action.systemsid, action.type,mysql COMMENTS-column metadata).
 Use Case Suitability	High throughput, distributed systems.			Simplified task orchestration with dependency tracking.
 Latency				Very low (real-time).							Low (Systems Batched, WS RealTime, Cron, Sql event triggered).
 Complexity				Requires additional infrastructure.				Lightweight, easier to implement.
--> uses Maria, Messenger
--> runs in systemsid ermis
 TODO utilize ci/cd process (through Github) example in the end
 TODO utilize the power of event driven kafka logic
 TODO utilize the power of unit testing
 TODO use the manifest.md as high level filesystem & sql standarization
*/
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const fs = require('fs');
const path = require('path');
const express = require('express');
const Maria = require('./core/Maria');
const Messenger = require('./core/Messenger');
require('dotenv').config();
const ROOT = process.env.ROOT || path.resolve(__dirname);
// MariaDB configuration
//const mariapublic = new Maria(process.env.MARIA);
const mariadmin = new Maria(process.env.MARIADMIN);


//TODO Status Stats Diagnostics returns a table of statuses counters before and after actions updated to show the difference
async function after_execution(actions) {
//if executeed updates execution_time, win +=1 else lose +=1
//SET TIMEER OFF    
    //UPDATE status
}

//TODO activate or deactivate status
async function updateStatus(rec,newstatus,log='') {
    // Update the database with the result
    //TODO log= empty log ? '' : (is json ? JSON.stringify(data) : data)
    await mariadmin.q("UPDATE action SET status = ?, log=? WHERE id = ?", [
        newstatus,
        log,
        rec.id,
    ])
    .then(() => console.log(`Action ID ${rec.id} set to 'inactived' after change.`))
    .catch((err) => console.trace('Error updating action status:', err));
}

//TODO add action based on systemsid (where action runs) & actiongrpid (in which Resource action runs)
async function addAction(rec) {
    //TODO construct new record with rec
    const newrecord= {};
    // Update the database with the result
    await mariadmin.inse("action",newrecord);
}

//Execute actions where action.systemsid=3 or *
async function executeErmisActions(app) {
    try {
        // Fetch all 'ermis' rows for notifications before run
        const actions = await mariadmin.fa(`SELECT actiongrp.keys,actiongrp.name as grpName, action.* 
        FROM action LEFT JOIN actiongrp ON actiongrp.id = action.actiongrpid 
        WHERE action.systemsid in (0,3) ORDER BY action.sort;`);

        if (!actions || actions.length === 0) {
            throw new Error("No valid data found in 'ermis' table.");
        }
        // Process each helper function according to type
        //TODO return a stat for use in the end
        for (const rec of actions) {
            switch (rec.type) {
                case 'route':
                    await buildRoute(rec, app);
                    break;
                case 'ext_resource':
                    await buildAPI(rec);
                    break;
                case 'generate':
                case 'ai':
                    await buildAI(rec);
                    break;
                case 'N':
                    await buildN(rec);
                    break;
                case 'fs':
                    await buildWatch(rec);
                    break;
                default:
                    console.warn(`Unknown type '${rec.type}' for row ID ${rec.id}.`);
            }
        }

        //after execution console table
        const afterExecStats = await afterExecution(actions);
        if (afterExecStats) {
            return afterExecStats;
        }
    } catch (err) {
        console.trace("Error fetching action:", err.message);
    }
}

async function buildRoute(rec, app) {
    const routerPath = `./services/${rec.grpName}/routes.js`;
    if (fs.existsSync(routerPath)) {
        app.use(`/ermis/v1/${rec.grpName}`, require(routerPath));
        console.trace(`${rec.grpName} routed. Now check all the route given endpoints.`);
    } else {
        console.trace(`Invalid path for action group: ${routerPath}`);
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
            console.log(`Processing AI POST request to: ${url}`);

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
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Process the response data
                const data = await response.json();
                console.log(`${rec.name} AI responded with data:`, data);

                // Update the database with the result
               await updateStatus(rec,'activated');

            } catch (fetchError) {
                console.trace('Error processing AI POST request:', fetchError.message);

                // Update the database for failure
                await updateStatus(rec,'errored',err.message);
            }
        } else {
            console.trace(`Unsupported HTTP method for AI: ${method}`);
        }
    } catch (err) {
        console.trace(`Error building AI route:`, err.message);

        // Update the database for incorrect configuration
        await updateStatus(rec,'errored',err.message);
    }
}

async function renderKeys(rawurl, rec) {
    // Parse the `rec.keys` into an object of key-value pairs
    const keyValuePairs = rec.keys.split(',').reduce((acc, pair) => {
        const [key, value] = pair.split('=');
        acc[key] = value;
        return acc;
    }, {});

    // Replace the placeholders in the URL with the corresponding values from `rec.keys`
    return rawurl.replace(/\{(\w+)\}/g, (_, variable) => {
        const envValue = keyValuePairs[variable];
        if (!envValue) {
            // Log the missing variable into the database if not found
            mariadmin.q("UPDATE action SET status = 'wrong', log = ? WHERE id = ?", [
                `Environment variable ${variable} is not defined.`,
                rec.id
            ]);
            throw new Error(`Environment variable ${variable} is not defined.`);
        }
        return envValue;
    });
}

//Connect with API endpoint & & receive information,
async function buildAPI(rec) {
    try {
        // Parse the method and URL
        const [method, rawurl] = rec.endpoint.split(',');

        // Replace variables in the URL using renderKeys function
        const url = await renderKeys(rawurl, rec);
        // Only support GET method for now
        if (method === 'GET') {
            console.log(`Processing GET request to: ${url}`);
            try {
                // Make the fetch request
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                // Process the response data
                const data = await response.json();
                console.log(`${rec.name} Responsed with data , but how to use them?`);
                // Update the database
                await updateStatus(rec,'activated');

            } catch (err) {
                console.trace('Error processing GET request:', err.message);
                // Update the database for failure
                await updateStatus(rec,'errored',err.message);
            }
        } else {
            console.trace(`Unsupported HTTP method: ${method}`);
        }
    } catch (err) {
        console.trace(`Error building API route:`, err.message);
        // Update the database for incorrect configuration
        await updateStatus(rec,'errored',err.message);
    }
}

async function buildN(rec) {
    try {
        if (rec.statement || rec.execute) {
            // Pass the record directly to Messenger for message construction and publishing
            await Messenger.publishMessage(rec);
        }
    } catch (error) {
        console.trace('Error processing action:', error);
        await mariadmin.q("UPDATE action SET status = 'errored', log=? WHERE id = ?", [rec.id,error.message]);
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

        //watchList['execute']=rec.execute;
        //watchList['type']=rec.type;
        //console.log('Watch List:', watchList); // Log the watch actions if needed
        //await Messenger.publishMessage(watchList);

        return watchList;
    } catch (error) {
        console.trace('Error setting up watch:', error);
        // Update the database for incorrect configuration
        //await mariadmin.q("UPDATE action SET status = 'errored', log=? WHERE id = ?", [rec.id,error.message]);
    }
}

// Watch a specific directory
function watchSystem(directory, systems) {
    fs.watch(path.resolve(ROOT, directory.path), (eventType, file) => {
        if (file) {
            const fullPath = path.join(ROOT, directory.path, file);
            const dir = systems.find(d => fullPath.startsWith(path.resolve(ROOT, d.path)));
            const baseFolder = dir ? dir.name : null;
            const filename = path.parse(file).name;
            //console.log(filename)
            if (baseFolder) {
                const change = {
                    system: baseFolder,
                    text: `${file} changed in ${directory.path}: ${eventType}`,
                    filename
                };

                // Merge the directory information into the change object and push to the changes array

                //Except from reload
            //    publish(process.env.REDIS_CHANNEL, { system: baseFolder, text:text, type: 'reload', filename });
            }
        }
    });
}

// Watch function to initialize all directories
//TODO convert to js Class into core.Watch
// Execute actiongrp.name = watch
async function fswatch() {
    try {
        const systems = await mariadmin.fa("SELECT * FROM systems WHERE status='active'");
        if (!systems || systems.length === 0) {
            throw new Error("No active systems found for watching.");
        }
        systems.forEach(dir => watchSystem(dir, systems));
        console.log('Watching directories:', systems.map(d => d.path).join(', '));
        // Return merged JSON (the changes array)
    } catch (error) {
        console.trace("Error initializing watch:", error.message);
        return [];
    }
}


module.exports = { executeErmisActions };

/**
 name: Server-Side CI/CD Pipeline

 on:
 push:
 branches:
 - main  # Trigger on pushes to the main branch
 pull_request:
 branches:
 - main  # Trigger on pull requests to the main branch

 jobs:
 build:
 runs-on: ubuntu-latest  # Or choose another runner if needed (e.g., Debian, Ubuntu)

 steps:
 - name: Checkout repository
 uses: actions/checkout@v2

 - name: Set up PHP 8.3
 uses: shivammathur/setup-php@v2
 with:
 php-version: 8.3

 - name: Install dependencies (if needed, for example, Composer for PHP)
 run: |
 sudo apt-get update
 sudo apt-get install -y curl git
 curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

 - name: Run install.sh (server-side configuration setup)
 run: |
 chmod +x ./install.sh
 ./install.sh

 - name: Run version.sh (versioning script)
 run: |
 chmod +x ./version.sh
 ./version.sh

 - name: Assign database schema actions
 run: |
 # Run the PHP database actions based on the schema changes
 php /path/to/your/actionscript.php --action actiongrp

 - name: Database Schema Update (example)
 run: |
 php /path/to/your/db-schema-action.php --action "migrate"  # Example of running DB schema migration

 - name: Deploy to server (example: use SSH or other deployment tools)
 run: |
 ssh user@yourserver.com "bash -s" < ./deploy.sh  # Assuming deploy.sh handles deployment on your server

 - name: Clean up / Post-deployment tasks
 run: |
 echo "Post-deployment tasks here, such as cache clearing or log rotation"
 */

