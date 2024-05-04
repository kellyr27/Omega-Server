const express = require('express');
const app = express();
const morgan = require('morgan');
const setUpClimbingLogApp = require('./projects/climbingLog/app');

// TODO: Stop long error messages from printing to console
const setupApp = () => {

    // Middleware
    const corsHeadersMiddleware = require('./middleware/corsHeadersMiddleware');
    const errorHandlerMiddleware = require('./middleware/errorHandlerMiddleware');

    app.use(corsHeadersMiddleware);
	app.use(errorHandlerMiddleware);
    app.use(express.json());
    app.use(morgan('tiny'));

    // Set up my project apps
    setUpClimbingLogApp(app)

    return app
}

module.exports = setupApp;