const errorHandler = (err, req, res, next) => {
    if (err) {
        res
        .status(err.statusCode || 500)
        .json({ error: err.message || 'An unexpected error occurred'});
    } else {
        next();
    }
}

module.exports = errorHandler;