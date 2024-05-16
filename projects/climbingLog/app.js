// To be renamed - app.js but in a subfolder

const basePath = '/climbinglog';

const setUpClimbingLogApp = (app) => {

    const authenticate = require('./middleware/authenticate');
    const errorHandler = require('./middleware/errorHandler');

    // Routes
    const userRoutes = require('./routes/userRoutes');
    const ascentRoutes = require('./routes/ascentRoutes');
    const routeRoutes = require('./routes/routeRoutes');
    const statsRoutes = require('./routes/statsRoutes');
	const areaRoutes = require('./routes/areaRoutes');

    app.use(`${basePath}/api/users`, userRoutes);
    app.use(`${basePath}/api/ascents`, ascentRoutes);
    app.use(`${basePath}/api/routes`, routeRoutes);
    app.use(`${basePath}/api/stats`, statsRoutes);
	// app.use(`${basePath}/api/areas`, areaRoutes);


    // Used for testing the authenticate middleware
    app.get(`${basePath}/protected`, authenticate, (req, res) => {
        res.status(200).json({ message: 'You are authenticated' });
    });

    // Middleware
    app.use(errorHandler)
}

module.exports = setUpClimbingLogApp;