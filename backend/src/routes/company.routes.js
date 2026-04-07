const express = require('express');
const Joi = require('joi');
const companyController = require('../controllers/company.controller');
const validate = require('../middlewares/validate.middleware');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

const router = express.Router();

const phoneRegex = /^(?:\+94|0)[0-9]{9}$/;

const createCompanySchema = {
    body: Joi.object().keys({
        businessName: Joi.string().required(),
        description: Joi.string(),
        district: Joi.string().required(),
        town: Joi.string(),
        contactPhone: Joi.string().required().pattern(phoneRegex).messages({
            'string.pattern.base': 'Must be a valid Sri Lankan mobile number'
        }),
        contactWhatsApp: Joi.string().pattern(phoneRegex).messages({
            'string.pattern.base': 'Must be a valid Sri Lankan mobile number'
        }).allow(''),
    }),
};

const updateCompanySchema = {
    body: Joi.object().keys({
        businessName: Joi.string(),
        description: Joi.string().allow(''),
        district: Joi.string(),
        town: Joi.string().allow(''),
        contactPhone: Joi.string().pattern(phoneRegex).messages({
            'string.pattern.base': 'Must be a valid Sri Lankan mobile number'
        }),
        contactWhatsApp: Joi.string().pattern(phoneRegex).messages({
            'string.pattern.base': 'Must be a valid Sri Lankan mobile number'
        }).allow(''),
    }),
};

/**
 * @swagger
 * /api/companies:
 *   post:
 *     summary: Create a company profile for the authenticated employer
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [businessName, district, contactPhone]
 *             properties:
 *               businessName:
 *                 type: string
 *               description:
 *                 type: string
 *               district:
 *                 type: string
 *               town:
 *                 type: string
 *               contactPhone:
 *                 type: string
 *               contactWhatsApp:
 *                 type: string
 *     responses:
 *       201:
 *         description: Company created
 */
router.post('/', auth, requireRole('EMPLOYER'), validate(createCompanySchema), companyController.createCompany);

/**
 * @swagger
 * /api/companies/me:
 *   get:
 *     summary: Get the authenticated employer's company profile
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company details
 */
router.get('/me', auth, requireRole('EMPLOYER'), companyController.getMyCompany);

/**
 * @swagger
 * /api/companies/me:
 *   patch:
 *     summary: Update the authenticated employer's company profile
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company updated
 */
router.patch('/me', auth, requireRole('EMPLOYER'), validate(updateCompanySchema), companyController.updateMyCompany);

/**
 * @swagger
 * /api/companies/me:
 *   delete:
 *     summary: Delete the authenticated employer's company profile
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company deleted
 */
router.delete('/me', auth, requireRole('EMPLOYER'), companyController.deleteMyCompany);

/**
 * @swagger
 * /api/companies/{id}:
 *   get:
 *     summary: Get a company by ID
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Company details
 */
router.get('/:id', companyController.getCompanyById);

module.exports = router;
