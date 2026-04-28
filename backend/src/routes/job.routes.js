const express = require('express');
const Joi = require('joi');
const jobController = require('../controllers/job.controller');
const validate = require('../middlewares/validate.middleware');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

const router = express.Router();

const paramIdSchema = {
    params: Joi.object().keys({
        id: Joi.string().hex().length(24).required(),
    }),
};

const locationSchema = Joi.object().keys({
    type: Joi.string().valid('Point').default('Point'),
    coordinates: Joi.array().items(Joi.number()).length(2).required(),
});

const phoneRegex = /^(?:\+94|0)[0-9]{9}$/;

const createJobSchema = {
    body: Joi.object().keys({
        title: Joi.string().required(),
        description: Joi.string().required(),
        district: Joi.string().required(),
        contactPhone: Joi.string().required().pattern(phoneRegex).messages({
            'string.pattern.base': 'Must be a valid Sri Lankan mobile number'
        }),
        town: Joi.string(),
        category: Joi.string(),
        jobType: Joi.string().valid('FULL_TIME', 'PART_TIME', 'CONTRACT'),
        salaryMin: Joi.number(),
        salaryMax: Joi.number(),
        ageLimitMin: Joi.number().integer().min(0).max(120),
        ageLimitMax: Joi.number().integer().min(0).max(120),
        genderRequirement: Joi.string().valid('MALE', 'FEMALE', 'ANY'),
        location: locationSchema,
        cvRequired: Joi.boolean().default(false),
    }),
};

const updateJobSchema = {
    params: Joi.object().keys({
        id: Joi.string().hex().length(24).required(),
    }),
    body: Joi.object().keys({
        title: Joi.string(),
        description: Joi.string(),
        district: Joi.string(),
        contactPhone: Joi.string().pattern(phoneRegex).messages({
            'string.pattern.base': 'Must be a valid Sri Lankan mobile number'
        }),
        town: Joi.string(),
        category: Joi.string(),
        jobType: Joi.string().valid('FULL_TIME', 'PART_TIME', 'CONTRACT'),
        salaryMin: Joi.number(),
        salaryMax: Joi.number(),
        ageLimitMin: Joi.number().integer().min(0).max(120),
        ageLimitMax: Joi.number().integer().min(0).max(120),
        genderRequirement: Joi.string().valid('MALE', 'FEMALE', 'ANY'),
        location: locationSchema,
        cvRequired: Joi.boolean(),
        status: Joi.string().valid('OPEN', 'CLOSED'),
    }),
};

const getJobsSchema = {
    query: Joi.object().keys({
        district: Joi.string(),
        category: Joi.string(),
        jobType: Joi.string().valid('FULL_TIME', 'PART_TIME', 'CONTRACT'),
        search: Joi.string().allow(''),
        sort: Joi.string().valid('newest', 'salaryDesc', 'salaryAsc'),
        salaryMin: Joi.number().integer().min(0),
        salaryMax: Joi.number().integer().min(0),
        page: Joi.number().integer().min(1),
        limit: Joi.number().integer().min(1).max(100),
    }),
};

const nearbyJobsSchema = {
    query: Joi.object().keys({
        lat: Joi.number().required(),
        lng: Joi.number().required(),
        radiusKm: Joi.number().min(1).max(100),
    }),
};

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Get all jobs with optional filtering
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of jobs
 */
router.get('/', validate(getJobsSchema), jobController.getJobs);

/**
 * @swagger
 * /api/jobs/stats/categories:
 *   get:
 *     summary: Get statistics grouped by job category
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: Category stats
 */
router.get('/stats/categories', jobController.getCategoryStats);

/**
 * @swagger
 * /api/jobs/stats/summary:
 *   get:
 *     summary: Get overall summary statistics
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: Summary stats
 */
router.get('/stats/summary', jobController.getSummaryStats);

/**
 * @swagger
 * /api/jobs/nearby:
 *   get:
 *     summary: Get jobs near a coordinate
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Nearby jobs
 */
router.get('/nearby', validate(nearbyJobsSchema), jobController.getNearbyJobs);

/**
 * @swagger
 * /api/jobs/mine:
 *   get:
 *     summary: Get jobs posted by the authenticated employer
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employer's jobs
 */
router.get('/mine', auth, requireRole('EMPLOYER'), jobController.getMyJobs);

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Get a standard job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job details
 */
router.get('/:id', validate(paramIdSchema), jobController.getJobById);

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Create a new job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, district, contactPhone]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               district:
 *                 type: string
 *               contactPhone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Job Created Successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id: { type: string, example: "65c2b1a2..." }
 *                 title: { type: string, example: "Software Engineer" }
 *                 district: { type: string, example: "Colombo" }
 *                 status: { type: string, example: "OPEN" }
 */
router.post('/', auth, requireRole('EMPLOYER'), validate(createJobSchema), jobController.createJob);

/**
 * @swagger
 * /api/jobs/{id}:
 *   patch:
 *     summary: Update an existing job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Job updated
 */
router.patch('/:id', auth, requireRole('EMPLOYER'), validate(updateJobSchema), jobController.updateJob);

/**
 * @swagger
 * /api/jobs/{id}:
 *   delete:
 *     summary: Delete a job
 *     tags: [Jobs]
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
router.delete('/:id', auth, requireRole('EMPLOYER', 'ADMIN'), validate(paramIdSchema), jobController.deleteJob);

module.exports = router;
