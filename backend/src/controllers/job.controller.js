const jobService = require('../services/job.service');
const { successResponse } = require('../utils/response');

const createJob = async (req, res, next) => {
    try {
        const jobData = {
            ...req.body,
            employerId: req.user._id,
        };
        const job = await jobService.createJob(jobData);
        successResponse(res, 'Job created successfully', { job }, 201);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createJob,
};
