const errorHandlerMiddleware = (err, req, res, next) => {
    if (err) {
		console.error(err)
        res
            .status(err.statusCode || 500)
            .json({ error: err.message || 'An unexpected error occurred'});
    } else {
        next();
    }
}

module.exports = errorHandlerMiddleware;