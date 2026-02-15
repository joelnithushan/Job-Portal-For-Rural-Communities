const jwt = require('jsonwebtoken');
const config = require('../config/env');

const generateToken = (userId, role) => {
    return jwt.sign({ sub: userId, role }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
    });
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, config.jwt.secret);
    } catch (error) {
        return null;
    }
};

module.exports = {
    generateToken,
    verifyToken,
};
