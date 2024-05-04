const mongoose = require('mongoose');

let productionDatabaseConnection;
let testDatabaseConnection;

function connectToDatabase() {
    if (!productionDatabaseConnection) {
        productionDatabaseConnection = mongoose.createConnection(process.env.MONGODB_URI_CLIMBINGLOG);
        productionDatabaseConnection.on('error', console.error.bind(console, 'First DB connection error:'));
        productionDatabaseConnection.once('open', () => {
            console.log('Connected to first MongoDB database');
        });
    }

    return productionDatabaseConnection;
}

function getDatabaseConnection() {
    if (process.env.NODE_ENV === 'test') {
        return testDatabaseConnection;
    } else {
        return connectToDatabase();
    }
}

function setTestDatabaseConnection(connection) {
    testDatabaseConnection = connection;
}

module.exports = { getDatabaseConnection, setTestDatabaseConnection };