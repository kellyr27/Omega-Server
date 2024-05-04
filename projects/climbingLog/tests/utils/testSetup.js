// test-setup.js

const { MongoMemoryServer } = require('mongodb-memory-server-core');
const mongoose = require('mongoose');
const {setTestDatabaseConnection} = require('../../config/database');

let mongoServer;
let testDatabaseConnection;

async function startTestDatabase() {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    testDatabaseConnection = mongoose.createConnection(mongoUri);
    setTestDatabaseConnection(testDatabaseConnection);
    
    return testDatabaseConnection;
}

async function stopTestDatabase() {
    await testDatabaseConnection.close();
    await mongoServer.stop();
}

module.exports = { startTestDatabase, stopTestDatabase };