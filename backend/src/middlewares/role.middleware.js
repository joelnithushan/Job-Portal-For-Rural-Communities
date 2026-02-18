const { errorResponse } = require('../utils/response');

const requireRole = (...allowedRoles) => (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
        return errorResponse(res, 'Forbidden', 403);
    }
    next();
};

module.exports = requireRole;
