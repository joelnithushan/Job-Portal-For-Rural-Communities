const mongoose = require('mongoose');

const applicationSchema = mongoose.Schema(
    {
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Job',
            required: true,
        },
        seekerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        employerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['APPLIED', 'REVIEWED', 'ACCEPTED', 'REJECTED'],
            default: 'APPLIED',
        },
        note: {
            type: String,
            trim: true,
        },
        cvUrl: {
            type: String,
            trim: true,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

applicationSchema.methods.toJSON = function () {
    const application = this;
    const applicationObject = application.toObject();
    delete applicationObject.__v;
    return applicationObject;
};

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
