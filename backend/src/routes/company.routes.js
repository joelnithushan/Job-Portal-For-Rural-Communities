const express = require('express');
const Joi = require('joi');
const companyController = require('../controllers/company.controller');
const validate = require('../middlewares/validate.middleware');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

const router = express.Router();

const createCompanySchema = {
    body: Joi.object().keys({
        businessName: Joi.string().required(),
        description: Joi.string(),
        district: Joi.string().required(),
        town: Joi.string(),
        contactPhone: Joi.string().required(),
        contactWhatsApp: Joi.string(),
    }),
};

const updateCompanySchema = {
    body: Joi.object().keys({
        businessName: Joi.string(),
        description: Joi.string().allow(''),
        district: Joi.string(),
        town: Joi.string().allow(''),
        contactPhone: Joi.string(),
        contactWhatsApp: Joi.string().allow(''),
    }),
};

router.post('/', auth, requireRole('EMPLOYER'), validate(createCompanySchema), companyController.createCompany);
router.get('/me', auth, requireRole('EMPLOYER'), companyController.getMyCompany);
router.patch('/me', auth, requireRole('EMPLOYER'), validate(updateCompanySchema), companyController.updateMyCompany);
router.delete('/me', auth, requireRole('EMPLOYER'), companyController.deleteMyCompany);
router.get('/:id', companyController.getCompanyById);

module.exports = router;
