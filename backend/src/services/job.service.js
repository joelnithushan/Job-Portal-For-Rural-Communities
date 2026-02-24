const Job = require('../models/job.model');

const createJob = async (jobData) => {
    const job = await Job.create(jobData);
    return job;
};

module.exports = {
    createJob,
};
