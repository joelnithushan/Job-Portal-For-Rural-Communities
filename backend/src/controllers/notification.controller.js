const Notification = require('../models/notification.model');
const { successResponse, errorResponse } = require('../utils/response');

const getMyNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);
        successResponse(res, 'Notifications retrieved', { notifications });
    } catch (error) {
        next(error);
    }
};

const markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { isRead: true },
            { new: true }
        );
        if (!notification) {
            return errorResponse(res, 'Notification not found', 404);
        }
        successResponse(res, 'Notification marked as read', { notification });
    } catch (error) {
        next(error);
    }
};

const markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, isRead: false },
            { isRead: true }
        );
        successResponse(res, 'All notifications marked as read', {});
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
};
