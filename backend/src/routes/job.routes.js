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
    }),
};

const getJobsSchema = {
    query: Joi.object().keys({
        district: Joi.string(),
        category: Joi.string(),
        jobType: Joi.string().valid('FULL_TIME', 'PART_TIME', 'CONTRACT'),
        page: Joi.number().integer().min(1),
        limit: Joi.number().integer().min(1).max(100),
    }),
};

router.get('/', validate(getJobsSchema), jobController.getJobs);
router.post('/', auth, requireRole('EMPLOYER'), validate(createJobSchema), jobController.createJob);
router.patch('/:id', auth, requireRole('EMPLOYER'), validate(updateJobSchema), jobController.updateJob);
router.delete('/:id', auth, requireRole('EMPLOYER', 'ADMIN'), validate(paramIdSchema), jobController.deleteJob);

module.exports = router;
