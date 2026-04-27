const mongoose = require('mongoose');
const { successResponse } = require('../utils/response');

const getHealth = (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED';
    
    successResponse(res, 'OK', {
        status: 'UP',
        database: dbStatus,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
};

module.exports = {
    getHealth,
};
