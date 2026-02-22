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
            trim: true,
        },
        category: {
            type: String,
            trim: true,
        },
        jobType: {
            type: String,
            enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT'],
        },
        salaryMin: {
            type: Number,
        },
        salaryMax: {
            type: Number,
        },
        contactPhone: {
            type: String,
            required: true,
        },
        employerId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['OPEN', 'CLOSED'],
            default: 'OPEN',
        },
    },
    {
        timestamps: true,
    }
);

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
