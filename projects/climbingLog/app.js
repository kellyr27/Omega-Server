const express = require('express');
const app = express();

const authenticate = require('./middleware/authenticate');
const errorHandler = require('./middleware/errorHandler');

// Routes
const userRoutes = require('./routes/userRoutes');
const ascentRoutes = require('./routes/ascentRoutes');
const routeRoutes = require('./routes/routeRoutes');
const statsRoutes = require('./routes/statsRoutes');
const areaRoutes = require('./routes/areaRoutes');

app.use(`/api/users`, userRoutes);
app.use(`/api/ascents`, ascentRoutes);
app.use(`/api/routes`, routeRoutes);
app.use(`/api/stats`, statsRoutes);
app.use(`/api/areas`, areaRoutes);

// Used for testing the authenticate middleware
app.get(`/protected`, authenticate, (req, res) => {
    res.status(200).json({ message: 'You are authenticated' });
});

// Middleware
app.use(errorHandler)

module.exports = app;