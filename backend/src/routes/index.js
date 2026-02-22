const express = require('express');
const authRoutes = require('./auth.routes');
const healthRoutes = require('./health.routes');
const companyRoutes = require('./company.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/companies', companyRoutes);

module.exports = router;
