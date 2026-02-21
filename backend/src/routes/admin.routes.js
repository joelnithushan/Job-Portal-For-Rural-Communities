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

router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/status', validate(updateStatusSchema), adminController.updateUserStatus);

module.exports = router;
