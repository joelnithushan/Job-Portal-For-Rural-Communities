const config = require('../config/env');
const { errorResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err;
    if (!statusCode) statusCode = 500;

    if (config.env === 'production' && !err.isOperational) {
        statusCode = 500;
        message = 'Internal Server Error';
    }

    res.locals.errorMessage = err.message;

    const response = {
        code: statusCode,
        message,
        ...(config.env === 'development' && { stack: err.stack }),
    };

    console.error(err);

    if (config.env === 'development') {
        return res.status(statusCode).json({ success: false, ...response });
    }

    return errorResponse(res, message, statusCode);
};

module.exports = errorHandler;
