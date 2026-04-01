const express = require('express');
const Joi = require('joi');
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const auth = require('../middlewares/auth.middleware');
const { authLimiter } = require('../middlewares/rateLimit.middleware');

const router = express.Router();

const nameRegex = /^[a-zA-Z\s.\-]+$/;
const pwdRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
const phoneRegex = /^(?:\+94|0)[0-9]{9}$/;
const nicRegex = /^(?:\d{9}[vVxX]|\d{12})$/;

const registerSchema = {
    body: Joi.object().keys({
        name: Joi.string().required().pattern(nameRegex).messages({
            'string.pattern.base': 'Name can only contain letters, spaces, dots and hyphens'
        }),
        email: Joi.string().required().email(),
        password: Joi.string().required().pattern(pwdRegex).messages({
            'string.pattern.base': 'Password must have min 8 chars, 1 uppercase, 1 number, and 1 special char'
        }),
        role: Joi.string().valid('EMPLOYER', 'JOB_SEEKER').required(),
        nic: Joi.string().pattern(nicRegex).messages({
            'string.pattern.base': 'Enter a valid Sri Lankan NIC'
        }).optional(),
    }),
};

const loginSchema = {
    body: Joi.object().keys({
        email: Joi.string().required(),
        password: Joi.string().required(),
    }),
};

const forgotPasswordSchema = {
    body: Joi.object().keys({
        email: Joi.string().required().email(),
    }),
};

const resetPasswordSchema = {
    body: Joi.object().keys({
        password: Joi.string().required().pattern(pwdRegex).messages({
            'string.pattern.base': 'Password must have min 8 chars, 1 uppercase, 1 number, and 1 special char'
        }),
    }),
};

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/google', authController.google);
router.get('/me', auth, authController.me);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password/:token', authLimiter, validate(resetPasswordSchema), authController.resetPassword);

module.exports = router;
