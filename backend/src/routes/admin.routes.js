const express = require('express');
const Joi = require('joi');
const adminController = require('../controllers/admin.controller');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

router.use(auth);
router.use(requireRole('ADMIN'));

const updateStatusSchema = {
    params: Joi.object().keys({
        id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    }),
    body: Joi.object().keys({
        status: Joi.string().valid('ACTIVE', 'SUSPENDED').required(),
    }),
};

const objectIdParamsSchema = {
    params: Joi.object().keys({
        id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    }),
};

router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/status', validate(updateStatusSchema), adminController.updateUserStatus);

router.get('/jobs', adminController.getAllJobs);
router.delete('/jobs/:id', validate(objectIdParamsSchema), adminController.deleteJob);

router.get('/applications', adminController.getAllApplications);
router.delete('/applications/:id', validate(objectIdParamsSchema), adminController.deleteApplication);

router.patch('/companies/:id/verify', validate(objectIdParamsSchema), adminController.verifyCompany);
router.patch('/companies/:id/suspend', validate(objectIdParamsSchema), adminController.suspendCompany);

module.exports = router;
