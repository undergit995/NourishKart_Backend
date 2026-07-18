const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

// General rate limiter for most API routes
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per window (per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
});

// Stricter rate limiter for authentication-related routes
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // Limit each IP to 10 auth attempts per window to prevent brute-force
	standardHeaders: true,
	legacyHeaders: false,
	keyGenerator: (req, res) => {
		const ip = ipKeyGenerator(req, res); // Use the helper to get a normalized IP
		// Use IP address and email as the key for rate limiting auth routes.
		// This prevents users on a shared IP (like Wi-Fi) from locking each other out.
		if (req.body.email) {
			return `${ip}-${req.body.email}`;
		}
		return ip; // Fallback to just the normalized IP if email is not present
	},
	message: { message: 'Too many authentication attempts from this IP, please try again after 15 minutes' },
});

module.exports = {
	apiLimiter,
	authLimiter,
};