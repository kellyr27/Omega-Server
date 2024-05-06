const corsHeadersMiddleware = (req, res, next) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
		
	const origin = req.headers.origin;
	if (allowedOrigins.includes(origin)) {
		res.setHeader('Access-Control-Allow-Origin', origin);
	}

	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE"
	);
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Content-Type, Authorization, X-Content-Type-Options, Accept, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers"
	);
	res.setHeader("Access-Control-Allow-Credentials", true);
	res.setHeader("Access-Control-Allow-Private-Network", true);
	res.setHeader("Access-Control-Max-Age", 7200);

	next();
};

module.exports = corsHeadersMiddleware;