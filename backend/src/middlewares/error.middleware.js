const config = require('../config/env');

const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    if (config.env === 'production' && !err.isOperational) {
        statusCode = 500;
        message = 'Internal Server Error';
    }

    return res.status(statusCode).json({
        success: false,
        message,
        ...(config.env === 'development' && { stack: err.stack }),
    });
};

module.exports = errorHandler;
