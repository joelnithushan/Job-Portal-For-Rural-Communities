const { errorResponse } = require('../utils/response');

const role = (requiredRights) => (req, res, next) => {
    if (req.user.role !== requiredRights && !requiredRights.includes(req.user.role)) {
        return errorResponse(res, 'Forbidden', 403);
    }
    next();
};

module.exports = role;
