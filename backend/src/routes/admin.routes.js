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
        reason: Joi.string().allow('', null).max(255).optional(),
    }),
};

const suspendCompanySchema = {
    params: Joi.object().keys({
        id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    }),
    body: Joi.object().keys({
        reason: Joi.string().allow('', null).max(255).optional(),
    }),
};

const objectIdParamsSchema = {
    params: Joi.object().keys({
        id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    }),
};

const reportQuerySchema = {
    query: Joi.object().keys({
        startDate: Joi.date().iso().required(),
        endDate: Joi.date().iso().required(),
    }),
};

/**
 * @swagger
 * /api/admin/notifications:
 *   get:
 *     summary: Get admin notifications
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin notifications
 */
router.get('/notifications', adminController.getAdminNotifications);

/**
 * @swagger
 * /api/admin/reports:
 *   get:
 *     summary: Get system reports
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *       - in: query
 *         name: endDate
 *         required: true
 *     responses:
 *       200:
 *         description: System report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jobsCount: { type: number, example: 15 }
 *                 employersCount: { type: number, example: 3 }
 *                 districtsCount: { type: number, example: 5 }
 *                 placementRate: { type: number, example: 85 }
 */
router.get('/reports', validate(reportQuerySchema), adminController.getSystemReport);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/users', adminController.getAllUsers);

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   patch:
 *     summary: Update a user's status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: User status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id: { type: string, example: "60f1b2c3d..." }
 *                 name: { type: string, example: "Jane Employer" }
 *                 status: { type: string, example: "SUSPENDED" }
 */
router.patch('/users/:id/status', validate(updateStatusSchema), adminController.updateUserStatus);

/**
 * @swagger
 * /api/admin/jobs:
 *   get:
 *     summary: Get all jobs system-wide (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all jobs
 */
router.get('/jobs', adminController.getAllJobs);
/**
 * @swagger
 * /api/admin/jobs/{id}:
 *   delete:
 *     summary: Delete a job by ID (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Job deleted
 */
router.delete('/jobs/:id', validate(objectIdParamsSchema), adminController.deleteJob);

/**
 * @swagger
 * /api/admin/applications:
 *   get:
 *     summary: Get all applications system-wide (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of applications
 */
router.get('/applications', adminController.getAllApplications);
/**
 * @swagger
 * /api/admin/applications/{id}:
 *   delete:
 *     summary: Delete an application by ID (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Application deleted
 */
router.delete('/applications/:id', validate(objectIdParamsSchema), adminController.deleteApplication);

/**
 * @swagger
 * /api/admin/companies:
 *   get:
 *     summary: Get all companies (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of companies
 */
router.get('/companies', adminController.getAllCompanies);
/**
 * @swagger
 * /api/admin/companies/{id}/verify:
 *   patch:
 *     summary: Verify a company (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Company verified
 */
router.patch('/companies/:id/verify', validate(objectIdParamsSchema), adminController.verifyCompany);

/**
 * @swagger
 * /api/admin/companies/{id}/suspend:
 *   patch:
 *     summary: Suspend a company (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason: { type: string }
 *     responses:
 *       200:
 *         description: Company suspended
 */
router.patch('/companies/:id/suspend', validate(suspendCompanySchema), adminController.suspendCompany);

module.exports = router;
