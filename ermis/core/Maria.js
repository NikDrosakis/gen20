// Maria.js
const mysql = require('mysql2/promise');
require('dotenv').config();


class Maria {
    constructor(database = process.env.MARIA) {  //OR MARIADBMIN
        const config = {
            host: process.env.MARIAHOST,
            user: process.env.MARIAUSER,
            password: process.env.MARIAPASS,
            database: database,
            connectionLimit: 10,
            waitForConnections: true,
            queueLimit: 0,
            multipleStatements: true
        };
        this.pool = mysql.createPool(config); // Create a connection pool
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

module.exports = Maria;
