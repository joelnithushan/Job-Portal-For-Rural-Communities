const express = require('express');
const notificationController = require('../controllers/notification.controller');
const auth = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(auth);

router.get('/me', notificationController.getMyNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);

module.exports = router;
