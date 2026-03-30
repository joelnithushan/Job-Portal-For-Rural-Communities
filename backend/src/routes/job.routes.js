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

const createJobSchema = {
    body: Joi.object().keys({
        title: Joi.string().required(),
        description: Joi.string().required(),
        district: Joi.string().required(),
        contactPhone: Joi.string().required(),
        town: Joi.string(),
        category: Joi.string(),
        jobType: Joi.string().valid('FULL_TIME', 'PART_TIME', 'CONTRACT'),
        salaryMin: Joi.number(),
        salaryMax: Joi.number(),
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
        contactPhone: Joi.string(),
        town: Joi.string(),
        category: Joi.string(),
        jobType: Joi.string().valid('FULL_TIME', 'PART_TIME', 'CONTRACT'),
        salaryMin: Joi.number(),
        salaryMax: Joi.number(),
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

router.get('/', validate(getJobsSchema), jobController.getJobs);
router.get('/stats/categories', jobController.getCategoryStats);
router.get('/stats/summary', jobController.getSummaryStats);
router.get('/nearby', validate(nearbyJobsSchema), jobController.getNearbyJobs);
router.get('/mine', auth, requireRole('EMPLOYER'), jobController.getMyJobs);
router.get('/:id', validate(paramIdSchema), jobController.getJobById);
router.post('/', auth, requireRole('EMPLOYER'), validate(createJobSchema), jobController.createJob);
router.patch('/:id', auth, requireRole('EMPLOYER'), validate(updateJobSchema), jobController.updateJob);
router.delete('/:id', auth, requireRole('EMPLOYER', 'ADMIN'), validate(paramIdSchema), jobController.deleteJob);

module.exports = router;
