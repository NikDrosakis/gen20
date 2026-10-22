// Mongo.js
const { MongoClient } = require('mongodb');

class Mongo {
    constructor(uri, dbName) {
        this.client = new MongoClient(uri);
        this.dbName = dbName;
    }

    async connect() {
        await this.client.connect();
        this.db = this.client.db(this.dbName);
    }

    async close() {
        await this.client.close();
    }

    // List all collections in the database
    async listCollections() {
        const collections = await this.db.listCollections().toArray();
        return collections.map(collection => collection.name); // Extract collection names
    }

    // Insert a new document into a collection
    async insert(collectionName, document) {
        const result = await this.db.collection(collectionName).insertOne(document);
        return result.insertedId; // Return the inserted ID
    }

    // Update a document in a collection
    async update(collectionName, filter, update) {
        const result = await this.db.collection(collectionName).updateOne(filter, { $set: update });
        return result.modifiedCount > 0; // Return true if the document was modified
    }

    // Delete a document in a collection
    async delete(collectionName, filter) {
        const result = await this.db.collection(collectionName).deleteOne(filter);
        return result.deletedCount > 0; // Return true if the document was deleted
    }

    // Find a single document in a collection
    async findOne(collectionName, filter) {
        return await this.db.collection(collectionName).findOne(filter);
    }

    // Find multiple documents in a collection
    async findMany(collectionName, filter = {}, options = {}) {
        const cursor = this.db.collection(collectionName).find(filter, options);
        return await cursor.toArray(); // Return all matching documents as an array
    }
}

module.exports = Mongo;
