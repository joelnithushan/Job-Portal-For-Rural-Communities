const { chatLimiter } = require('../middlewares/rateLimit.middleware');
const chatController = require('../controllers/chat.controller');
const express = require('express');

const router = express.Router();

router.post('/', chatLimiter, chatController.handleChat);

module.exports = router;
