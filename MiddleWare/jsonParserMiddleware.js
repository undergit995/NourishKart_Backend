const express = require('express');

/**
 * This middleware conditionally applies the express.json() parser.
 * It skips JSON parsing for the Razorpay webhook route to preserve the raw body
 * needed for signature verification. For all other routes, it functions as
 * a standard JSON parser.
 */
const conditionalJsonParser = (req, res, next) => {
    // Check if the request path is the Razorpay webhook
    if (req.originalUrl === '/api/payment/refund-webhook') {
        // If it is, skip the JSON parser and proceed to the next middleware
        return next();
    }
    // For all other routes, use the standard express.json() parser
    return express.json()(req, res, next);
};

module.exports = conditionalJsonParser;