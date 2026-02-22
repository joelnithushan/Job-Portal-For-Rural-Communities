const User = require('../models/user.model');
const Job = require('../models/job.model');

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

const getAllJobs = async () => {
    const jobs = await Job.find().populate('employerId', 'name email');
    return jobs;
};

const deleteJob = async (jobId) => {
    const job = await Job.findById(jobId);
    if (!job) {
        throw { statusCode: 404, message: 'Job not found' };
    }
    await job.deleteOne();
    return job;
};

module.exports = {
    getAllUsers,
    updateUserStatus,
    getAllJobs,
    deleteJob,
};
