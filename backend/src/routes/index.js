const express = require('express');
const authRoutes = require('./auth.routes');
const healthRoutes = require('./health.routes');
const jobRoutes = require('./job.routes');
const adminRoutes = require('./admin.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/jobs', jobRoutes);
router.use('/admin', adminRoutes);

module.exports = router;