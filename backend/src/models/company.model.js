const mongoose = require('mongoose');

const companySchema = mongoose.Schema(
    {
        employerUserId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'User',
            required: true,
        },
        businessName: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        district: {
            type: String,
            required: true,
        },
        town: {
            type: String,
        },
        contactPhone: {
            type: String,
            required: true,
        },
        contactWhatsApp: {
            type: String,
        },
        verificationStatus: {
            type: String,
            enum: ['PENDING', 'VERIFIED'],
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

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
