const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    skipSuccessfulRequests: true,
    message: {
        success: false,
        message: 'Too many login attempts from this IP, please try again after 15 minutes',
    },
});

const chatLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 requests per windowMs
    message: {
        success: false,
        message: 'Too many chat requests from this IP, please try again after a minute',
    },
});

module.exports = {
    authLimiter,
    chatLimiter,
};
