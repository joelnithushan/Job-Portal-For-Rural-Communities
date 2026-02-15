const { successResponse } = require('../utils/response');

const getHealth = (req, res) => {
    successResponse(res, 'OK', {
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
};

module.exports = {
    getHealth,
};
