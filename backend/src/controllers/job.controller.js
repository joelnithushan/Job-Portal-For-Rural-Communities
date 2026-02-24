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

const getJobs = async (req, res, next) => {
    try {
        const { district, category, jobType, page, limit } = req.query;
        const result = await jobService.getJobs({
            district,
            category,
            jobType,
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 10,
        });
        successResponse(res, 'Jobs retrieved successfully', result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createJob,
    getJobs,
};
