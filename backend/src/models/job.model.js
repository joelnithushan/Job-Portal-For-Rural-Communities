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
            enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT'],
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
            required: true,
            trim: true,
        },
        employerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['OPEN', 'CLOSED'],
            default: 'OPEN',
        },
        cvRequired: {
            type: Boolean,
            default: false,
        },
        ageLimitMin: {
            type: Number,
            default: null,
        },
        ageLimitMax: {
            type: Number,
            default: null,
        },
        genderRequirement: {
            type: String,
            enum: ['MALE', 'FEMALE', 'ANY'],
            default: 'ANY',
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
            },
            coordinates: {
                type: [Number],
            },
        },
    },
    {
        timestamps: true,
    }
);

jobSchema.index({ 'location': '2dsphere' });

jobSchema.methods.toJSON = function () {
    const job = this;
    const jobObject = job.toObject();
    delete jobObject.__v;
    return jobObject;
};

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;