const express = require('express');

const Maria = require('./core/Maria');
const {publish} = require("./ws/broadcast");
require('dotenv').config();
// MariaDB configuration

const mariapublic = new Maria(process.env.MARIA);
const mariadmin = new Maria(process.env.MARIADMIN);
// Function to fetch counters dynamically from the database
// Function to fetch notifications dynamically
//for event type=N(otification) needed (NOT NULL) are names, hint, domappend, get_statement


async function buildServices(rec) {}
async function buildEvent(rec) {
    const results = {};
    const message = {};
    // Handle `events` logic here as required
    console.warn("buildEvent function is currently a placeholder.");
}

async function buildStatement(rec) {
    try {
        const results = {};
        if (!rec.statement || !rec.domappend) {
            console.warn(`Skipping invalid 'ermis' row: ${JSON.stringify(rec)}`);
            return;
        }
        // Fetch SQL values dynamically using the 'statement'
        const statement_results = await mariapublic.fetch(rec.statement);
        const keys = rec.domappend.split(','); // Comma-separated keys
        for (const key of keys) {
            // Flatten the array and search through the objects for the current key
            const foundRow = statement_results.find(sqlRow =>
                sqlRow[0] && sqlRow[0][key] !== undefined
            );
            // Assign the value to the results object
            results[key] = foundRow ? foundRow[0][key] : null; // Default to null if not found
        }
        // Handle message and publish
        if (rec.message) {
            try {
                const parsedMessage = JSON.parse(rec.message);
                publish(process.env.REDIS_CHANNEL, parsedMessage);
            } catch (error) {
                // Default message construction if JSON is invalid
                const defaultMessage = {system: "vivalibrocom",page: '',cast: 'all',type: 'N',text: results,class: "c_square cblue"};
                publish(process.env.REDIS_CHANNEL, defaultMessage);
            }
        }
    } catch (error) {
        console.error(`Error processing 'buildN': ${error.message}`);
    }
}

async function exeActionGrps(app) {
    try {
        // Fetch all 'ermis' rows for notifications
        const actionsgrps = await mariadmin.fa("SELECT * FROM actiongrp WHERE status='active'");
        if (!actionsgrps || actionsgrps.length === 0) {
            throw new Error("No valid data found in 'actiongrp' table.");
        }
        // Loop over the 'actionsgrps' and dynamically add routes for 'api' or 'ai' types
        for (const grp of actionsgrps) {
            if (grp.type === 'api' || grp.type === 'ai') {
                // Dynamically require the router based on the path stored in the database
                try {
                    const routerModule = require(`./${grp.path}`); // dynamically load the router
                    app.use(grp.route, routerModule); // Use the router for the route defined in the database
                } catch (err) {
                    console.error(`Error loading route for ${grp.path}:`, err.message);
                }
            }
        }
    } catch (err) {
        console.error("Error fetching action groups:", err.message);
    }
}
async function exeActions() {
    try {
        // Fetch all 'ermis' rows for notifications
        const actions = await mariadmin.fa("SELECT * FROM action WHERE status='active'");
        if (!actions || actions.length === 0) {
            throw new Error("No valid data found in 'ermis' table.");
        }

        // Process each 'ermis_res' row
        for (const rec of actions) {
            if (rec.type === 'N') {
                await buildStatement(rec);
            } else if (rec.type === 'events') {
                await buildEvent(rec);
            } else {
                console.warn(`Unknown type '${rec.type}' for row ID ${rec.id}.`);
            }
        }
    } catch (err) {
        console.error("Error fetching notifications:", err.message);
    }
}
module.exports = { exeActions,exeActionGrps };