const { errorResponse } = require('../utils/response');
const { verifyToken } = require('../utils/jwt');
const User = require('../models/user.model');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return errorResponse(res, 'Authentication required', 401);
        }

        const decoded = verifyToken(token);

        if (!decoded) {
            return errorResponse(res, 'Invalid or expired token', 401);
        }

        const user = await User.findById(decoded.sub);

        if (!user) {
            return errorResponse(res, 'User not found', 401);
        }

        req.user = user;
        next();
    } catch (error) {
        return errorResponse(res, 'Authentication failed', 401);
    }
};

module.exports = auth;
