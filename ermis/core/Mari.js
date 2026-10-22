// Maria.js
const mysql = require('mysql2/promise');
require('dotenv').config();

class Mari {
    constructor() {
        const config = {
            host: process.env.MARIAHOST,
            user: process.env.MARIAUSER,
            password: process.env.MARIAPASS,
            connectionLimit: 10,
            waitForConnections: true,
            queueLimit: 0,
            multipleStatements: true
        };

        try {
            this.pool = mysql.createPool(config);
            // Test the connection
            this.pool.getConnection()
                .then(conn => {
                    console.log('Connected to MariaDB server');
                    conn.release();
                })
                .catch(err => {
                    console.error('Error connecting to MariaDB:', err);
                });
        } catch (err) {
            console.error('Error creating connection pool:', err);
        }
    }

    /**
     * Prepare data from DB to be inserted or updated, according to the column format.
     * @param {Object} params - The data to be prepared for insertion or update.
     * @param {Object} columnsFormat - The format and comments associated with the columns.
     * @returns {Object} - The prepared data.
     */
    prepareColumnFormat(params, columnsFormat) {
        for (const [key, value] of Object.entries(params)) {
            if (columnsFormat[key]) {
                const comment = columnsFormat[key];

                // Handle file includes (like README.md) for 'includes' field
                if (typeof value === 'object' && value.includes && fs.existsSync(value.includes)) {
                    params[key] = fs.readFileSync(value.includes, 'utf-8');  // Read file content
                } else if (typeof value === 'object' && value.includes) {
                    throw new Error(`File at '${value.includes}' not found.`);
                }

                // If it's a comma-separated field, convert array to string
                else if (comment.includes('comma') && Array.isArray(value)) {
                    params[key] = value.join(',');  // Convert array to comma-separated string
                }

                // If it's a JSON field, convert array to JSON string
                else if (comment.includes('json') && typeof value === 'object') {
                    params[key] = JSON.stringify(value);  // Convert array to JSON string
                }
            }
        }
        return params;
    }

    /**
     * Extend and reformat data from DB into appropriate structure (reverses `prepareColumnFormat` logic).
     * @param {Object} params - The data fetched from the database.
     * @param {Object} columnsFormat - The format and comments associated with the columns.
     * @returns {Object} - The reformatted data.
     */
    extendColumnFormat(params, columnsFormat) {
        for (const [key, value] of Object.entries(params)) {
            if (columnsFormat[key]) {
                const comment = columnsFormat[key];

                // Handle 'comma' fields - convert comma-separated strings back to arrays
                if (comment.includes('comma') && typeof value === 'string') {
                    params[key] = value.split(',');  // Convert comma-separated string to array
                }

                // Handle 'json' fields - decode JSON string back to array
                else if (comment.includes('json') && typeof value === 'string') {
                    params[key] = JSON.parse(value);  // Convert JSON string to array
                }

                // Handle 'includes' fields - if it's a file path, store it as an 'includes' key
                else if (typeof value === 'string' && fs.existsSync(value)) {
                    params[key] = { includes: value };  // Store file path as an 'includes' key
                }

                // Handle simple string fields - ensure it is trimmed
                else if (typeof value === 'string') {
                    params[key] = value.trim();  // Remove whitespace from string
                }

                // Handle integer fields - ensure it's an integer
                else if (typeof value === 'number') {
                    params[key] = parseInt(value, 10);  // Convert to integer if necessary
                }
            }
        }
        return params;
    }

    // Insert or update a record based on 'name'
    async upsert(table, params) {
        if (!params.name) {
            throw new Error("The 'name' parameter is required for upsert.");
        }

        try {
            // Get column format
            const columnsFormat = await this.colFormat(table);
            params = await this.prepareColumnFormat(params, columnsFormat);

            const name = params.name;
            delete params.name; // Remove 'name' for update/insert fields

            // Check if the record exists
            const checkSql = `SELECT id FROM ?? WHERE name = ?`;
            const [checkResult] = await this.pool.query(checkSql, [table, name]);
            const exists = checkResult.length > 0;

            if (exists) {
                // If params has only 'name', return the existing record's ID
                if (Object.keys(params).length === 0) {
                    return checkResult[0].id; // Return the existing record ID
                }

                // Prepare and execute the UPDATE statement
                const updateColumns = Object.keys(params).map(key => `${key} = ?`).join(', ');
                const updateSql = `UPDATE ?? SET ${updateColumns} WHERE name = ?`;
                await this.pool.query(updateSql, [...Object.values(params), table, name]);
                return checkResult[0].id; // Return the record ID after update
            } else {
                // Prepare and execute the INSERT statement
                const insertColumns = Object.keys(params).join(', ');
                const placeholders = Object.values(params).map(() => '?').join(', ');
                const insertSql = `INSERT INTO ?? (name, ${insertColumns}) VALUES (?, ${placeholders})`;
                const [insertResult] = await this.pool.query(insertSql, [table, name, ...Object.values(params)]);
                return insertResult.insertId; // Return the new insert ID
            }
        } catch (err) {
            console.error(`Error in upsert: ${err.message}`);
            return false;
        }
    }



    // Fetch column comments for a table, or a specific column
    async colFormat(table, column = null) {
        try {
            let sql, params;
            if (column) {
                sql = "SHOW FULL COLUMNS FROM ?? WHERE Field = ?";
                params = [table, column];
            } else {
                sql = "SHOW FULL COLUMNS FROM ??";
                params = [table];
            }

            const [rows] = await this.pool.query(sql, params);

            if (column) {
                if (rows.length > 0) {
                    return rows[0].Comment.trim() || false;
                }
                return false;
            } else {
                const result = {};
                rows.forEach(row => {
                    result[row.Field] = row.Comment.trim();
                });
                return result;
            }
        } catch (err) {
            console.error(`Error fetching column format: ${err.message}`);
            return false;
        }
    }

    // List all tables in the database
    async listTables() {
        const [rows] = await this.pool.query('SHOW TABLES');
        return rows.map(row => Object.values(row)[0]); // Extract table names
    }

    // Insert a new record into a table
    async inse(table, params, id = null) {
        const keys = Object.keys(params);
        const values = Object.values(params);
        const qmk = keys.map(() => '?').join(',');

        let sql;
        if (Array.isArray(params) && params.length) {
            sql = `INSERT INTO ?? VALUES (?)`; // Assuming params is array
        } else {
            const fields = keys.join(',');
            sql = `INSERT INTO ?? (${fields}) VALUES (${qmk})`;
        }

        try {
            const [result] = await this.pool.query(sql, [table, ...values]);
            return result.insertId || true; // Return the last inserted ID or true if no ID
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                console.error(`Duplicate entry found for 'name'. Entry was not added.`);
            } else {
                console.error(`Database error occurred: ${err.message}`);
            }
            return false;
        }
    }

    // General query method for FETCHING MULTIPLE CONTENT
    async fetch(query, params = []) {
        const [rows] = await this.pool.query(query, params);
        return rows && rows.length > 0 ? rows : false; // Return rows or false
    }

    // General query method for INSERT, UPDATE, DELETE
    async q(query, params = []) {
        const queryType = query.trim().split(' ')[0].toUpperCase(); // Get the first word of the query
        if (!['UPDATE', 'INSERT', 'DELETE'].includes(queryType)) {
            return false;
        }
        const [result] = await this.pool.query(query, params);
        return result.affectedRows > 0; // Return true if rows affected
    }

    // Fetch a single row
    async f(query, params = []) {
        const queryType = query.trim().split(' ')[0].toUpperCase();
        if (queryType !== 'SELECT') {
            return false;
        }

        const [rows] = await this.pool.query(query, params);
        return rows[0] || false; // Return the first row or false if no result
    }

    // Fetch multiple rows
    async fa(query, params = []) {
        const queryType = query.trim().split(' ')[0].toUpperCase();
        if (!['SELECT', 'DESCRIBE'].includes(queryType)) {
            return false;
        }

        const [rows] = await this.pool.query(query, params);
        return rows.length > 0 ? rows : false; // Return rows or false
    }

    // Fetch row list or couple list
    async fl(rows, table, clause = '') {
        let sql;
        let params = [];

        if (Array.isArray(rows)) {
            const [row1, row2] = rows;
            sql = `SELECT ??, ?? FROM ?? ${clause}`;
            params = [row1, row2, table];
        } else {
            sql = `SELECT ?? FROM ?? ${clause}`;
            params = [rows, table];
        }

        const result = await this.fa(sql, params);
        if (!result) return false;

        if (Array.isArray(rows)) {
            return result.reduce((acc, row) => {
                acc[row[rows[0]]] = row[rows[1]];
                return acc;
            }, {});
        } else {
            return result.map(row => row[rows]);
        }
    }

    // Close the connection pool
    async close() {
        await this.pool.end();
    }
}

module.exports = Mari;
