const User = require('../models/user.model');

const getAllUsers = async () => {
    const users = await User.find().select('-password -__v');
    return users;
};

const updateUserStatus = async (userId, status) => {
    const user = await User.findById(userId);
    if (!user) {
        throw { statusCode: 404, message: 'User not found' };
    }
    user.status = status;
    await user.save();
    return user;
};

module.exports = {
    getAllUsers,
    updateUserStatus,
};
