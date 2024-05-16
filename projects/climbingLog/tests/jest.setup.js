const { startTestDatabase, stopTestDatabase } = require('./utils/testSetup');
const startServer = require('../../../server'); 


beforeAll(async () => {
    try {

        global.testDb = await startTestDatabase();
        global.server = await startServer();
        // Load all my Models and save them as global variables for testing
        global.User = require('../models/userModel');
        global.Ascent = require('../models/ascentModel');
        global.Route = require('../models/routeModel');
		global.Area = require('../models/areaModel');
        // Load all my Utils and save them as global variables for testing
        global.testHelpers = require('./utils/testHelpers');
    } catch (error) {
        console.error(error);
    }
});

afterAll(async () => {
    try {
        await stopTestDatabase();
        await global.server.close();
    } catch (error) {
        console.error(error);
    }
});