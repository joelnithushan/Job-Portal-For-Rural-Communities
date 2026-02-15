const User = require('../models/user.model');
const { generateToken } = require('../utils/jwt');
const config = require('../config/env');

const register = async (userData) => {
    if (userData.role === 'ADMIN') {
        throw { statusCode: 403, message: 'Admins cannot be registered publicly' };
    }
    if (await User.isEmailTaken(userData.email)) {
        throw { statusCode: 400, message: 'Email already taken' };
    }
    const user = await User.create(userData);
    const token = generateToken(user._id, user.role);
    return { user, token };
};

const login = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user || !(await user.isPasswordMatch(password))) {
        throw { statusCode: 401, message: 'Incorrect email or password' };
    }
    const token = generateToken(user._id, user.role);
    return { user, token };
};

const getCurrentUser = async (user) => {
    return user;
};

const seedAdmin = async () => {
    const adminEmail = config.admin.email;
    const adminPassword = config.admin.password;

    if (!adminEmail || !adminPassword) {
        return;
    }

    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
        await User.create({
            name: 'System Admin',
            email: adminEmail,
            password: adminPassword,
            role: 'ADMIN',
            isEmailVerified: true
        });
    }
};

module.exports = {
    register,
    login,
    getCurrentUser,
    seedAdmin
};
