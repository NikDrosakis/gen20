const Maria = require('./Maria');
require('dotenv').config();
const mariadmin = new Maria(process.env.MARIADMIN);
const mariapublic = new Maria(process.env.MARIA);
const {publish} = require("../ws/broadcast");
class Messenger {
    // Main method to construct the default message
    static async constructDefaultMessage(results) {
    let text='';
            // Fetch and construct the statement dynamically
            if(results.statement) {
                try {
                    text = await this.buildStatement(results.statement, results.domappend);
                } catch (error) {
                    console.error('Error constructing default message:', error);
                    return null; // Return null if there was an error
                }
            }else{
                text=results.text;
            }
            return {
                system: results.system || 'vivalibrocom',  // The target system for the message
                page: '',                // Default empty; can be updated dynamically if needed
                execute: results.execute, // JavaScript command to be executed in the browser
                cast: results.cast,      // Target audience: 'one', 'many', or 'all'
                type: results.type,      // 'N' for notification or other types
                text: text,     // Dynamically formatted text
                class: results.domappend || '' // DOM class to append
            };

    }

    // Helper method to construct the `text` field dynamically
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
            const defaultMessage = await this.constructDefaultMessage(res);
            if (defaultMessage) {
                publish(process.env.REDIS_CHANNEL, defaultMessage);
            }
    }
}
module.exports = Messenger;