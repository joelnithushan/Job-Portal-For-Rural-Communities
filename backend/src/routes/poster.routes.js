const express = require('express');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const posterController = require('../controllers/poster.controller');
const validate = require('../middlewares/validate.middleware');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

const router = express.Router();

const phoneRegex = /^(?:\+94|0)[0-9]{9}$/;

const generateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many poster generations. Please try again later.' },
});

const generateSchema = {
    body: Joi.object().keys({
        title: Joi.string().required().min(2).max(120),
        category: Joi.string().allow('', null),
        district: Joi.string().allow('', null),
        town: Joi.string().allow('', null),
        jobType: Joi.string().valid('FULL_TIME', 'PART_TIME', 'CONTRACT').allow('', null),
        salaryMin: Joi.number().min(0).allow(null),
        salaryMax: Joi.number().min(0).allow(null),
        contactPhone: Joi.string().pattern(phoneRegex).allow('', null).messages({
            'string.pattern.base': 'Must be a valid Sri Lankan mobile number',
        }),
        contactEmail: Joi.string().email().allow('', null),
        tags: Joi.array().items(Joi.string().max(40)).max(10).default([]),
        stylePreset: Joi.string().valid('CLASSIC', 'MINIMAL', 'VIBRANT').default('CLASSIC'),
    }),
};

const createSchema = {
    body: Joi.object().keys({
        title: Joi.string().required().min(2).max(120),
        description: Joi.string().required().min(10).max(5000),
        category: Joi.string().allow('', null),
        district: Joi.string().allow('', null),
        town: Joi.string().allow('', null),
        jobType: Joi.string().valid('FULL_TIME', 'PART_TIME', 'CONTRACT').allow('', null),
        salaryMin: Joi.number().min(0).allow(null),
        salaryMax: Joi.number().min(0).allow(null),
        contactPhone: Joi.string().pattern(phoneRegex).required().messages({
            'string.pattern.base': 'Must be a valid Sri Lankan mobile number',
        }),
        tags: Joi.array().items(Joi.string().max(40)).max(10).default([]),
        stylePreset: Joi.string().valid('CLASSIC', 'MINIMAL', 'VIBRANT').default('CLASSIC'),
        prompt: Joi.string().allow('', null),
        imageUrl: Joi.string().uri().required(),
        imagePublicId: Joi.string().allow('', null),
        status: Joi.string().valid('DRAFT', 'PUBLISHED').default('PUBLISHED'),
    }),
};

const updateSchema = {
    params: Joi.object().keys({ id: Joi.string().hex().length(24).required() }),
    body: Joi.object().keys({
        title: Joi.string().min(2).max(120),
        description: Joi.string().min(10).max(5000),
        category: Joi.string().allow('', null),
        district: Joi.string().allow('', null),
        town: Joi.string().allow('', null),
        jobType: Joi.string().valid('FULL_TIME', 'PART_TIME', 'CONTRACT').allow('', null),
        salaryMin: Joi.number().min(0).allow(null),
        salaryMax: Joi.number().min(0).allow(null),
        contactPhone: Joi.string().pattern(phoneRegex).messages({
            'string.pattern.base': 'Must be a valid Sri Lankan mobile number',
        }),
        tags: Joi.array().items(Joi.string().max(40)).max(10),
        status: Joi.string().valid('DRAFT', 'PUBLISHED'),
    }),
};

const listSchema = {
    query: Joi.object().keys({
        category: Joi.string(),
        district: Joi.string(),
        jobType: Joi.string().valid('FULL_TIME', 'PART_TIME', 'CONTRACT'),
        search: Joi.string().allow(''),
        page: Joi.number().integer().min(1),
        limit: Joi.number().integer().min(1).max(50),
    }),
};

const idSchema = {
    params: Joi.object().keys({ id: Joi.string().hex().length(24).required() }),
};

/**
 * @swagger
 * /api/posters:
 *   get:
 *     summary: List published job posters
 *     tags: [Posters]
 */
router.get('/', validate(listSchema), posterController.getPublicPosters);

/**
 * @swagger
 * /api/posters/mine:
 *   get:
 *     summary: List the authenticated employer's posters
 *     tags: [Posters]
 */
router.get('/mine', auth, requireRole('EMPLOYER'), posterController.getMyPosters);

/**
 * @swagger
 * /api/posters/{id}:
 *   get:
 *     summary: Get a single poster by ID
 *     tags: [Posters]
 */
router.get('/:id', validate(idSchema), posterController.getPosterById);

/**
 * @swagger
 * /api/posters/generate:
 *   post:
 *     summary: Generate a poster image with AI (Nano Banana Pro via OpenRouter)
 *     tags: [Posters]
 */
router.post(
    '/generate',
    auth,
    requireRole('EMPLOYER'),
    generateLimiter,
    validate(generateSchema),
    posterController.generatePoster
);

/**
 * @swagger
 * /api/posters:
 *   post:
 *     summary: Save a generated poster
 *     tags: [Posters]
 */
router.post('/', auth, requireRole('EMPLOYER'), validate(createSchema), posterController.createPoster);

/**
 * @swagger
 * /api/posters/{id}:
 *   patch:
 *     summary: Update a poster
 *     tags: [Posters]
 */
router.patch('/:id', auth, requireRole('EMPLOYER'), validate(updateSchema), posterController.updatePoster);

/**
 * @swagger
 * /api/posters/{id}:
 *   delete:
 *     summary: Delete a poster
 *     tags: [Posters]
 */
router.delete('/:id', auth, requireRole('EMPLOYER', 'ADMIN'), validate(idSchema), posterController.deletePoster);

module.exports = router;
