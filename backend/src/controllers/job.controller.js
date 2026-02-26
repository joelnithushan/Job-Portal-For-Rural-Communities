const jobService = require('../services/job.service');
const { successResponse, errorResponse } = require('../utils/response');

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

const updateJob = async (req, res, next) => {
    try {
        const job = await jobService.updateJob(req.params.id, req.body, req.user._id);
        successResponse(res, 'Job updated successfully', { job });
    } catch (error) {
        if (error.statusCode) {
            return errorResponse(res, error.message, error.statusCode);
        }
        next(error);
    }
};

const deleteJob = async (req, res, next) => {
    try {
        await jobService.deleteJob(req.params.id, req.user);
        successResponse(res, 'Job deleted successfully');
    } catch (error) {
        if (error.statusCode) {
            return errorResponse(res, error.message, error.statusCode);
        }
        next(error);
    }
};

const getNearbyJobs = async (req, res, next) => {
    try {
        const { lat, lng, radiusKm } = req.query;
        if (!lat || !lng) {
            return errorResponse(res, 'lat and lng are required', 400);
        }
        const jobs = await jobService.getNearbyJobs(
            parseFloat(lat),
            parseFloat(lng),
            parseFloat(radiusKm) || 10
        );
        successResponse(res, 'Nearby jobs retrieved successfully', { jobs });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createJob,
    getJobs,
    updateJob,
    deleteJob,
    getNearbyJobs,
};
