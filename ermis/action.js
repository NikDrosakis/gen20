/**
Action
 building a mainLoop of action in the table to be executed by Ermis on startup of by action.interval_type
    mainly the loop has routes
 still no plan (series) here, just action records  with function according to action.type
  no meaning if there is no action plan
runAction(id):
Retrieves action data from the database.
Executes the action based on its type using executeAction.
Updates the action status in the database.
Returns a success or failure object.

actionLoop():
Fetches all actions from the database.
Executes actions using processActions.
processActions(actions):
Iterates over a list of actions.
Executes each action using executeAction.
Updates action status and tracks execution results.

executeAction(rec):
Based on rec.type, calls specific logic for route, int_resource, ext_resource, generate (or ai), N, and fs.
buildRoute(rec):
Loads route files.
Performs health checks on the route.

buildAI(rec):
Builds the ai api endpoint based on settings.
renderKeys(rawurl, rec):
Renders keys to url parameters based on config.

runExternalRecource(rec):
Executes external http calls.
runInternalRecource(rec):
Executes internal module calls

buildN(rec):
Executes messenger logic
upsertAction(actionGrpData, actionData):
Insert or update an action
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

let executionRunning = false;
//for new default is 5
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

async function runAction(name) {
    try {
        const record = await mariadmin.f(`
            SELECT actiongrp.keys, actiongrp.name as grpName, actiongrp.base, action.*
            FROM action
            LEFT JOIN actiongrp ON actiongrp.id = action.actiongrpid
            WHERE action.name='${name}'
        `);
        if (!record) {
            console.warn(`✗  Action with ID ${name} not found.`);
            return false;
        }
        const startTime = Date.now();
        let result = await executeAction(record,app);
        const endTime = Date.now();
        const exeTime = endTime - startTime;

        if (result) {
            await updateStatus(record, ACTION_STATUS.ALPHA_RUNNING_READY, `Action completed`, exeTime);
            return {
                success: true,
                message: `Action ${name} completed successfully`,
                data: record
            }
        } else {
            await updateStatus(record, ACTION_STATUS.INACTIVE_WRONG_FAILED, `Action failed`, exeTime);
            return {
                success: false,
                message: `Action ${name} failed`,
                data: record
            }
        }

    } catch (err) {
        console.error(`✗  Error processing action ${name}:`, err);
     //   await updateStatus(record, ACTION_STATUS.NEEDS_UPDATES, err.message);
   //     return {
     //       success: false,
       //     message: `Error processing action ${name}:`+ err.message,
         //   data: record
        //}
    }
}
async function actionLoop() {
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
            console.log('🏁 Post-Loop Status Counts:');
            console.table(postLoopCounts);
        }
    } catch (err) {
        process.stdout.write(`✗  Error in main loop:`, err.message);
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
                return await runInternalRecource(rec);
            case 'ext_resource':
                return await runExternalRecource(rec);
            case 'generate':
            case 'ai':
                return await buildAI(rec);
            case 'N':
                return await buildN(rec);
            case 'fs':
             //   await buildWatch(rec);
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
async function updateEndpointParams(endpoint, params, name) {
    try {
        const stringifiedParams = JSON.stringify(params);
        await mariadmin.q("UPDATE action SET params=?, endpoint=? WHERE actiongrp.name=?", [
            stringifiedParams,
            endpoint,
            name,
        ]);
        process.stdout.write(
            `✓ Updated action table with: params = ${stringifiedParams}, endpoint = ${endpoint} \n`
        );
    } catch (e) {
        console.error("Error while reading, parsing file or updating db:", e);
    }
}

async function updateStatus(rec, newstatus, log = '', exeTime = 0) {
    await mariadmin.q(
        "UPDATE action SET status = ?, log = ?, updated = CURRENT_TIMESTAMP, exe_time = ? WHERE id = ?",
        [newstatus, log, exeTime, rec.id]
    )
        .then(() => process.stdout.write(`💾 Action ${rec.id} set to status ${newstatus}`))
        .catch((err) => process.stdout.write(`✗  Error updating action status:`, err));
}
const jsdocRegex = /\/\*\*([\s\S]*?)\*\//g;
/**
 * Parses JSDoc comments to extract params
 * @param {string} comment - JSDoc comment string.
 * @returns {Object | null} The extracted parameters object, or null if not found
 */
function parseJsdoc(comment) {
    let params = null;
    try {
        const paramMatch = comment.match(/@params\s+({[\s\S]*?})/);
        if (paramMatch) {
            try {
                params = JSON.parse(paramMatch[1]);
            } catch (parseError) {
                console.error(`Invalid JSON after @params tag: ${paramMatch[1]}`);
                params = {}; // return an empty json object if json is invalid.
            }
        }
    } catch (e) {
        console.error("Error while parsing params", e);
    }
    return params;
}
function scanRoutes(router, prefix = '') {
    const mappings = [];
    if (router && router) {

        router.stack.forEach(layer => {
            if (layer.route) {
                const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
                const path = prefix + (layer.path || layer.route.path);
                let keys = 'default-key';
                let params = {};
                if(layer.route.stack && layer.route.stack.length > 0){
                    keys =  layer.route.stack[0].keys || 'default-key';
                    params =  layer.route.stack[0].params || {};
                }
                mappings.push({
                    method: methods,
                    path: path,
                    keys: keys,
                    params: params,
                });
            }
        });
    }
    return mappings;
}
async function checkRouteHealth(rec) {
    const healthEndpoint = 'health';
    const pingEndpoint = 'ping';

    const endpoints = [healthEndpoint, pingEndpoint]

    for (const endpoint of endpoints) {
        const host = rec.base + endpoint;  // Construct full health URL

        try {
            process.stdout.write(`--> Checking health at: ${host}\n`);
            const response = await fetch(host);  // Check the health URL
            if (!response.ok) {
                // Check if the response has a body and log it
                let errorBody = '';
                try {
                    errorBody = await response.text();
                }catch(bodyError){
                    errorBody = `Could not read body ${bodyError.message}`
                }

                console.error(`✗ Health Check Failed: ${host} status: ${response.status} ${errorBody}`);
                continue; // check the other endpoint
            } else {
                console.log(`✓ Health Check OK: ${host}`);
                return true;  // return if one endpoint is successfull
            }
        } catch (error) {
            console.error(`✗ Health Check Error for: ${host} ${error.message}`);
            continue; // check the other endpoint
        }
    }

    return false; // if no endpoit worked, then return false
}

async function buildRoute(rec) {
    const routerPath = `services/${rec.grpName}/routes.js`;
    if (fs.existsSync(routerPath)) {
        try {
            const routes = require(`./services/${rec.grpName}/routes`);

            if(routes){
                app.use(`/ermis/v1/${rec.grpName}`, routes);
                process.stdout.write(`✓  ${rec.grpName} routed.`);
                //health check
               // const healthCheckResult = await checkRouteHealth(rec);

                //update with fswatch
                const routeMappings = await scanRoutes(routes, `/ermis/v1/${rec.grpName}`);
                return !!routeMappings;
            } else {
                process.stdout.write(`✗  Error: No valid router exported from ${routerPath}`);
                return false;
            }

        } catch (error) {
            process.stdout.write(`✗  Error loading route ${routerPath}:`, error);
            return false;
        }
    } else {
        process.stdout.write(`✗  Invalid path for action group: ${rec.grpName}`);
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
                process.stdout.write(`✗  Error processing AI POST request:`, fetchError.message);
                return false;
            }
        } else {
            process.stdout.write(`✗  Unsupported HTTP method for AI: ${method}`);
            return false;
        }
    } catch (err) {
        process.stdout.write(`✗  Error building AI route:`, err.message);
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

/**
 * Helper function to extract and parse request parameters.
 * @param {express.Response} res - Express response object
 * @returns {Object} An object containing query and header parameters from request, or null if not available
 */
function getResourcesParams(res) {
    if (!res || !res.req) {
        return null; // Or an empty object, if you prefer
    }
    const req = res.req;
    const params = {
        query: req.query,
        headers: req.headers
    };

    // Add cookies to the params if they exist
    if (req.cookies) {
        params.cookies = req.cookies;
    }
    return params;
}

/**
 * Renders keys in a string using provided data.
 * @async
 * @param {string} text - The string containing keys to render.
 * @param {Object} data - The data object with key-value pairs for rendering.
 * @returns {Promise<string>} The rendered string.
 */
async function renderKeys(text, data) {
    const keys = text.match(/{{(.*?)}}/g) || [];
    let rendered = text;
    for (const keyMatch of keys) {
        const key = keyMatch.slice(2, -2).trim();
        const value = key.split('.').reduce((obj, k) => (obj && obj[k] !== undefined ? obj[k] : ''), data);
        rendered = rendered.replace(keyMatch, value);
    }

    return rendered;
}
/**
 * Runs an external resource request.
 * @async
 * @param {Object} rec - Configuration object for the external resource.
 * @returns {Promise<Object|boolean>} The JSON response from the external resource, or false if there was an error.
 * @throws {Error} If any error occurs during the process of request or parsing.
 */
async function runExternalRecource(rec) {
    try {
        // Parse the method and URL
        const [method, rawurl] = rec.endpoint.split(',');

        // Replace variables in the URL using renderKeys function
        const url = await renderKeys(rawurl, rec);

        let data = null;
        let response = null;

        if (method === 'GET' || method === 'POST') {
            process.stdout.write(`--> Processing ${method} request to: ${url} \n`);
            try {
                let options = {
                    method: method
                }

                if(method === 'POST') {
                    const bodyData = await renderKeys(JSON.stringify(rec.body || {}), rec);
                    options = {
                        ...options,
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: bodyData
                    }

                    process.stdout.write(`--> POST body: ${bodyData} \n`);
                }
                // Make the fetch request
                response = await fetch(url, options);

                if (!response.ok) {
                    throw new Error(`✗ HTTP! status: ${response.status} \n ${await response.text()}`);
                }

                // Process the response data
                data = await response.json();
                process.stdout.write(`✓ ${rec.name} Responsed with data \n`);
                process.stdout.write(JSON.stringify(data, null, 2) + '\n');
                return data;
            } catch (err) {
                console.error(`✗  Processing ${method} request:`, err.message);
                return false;
            }
        } else {
            console.error(`✗  Unsupported HTTP method: ${method}`);
            return false;
        }
    } catch (err) {
        console.trace(`✗  Building API route:`, err.message);
        return false;
    }
}


/**
 * Runs an internal resource request, adding an Express endpoint for the resource.
 * @async
 * @param {Object} rec - Configuration object for the internal resource.
 * @param {express.Application} app - Express application object.
 * @returns {Promise<boolean>} true if the resource is successfully served, false otherwise.
 * @throws {Error} If any error occurs during the process of serving.
 */
async function runInternalRecource(rec, app) {
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
                    const params = getResourcesParams(res);
                    rec.action = {
                        ...rec.action,
                        params: params
                    }
                    process.stdout.write(`--> Params: ${JSON.stringify(params)} \n`);
                    // Update the action params
                    db('systems').where({ id: rec.id }).update({ action: JSON.stringify(rec.action) }).then(()=>{
                        process.stdout.write(`✓ Updated system ${rec.id} with params: ${JSON.stringify(rec.action.params)} \n`);
                    }).catch((err)=>{
                        console.error('✗ Error updating action params:', err);
                    })
                    res.sendFile(path.resolve(file));
                }else{
                    res.status(404).send('File not found');
                }
            });
            process.stdout.write(`✓ ${rec.name} served from internal endpoint \n`);
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
    process.stdout.write(`Processing Chat #${rec.id}; `);
    return true;
}
async function buildStream(rec, app) {
    process.stdout.write(`Processing Stream #${rec.id}; `);
    return true;
}
async function buildAuthentication(rec, app) {
    process.stdout.write(`Processing Authenticate #${rec.id}; `);
    return true;
}
async function buildN(rec) {
    try {
        if (rec.statement || rec.execute) {
            // Pass the record directly to Messenger for message construction and publishing
            //await Messenger.publishMessage(rec);
        }
        return true;
    } catch (error) {
        console.trace(`✗  Processing action N:`, error);
        return false;
    }
}

//add action
async function upsertAction(actionGrpData, actionData) {
    try {
        const {name, description, base} = actionGrpData;
        // Insert into actiongrp
        const insertActionGrpResult = await mariadmin.inse("actiongrp", {
            name: name,
            description: description,
            base: base,
            meta:meta
        });

        if(!insertActionGrpResult){
            throw new Error('Error inserting actiongrp');
        }

        // Insert into action, the new actiongrpid
        const insertAction = await mariadmin.inse("action", {
            name: actionData.name,
            systemsid: actionData.systemsid || 3, // default value
            actiongrpid: insertActionGrpResult.insertId,
            endpoint: actionData.endpoint
        });

        if(!insertAction) {
            throw new Error('Error inserting action')
        }
        return {
            actiongrpid: insertActionGrpResult.insertId,
            actionid: insertAction.insertId
        };
    } catch (error) {
        console.error('Error adding action:', error.message);
        return false;
    }
}
//fswatch();
//start main loop

module.exports = { actionLoop,runAction,updateEndpointParams };