const mongoose = require('mongoose');

const otpSchema = mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        otp: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 300, // 5 minutes TTL
        },
    }
);

const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;
