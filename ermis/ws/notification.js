const Maria = require('../core/Maria');
require('dotenv').config();
// MariaDB configuration

const mariapublic = new Maria(process.env.MARIA);
const mariadmin = new Maria(process.env.MARIADMIN);
// Function to fetch counters dynamically from the database
// Function to fetch notifications dynamically
async function getNotification() {
    try {
        // Fetch ermis group
        const ermis_res = await mariadmin.f("SELECT * FROM ermis WHERE ermisgrpid = 4");

        if (!ermis_res || !ermis_res.get_statement) {
            throw new Error("No valid data found in 'ermis' table.");
        }

        // Fetch SQL values dynamically using the get_statement
        const ermis_sqlvalues = await mariapublic.fetch(ermis_res.get_statement);
console.log(ermis_sqlvalues);
        if (!ermis_sqlvalues) {
            throw new Error("Failed to execute 'get_statement'.");
        }
// Construct the 'results' object
// Assuming 'ermis_res.domappend' contains the comma-separated keys
        const keys = ermis_res.domappend.split(','); // Comma-separated keys

// Construct the 'results' object
        const results = keys.reduce((acc, key) => {
            // Find the corresponding row where the key exists and get the first item in the array
            const foundRow = ermis_sqlvalues.find(row => row[0] && row[0][key]);

            // If a row is found and has the expected key, assign its value to results
            acc[key] = foundRow ? foundRow[0][key] : null; // Default to null if not found

            return acc;
        }, {});
        return results;
    } catch (err) {
        console.error('Error fetching notifications:', err.message);
        throw err;
    }
}

module.exports = { getNotification };