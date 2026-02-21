const adminService = require('../services/admin.service');
const { successResponse } = require('../utils/response');

const getAllUsers = async (req, res, next) => {
    try {
        const users = await adminService.getAllUsers();
        successResponse(res, 'Users retrieved successfully', { users });
    } catch (error) {
        next(error);
    }
};

const updateUserStatus = async (req, res, next) => {
    try {
        const user = await adminService.updateUserStatus(req.params.id, req.body.status);
        successResponse(res, 'User status updated successfully', { user });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllUsers,
    updateUserStatus,
};
