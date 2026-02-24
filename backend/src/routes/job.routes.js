const express = require('express');
const Joi = require('joi');
const jobController = require('../controllers/job.controller');
const validate = require('../middlewares/validate.middleware');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

const router = express.Router();

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

router.post('/', auth, requireRole('EMPLOYER'), validate(createJobSchema), jobController.createJob);

module.exports = router;
