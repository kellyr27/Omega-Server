const setupApp = require('./app');

/**
 * This asynchronous function is responsible for starting an Express server.
 * 
 * It first sets up the Express application by calling the `setupApp` function.
 * Then, it determines the port on which the server should run. This is either
 * provided by the `PORT` environment variable or defaults to 5000 if `PORT` is not set.
 * 
 * The server is started by calling `app.listen()`, passing in the determined port and a callback
 * function that logs a message to the console indicating the port on which the server is running.
 * 
 * If the server starts successfully, the server instance is returned. This instance can be used to
 * close the server later, if needed.
 * 
 * If there's an error while starting the server, the error message is logged to the console and the
 * process is terminated with a failure status code (1).
 * 
 * @returns {Server} The Express server instance.
 * @throws {Error} If there's an error while starting the server.
 */
const startServer = async () => {
    try {

        // Set up the app
        const app = setupApp();

        const PORT = process.env.PORT || 5000;
        const server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

        return server
    } catch (error) {
        console.error('Could not start server', error);
        process.exit(1);
    }
};

// If the environment is not 'test', start the server
if (process.env.NODE_ENV !== 'test') {
    startServer();
}

module.exports = startServer;