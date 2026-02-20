const User = require('../models/user.model');

const getAllUsers = async () => {
    const users = await User.find().select('-password -__v');
    return users;
};

module.exports = {
    getAllUsers,
};
