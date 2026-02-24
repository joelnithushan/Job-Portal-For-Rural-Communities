const mongoose = require('mongoose');

const jobSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        district: {
            type: String,
            required: true,
            trim: true,
        },
        town: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            required: true,
            trim: true,
        },
        jobType: {
            type: String,
            required: true,
            trim: true,
        },
        salaryMin: {
            type: Number,
        },
        salaryMax: {
            type: Number,
        },
        contactPhone: {
            type: String,
            trim: true,
        },
        employerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['ACTIVE', 'CLOSED', 'PENDING'],
            default: 'ACTIVE',
        },
    },
    {
        timestamps: true,
    }
);

jobSchema.methods.toJSON = function () {
    const job = this;
    const jobObject = job.toObject();
    delete jobObject.__v;
    return jobObject;
};

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
