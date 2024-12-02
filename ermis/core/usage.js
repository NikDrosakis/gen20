// app.js
const Maria = require('./Maria'); // Adjust the path as needed
const Mongo = require('./Mongo'); // Adjust the path as needed

// MariaDB configuration
const mariaConfig = {
    host: 'localhost',
    user: 'your_username',
    password: 'your_password',
    database: 'your_mariadb_database'
};

// MongoDB configuration
const mongoUri = 'mongodb://localhost:27017';
const mongoDbName = 'your_mongodb_database';

async function main() {
    // Instantiate MariaDB and MongoDB classes
    const maria = new Maria(mariaConfig);
    const mongo = new Mongo(mongoUri, mongoDbName);

    try {
        // Connect to MariaDB
        await maria.connect();
        console.log('Connected to MariaDB');

        // Connect to MongoDB
        await mongo.connect();
        console.log('Connected to MongoDB');

        // MariaDB operations
        const tables = await maria.listTables();
        console.log('MariaDB Tables:', tables);

        const newId = await maria.inse('your_table', { name: 'Alice', age: 25 });
        console.log('Inserted ID in MariaDB:', newId);

        const mariaResult = await maria.f('SELECT * FROM your_table WHERE id = ?', [newId]);
        console.log('MariaDB Query Result:', mariaResult);

        // MongoDB operations
        const mongoCollections = await mongo.listCollections();
        console.log('MongoDB Collections:', mongoCollections);

        const mongoInsertedId = await mongo.insert('your_collection', { name: 'Bob', age: 30 });
        console.log('Inserted ID in MongoDB:', mongoInsertedId);

        const mongoDocument = await mongo.findOne('your_collection', { _id: mongoInsertedId });
        console.log('MongoDB Document:', mongoDocument);

        // Example of updating and deleting
        const mariaUpdated = await maria.update('your_table', { id: newId }, { age: 26 });
        console.log('MariaDB Document Updated:', mariaUpdated);

        const mongoDeleted = await mongo.delete('your_collection', { _id: mongoInsertedId });
        console.log('MongoDB Document Deleted:', mongoDeleted);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Close connections
        await maria.close();
        console.log('MariaDB connection closed');

        await mongo.close();
        console.log('MongoDB connection closed');
    }
}

main();
