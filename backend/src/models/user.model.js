const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: function() {
                return !this.googleId;
            },
            minlength: 8,
            private: true,
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },
        role: {
            type: String,
            enum: ['ADMIN', 'EMPLOYER', 'JOB_SEEKER'],
            default: 'JOB_SEEKER',
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
            enum: ['ACTIVE', 'SUSPENDED'],
            default: 'ACTIVE',
        },
        suspensionReason: {
            type: String,
            default: null,
            maxlength: 255,
        },
        passwordResetToken: {
            type: String,
            default: undefined,
        },
        passwordResetExpires: {
            type: Date,
            default: undefined,
        },
        profilePicture: {
            type: String,
            default: 'https://res.cloudinary.com/dedoxaqug/image/upload/v1774887841/ruralwork/defaults/default_avatar.png',
        },
        phone: {
            type: String,
            default: null,
            trim: true,
            unique: true,
            sparse: true,
        },
        district: {
            type: String,
            default: null,
        },
        nic: {
            type: String,
            default: null,
            trim: true,
            unique: true,
            sparse: true,
        },
        bio: {
            type: String,
            default: null,
            maxlength: 500,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
    const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
    return !!user;
};

userSchema.methods.isPasswordMatch = async function (password) {
    const user = this;
    return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.__v;
    return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
