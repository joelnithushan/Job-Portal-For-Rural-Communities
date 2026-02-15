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

module.exports = {
    authLimiter,
};
