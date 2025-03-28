/**
 Constructs the communication standardized message
 * */
const Mari = require('./Mari');
const Manifest = require('./Manifest');
require('dotenv').config();
const mari = new Mari();
class Messenger {
    // Main method to construct the default message
    static async buildMessage(results) {
    let verba='';
            // Fetch and construct the statement dynamically
            if(results && results.statement) {
                try {
                    verba = await this.buildStatement(results.statement, results.domappend);
                } catch (error) {
                    console.error('Error constructing default message:', error);
                    return null; // Return null if there was an error
                }
            }else{
                verba=results.verba;
            }
            return {
                system: results.system || '*',  // The target system for the message
                execute: results.execute, // JavaScript command to be executed in the browser
                cast: results.cast,      // Target audience: 'one', 'many', or 'all'
                type: results.type,      // 'N' for notification or other types
                verba: verba,     // Dynamically formatted text
                domaffects: '*',                // Default empty; can be updated dynamically if needed
                domappend: results.domappend || '' // DOM class to append
            };

    }

    // Helper method to construct the `verba` field dynamically
    static async buildStatement(statement, domappend) {
        try {
            if (!statement || !domappend) {
                console.warn(`Skipping invalid statement or domappend: ${statement}`);
                return '';
            }
            // Fetch SQL values dynamically using the 'statement'
            const statementResults = await mariapublic.fetch(statement);
            const results = {};
            const keys = domappend.split(',');
            for (const key of keys) {
                // Flatten the array and search through the objects for the current key
                const foundRow = statementResults.find(sqlRow => sqlRow[0] && sqlRow[0][key] !== undefined);
                // Assign the value to the results object
                results[key] = foundRow ? foundRow[0][key] : null;
            }

            // Format and return the constructed statement
            return results;
        } catch (error) {
            console.error('Error building statement:', error);
            return '';
        }
    }

    // Method to publish the constructed message
    static async publishMessage(res) {
            // Default message construction if JSON is invalid
            const defaultMessage = await this.buildMessage(res);
            if (defaultMessage) {
                publish(process.env.REDIS_CHANNEL, defaultMessage);
            }
    }


}

module.exports = Messenger;