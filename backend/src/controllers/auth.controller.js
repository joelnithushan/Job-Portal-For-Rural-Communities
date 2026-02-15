const authService = require('../services/auth.service');
const { successResponse } = require('../utils/response');

const register = async (req, res, next) => {
    try {
        const { user, token } = await authService.register(req.body);
        successResponse(res, 'User registered successfully', { user, token }, 201);
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await authService.login(email, password);
        successResponse(res, 'Login successful', { user, token });
    } catch (error) {
        next(error);
    }
};

const me = async (req, res, next) => {
    try {
        const user = await authService.getCurrentUser(req.user);
        successResponse(res, 'User profile retrieved', { user });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    me,
};
