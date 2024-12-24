/**
 Action Ermis is the beginning of Action with it's websocket server and fs.watch
 dominates the system
 uses Maria, Messenger
 runs in systemid ermis
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
async function stat(actions) {

}
//TODO activate or deactivate status
async function updateStatus(rec) {
    // Update the database with the result
    await mariadmin.q("UPDATE action SET status = 'active', log=? WHERE id = ?", [
        JSON.stringify(data),
        rec.id,
    ]);
}
//TODO add action based on systemsid (where action runs) & actiongrpid (in which Resource action runs)
async function addAction(rec) {
    //TODO construct new record
    const newrecord= {};
    // Update the database with the result
    await mariadmin.inse("action",newrecord);
}

//Main function
async function exeActions(app) {
    try {
        // Fetch all 'ermis' rows for notifications before run
        const actions = await mariadmin.fa(`SELECT systems.name,actiongrp.keys, action.* 
        FROM action 
            LEFT JOIN systems ON systems.id = action.systemsid 
            LEFT JOIN actiongrp ON actiongrp.id = action.actiongrpid 
        WHERE systems.name = 'ermis' ORDER BY sort;`);

        //before execution console table
        await stat(actions);


        if (!actions || actions.length === 0) {
            throw new Error("No valid data found in 'ermis' table.");
        }
        // Process each helper function according to type
        //TODO return a stat for use in the end
        for (const rec of actions) {
            if (rec.type ==='route') {
                await buildRoute(rec,app);
            }else  if (rec.type === 'ext_resource') {
                await buildAPI(rec);
            }else  if (rec.type === 'ai') {
                await buildAI(rec);
            }else  if (rec.type === 'N') {
                await buildN(rec);
            } else if (rec.type === 'generate') {
                console.log(rec);
            } else if (rec.type === 'watch') {
                await buildWatch(rec);
            } else {
                console.warn(`Unknown type '${rec.type}' for row ID ${rec.id}.`);
            }
        }

        //after execution console table
        await stat(actions);

    } catch (err) {
        console.error("Error fetching action:", err.message);
    }
}
async function buildRoute(rec,app) {
    const routerPath=`./services/${rec.names}/routes.js`;
    if (fs.existsSync(routerPath)) {
        app.use(`/ermis/v1/${rec.names}`, require(`./services/${rec.names}/routes`));
        console.error(`${rec.names} routed. Now check all the route given endpoints.`);
    } else {
        console.error(`Invalid path for action group: ${routerPath}`);
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
                console.log(`${rec.names} AI responded with data:`, data);

                // Update the database with the result
                await mariadmin.q("UPDATE action SET status = 'active', log=? WHERE id = ?", [
                    JSON.stringify(data),
                    rec.id,
                ]);
            } catch (fetchError) {
                console.error('Error processing AI POST request:', fetchError.message);

                // Update the database for failure
                await mariadmin.q("UPDATE action SET status = 'errored', log=? WHERE id = ?", [
                    fetchError.message,
                    rec.id,
                ]);
            }
        } else {
            console.error(`Unsupported HTTP method for AI: ${method}`);
        }
    } catch (err) {
        console.error(`Error building AI route:`, err.message);

        // Update the database for incorrect configuration
        await mariadmin.q("UPDATE action SET status = 'errored', log=? WHERE id = ?", [
            err.message,
            rec.id,
        ]);
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
                console.log(`${rec.names} Responsed with data , but how to use them?`);
                // Update the database
                await mariadmin.q("UPDATE action SET status = 'activated', log=? WHERE id = ?", [rec.id,JSON.stringify(data)]);

            } catch (fetchError) {
                console.error('Error processing GET request:', fetchError.message);
                // Update the database for failure
                await mariadmin.q("UPDATE action SET status = 'errored', log=? WHERE id = ?", [rec.id,fetchError.message]);
            }
        } else {
            console.error(`Unsupported HTTP method: ${method}`);
        }
    } catch (err) {
        console.error(`Error building API route:`, err.message);
        // Update the database for incorrect configuration
        await mariadmin.q("UPDATE action SET status = 'errored',log=? WHERE id = ?", [rec.id,err.message]);
    }
}
async function buildN(rec) {
    try {
        if (rec.statement || rec.execute) {
            // Pass the record directly to Messenger for message construction and publishing
            await Messenger.publishMessage(rec);
        }
    } catch (error) {
        console.error('Error processing action:', error);
        await mariadmin.q("UPDATE action SET status = 'errored', log=? WHERE id = ?", [rec.id,error.message]);
    }
}
//Filesystem one record and send Message
async function buildWatch(rec) {
    try {
        const watchList = await watch(); // get json_merged_id_name_path_with_this
        watchList['execute']=rec.execute;
        watchList['type']=rec.type;
        console.log('Watch List:', watchList); // Log the watch actions if needed
        await Messenger.publishMessage(watchList);
    } catch (error) {
        console.error('Error setting up watch:', error);
        // Update the database for incorrect configuration
        await mariadmin.q("UPDATE action SET status = 'errored', log=? WHERE id = ?", [rec.id,error.message]);
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
                changes.push({
                    id: directory.id,
                    name: directory.name,
                    path: directory.path,
                    ...change,
                });
                //Except from reload
            //    publish(process.env.REDIS_CHANNEL, { system: baseFolder, text:text, type: 'reload', filename });
            }
        }
    });
}
// Watch function to initialize all directories
//TODO convert to js Class into core.Watch
async function watch() {
    try {
        const systems = await mariadmin.fa("SELECT * FROM systems WHERE status='active'");
        if (!systems || systems.length === 0) {
            throw new Error("No active systems found for watching.");
        }

        systems.forEach(dir => watchSystem(dir, systems, changes));
        console.log('Watching directories:', systems.map(d => d.path).join(', '));
        // Return merged JSON (the changes array)
        return changes;
    } catch (error) {
        console.error("Error initializing watch:", error.message);
        return [];
    }
}
async function watch2() {
    try {
        const watchActions = await mariadmin.fa("SELECT * FROM action WHERE status='activated' AND type='watch'");
        if (!watchActions || watchActions.length === 0) {
            throw new Error("No active 'watch' actions found.");
        }

        const changes = [];
        watchActions.forEach((directory) => {
            const directories = JSON.parse(rec.statement); // Assume `statement` has directory paths as JSON array
            rec.forEach((directory) => {
                const watcher = fs.watch(path.resolve(ROOT, directory), (eventType, file) => {
                    if (file) {
                        const fullPath = path.join(ROOT, directory, file);
                        const change = {
                            action_id: rec.id,
                            system: rec.system || directory,
                            text: `${file} ${eventType} in ${directory}`,
                            filename: path.basename(file),
                        };

                        // Push change to the list
                        changes.push(change);

                        // Switch action status
                        mariadmin.q("UPDATE action SET status='inactived' WHERE id=?", [rec.id])
                            .then(() => console.log(`Action ID ${rec.id} set to 'inactived' after change.`))
                            .catch((err) => console.error('Error updating action status:', err));
                    }
                });
            });
        });

        console.log('Watching directories:', watchActions.map((a) => a.statement).join(', '));
        return changes;
    } catch (error) {
        console.error("Error initializing watch:", error.message);
        return [];
    }
}

module.exports = { exeActions };

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

 - name: Run presetup.sh (server-side configuration setup)
 run: |
 chmod +x ./presetup.sh
 ./presetup.sh

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

