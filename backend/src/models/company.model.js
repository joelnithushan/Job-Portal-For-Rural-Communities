const mongoose = require('mongoose');

const companySchema = mongoose.Schema(
    {
        employerUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        businessName: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        district: {
            type: String,
            trim: true,
        },
        town: {
            type: String,
            trim: true,
        },
        contactPhone: {
            type: String,
            trim: true,
        },
        contactWhatsApp: {
            type: String,
            trim: true,
        },
        verificationStatus: {
            type: String,
            enum: ['PENDING', 'VERIFIED', 'REJECTED'],
            default: 'PENDING',
        },
        isSuspended: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

companySchema.methods.toJSON = function () {
    const company = this;
    const companyObject = company.toObject();
    delete companyObject.__v;
    return companyObject;
};

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
