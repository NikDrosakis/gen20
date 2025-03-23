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
const { runAction } = require('./action'); // Assuming index.js contains runAction

async function getPlans() {
    try {
        const plans = await mariadmin.fa('SELECT * FROM plan');
        return plans;
    } catch (error) {
        console.error("Error fetching plans:", error);
        return null;
    }
}

async function getPlanActions(planId) {
    try {
        const actions = await mariadmin.fa(`
            SELECT action.*
            FROM action_plan
            LEFT JOIN action ON action.id = action_plan.actionid
            WHERE action_plan.planid = {planId}
            ORDER BY action_plan.id ASC
        `);
        return actions;
    } catch (error) {
        console.error(`Error fetching actions for plan ${planId}:`, error);
        return null;
    }
}

async function executePlan(planId) {
    const actions = await getPlanActions(planId);
    if (!actions || actions.length === 0) {
        console.log(`No actions found for plan ID ${planId}`);
        return;
    }

    for (const action of actions) {
        try {
            const result = await runAction(action.id);
            if (!result || !result.success) {
                console.error(`Action ${action.id} in plan ${planId} failed:`, result);
            } else {
                console.log(`Action ${action.id} in plan ${planId} completed successfully`);
            }
        } catch (error) {
            console.error(`Error during action execution in plan ${planId}:`, error);
            return false;
        }

    }
    console.log(`Plan ${planId} execution finished.`);
    return true;
}

async function actionPlanLoop() {
    console.log('Starting action plan loop...');
    const plans = await getPlans();
    if (!plans || plans.length === 0) {
        console.log('No plans found.');
        return;
    }
    for (const plan of plans) {
        console.log(`Executing plan ${plan.name} (ID: ${plan.id})`);
        await executePlan(plan.id);
    }
    console.log('Action plan loop finished.');

}

// Function to create a new plan
async function createPlan(name, description) {
    try {
        const insertResult = await mariadmin.inse("plan", {
            name: name,
            description: description
        });
        if(!insertResult){
            throw new Error('Error inserting plan');
        }
        console.log('New plan created successfully')
        return {
            success: true,
            planid: insertResult.insertId
        };
    } catch (error) {
        console.error("Error creating plan:", error);
        return {
            success: false,
            error: error
        };
    }
}

async function addActionToPlan(planId, actionId) {
    try {
        await mariadmin.inse("action_plan", {
            planid: planId,
            actionid: actionId
        });
        console.log(`Action ${actionId} added to plan ${planId} successfully`);
        return true
    } catch (error) {
        console.error(`Error adding action ${actionId} to plan ${planId}:`, error);
        return false;
    }
}

module.exports = { getPlans, getPlanActions, executePlan, actionPlanLoop, createPlan, addActionToPlan};