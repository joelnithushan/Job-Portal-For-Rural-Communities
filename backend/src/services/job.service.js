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

module.exports = {
    createJob,
    getJobs,
};
