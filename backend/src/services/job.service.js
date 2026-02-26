const Job = require('../models/job.model');

const createJob = async (jobData) => {
    const job = await Job.create(jobData);
    return job;
};

const getJobs = async ({ district, category, jobType, page = 1, limit = 10 }) => {
    const filter = {};
    if (district) filter.district = district;
    if (category) filter.category = category;
    if (jobType) filter.jobType = jobType;

    const skip = (page - 1) * limit;
    const [jobs, total] = await Promise.all([
        Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Job.countDocuments(filter),
    ]);

    return {
        jobs,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};

const updateJob = async (jobId, updateData, userId) => {
    const job = await Job.findById(jobId);
    if (!job) {
        const error = new Error('Job not found');
        error.statusCode = 404;
        throw error;
    }
    if (job.employerId.toString() !== userId.toString()) {
        const error = new Error('Forbidden: you can only update your own jobs');
        error.statusCode = 403;
        throw error;
    }
    Object.assign(job, updateData);
    await job.save();
    return job;
};

const deleteJob = async (jobId, user) => {
    const job = await Job.findById(jobId);
    if (!job) {
        const error = new Error('Job not found');
        error.statusCode = 404;
        throw error;
    }
    const isOwner = job.employerId.toString() === user._id.toString();
    const isAdmin = user.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
        const error = new Error('Forbidden: only the job owner or an admin can delete');
        error.statusCode = 403;
        throw error;
    }
    await job.deleteOne();
};

const getNearbyJobs = async (lat, lng, radiusKm = 10) => {
    const radiusInMeters = radiusKm * 1000;
    const jobs = await Job.find({
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [lng, lat],
                },
                $maxDistance: radiusInMeters,
            },
        },
    });
    return jobs;
};

module.exports = {
    createJob,
    getJobs,
    updateJob,
    deleteJob,
    getNearbyJobs,
};
