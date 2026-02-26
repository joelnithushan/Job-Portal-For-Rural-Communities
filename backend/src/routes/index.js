const express = require('express');
const authRoutes = require('./auth.routes');
const healthRoutes = require('./health.routes');
const companyRoutes = require('./company.routes');
const jobRoutes = require('./job.routes');
const adminRoutes = require('./admin.routes');
const applicationRoutes = require('./application.routes');
const geoRoutes = require('./geo.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/companies', companyRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/admin', adminRoutes);
router.use('/geo', geoRoutes);

module.exports = router;