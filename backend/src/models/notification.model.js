const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['INFO', 'SUCCESS', 'WARNING'],
            default: 'INFO',
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        link: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

notificationSchema.methods.toJSON = function () {
    const notification = this;
    const notificationObj = notification.toObject();
    delete notificationObj.__v;
    return notificationObj;
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
