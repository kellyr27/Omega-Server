const express = require('express');
const app = express();

const morgan = require('morgan');

// Routes
const climbingLogApp = require('./projects/climbingLog/app');

// Middleware
const corsHeadersMiddleware = require('./middleware/corsHeadersMiddleware');

app.use(corsHeadersMiddleware);
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/climbinglog', climbingLogApp);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
