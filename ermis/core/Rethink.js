const rethinkdb = require('rethinkdb');

class Rethink {
    constructor() {
        this.host = "localhost";
        this.port = 28015;
        this.dbName = "gen20";
        this.tableName = "chat";
        this.conn = null;
    }

    // Connect to RethinkDB
    async connect() {
        try {
            this.conn = await rethinkdb.connect({
                host: this.host,
                port: this.port
            });
            console.log('Connected to RethinkDB');
            // Ensure the database exists
            await rethinkdb.dbList().contains(this.dbName).run(this.conn)
                .then(async (exists) => {
                    if (!exists) {
                        await rethinkdb.dbCreate(this.dbName).run(this.conn);
                        console.log(`Database ${this.dbName} created`);
                    }
                });

            // Ensure the table exists
            await rethinkdb.db(this.dbName).tableList().contains(this.tableName).run(this.conn)
                .then(async (exists) => {
                    if (!exists) {
                        await rethinkdb.db(this.dbName).tableCreate(this.tableName).run(this.conn);
                        console.log(`Table ${this.tableName} created`);
                    }
                });

        } catch (error) {
            console.error('Error connecting to RethinkDB:', error);
        }
    }

    // Insert a message into the database with the new structure
    // Insert or Update chat messages for a specific cid
    async upsertChat(message) {
        if (!this.conn) {
            console.error('No connection to RethinkDB');
            return;
        }

        try {
            const existingMessage = await rethinkdb.db(this.dbName)
                .table(this.tableName)
                .getAll(message.cid, { index: 'cid' })
                .run(this.conn);

            // If the document doesn't exist, insert the full message
            if (existingMessage.length === 0) {
                const result = await rethinkdb.db(this.dbName)
                    .table(this.tableName)
                    .insert(message, { conflict: 'replace' })  // Replace on conflict (use upsert)
                    .run(this.conn);
                console.log('Inserted new message:', result);
            } else {
                // If it exists, append to the chat array
                const result = await rethinkdb.db(this.dbName)
                    .table(this.tableName)
                    .get(message.cid)
                    .update({
                        chat: rethinkdb.row('chat').default([]).append(message.chat)  // Append new chat messages
                    })
                    .run(this.conn);
                console.log('Appended new chat messages:', result);
            }
        } catch (error) {
            console.error('Error upserting chat message:', error);
        }
    }

    // Get all messages from the table
    async getMessages() {
        if (!this.conn) {
            console.error('No connection to RethinkDB');
            return;
        }

        try {
            const cursor = await rethinkdb.db(this.dbName).table(this.tableName).run(this.conn);
            const messages = await cursor.toArray();
            console.log('Messages:', messages);
            return messages;
        } catch (error) {
            console.error('Error retrieving messages:', error);
        }
    }

    // Close the connection to RethinkDB
    async close() {
        if (this.conn) {
            await this.conn.close();
            console.log('Connection to RethinkDB closed');
        }
    }
}


module.exports = Rethink;