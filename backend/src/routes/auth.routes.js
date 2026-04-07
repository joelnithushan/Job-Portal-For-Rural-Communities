const express = require('express');
const Joi = require('joi');
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const auth = require('../middlewares/auth.middleware');
const { authLimiter } = require('../middlewares/rateLimit.middleware');
const verifyCaptcha = require('../middlewares/captcha.middleware');

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
        phone: Joi.string().pattern(phoneRegex).messages({
            'string.pattern.base': 'Enter a valid Sri Lankan phone number'
        }).optional(),
        captchaToken: Joi.string().optional(),
    }),
};

const loginSchema = {
    body: Joi.object().keys({
        email: Joi.string().required(),
        password: Joi.string().required(),
        captchaToken: Joi.string().optional(),
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

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [EMPLOYER, JOB_SEEKER]
 *               nic:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: User successfully registered
 *       400:
 *         description: Validation error
 */
router.post('/register', authLimiter, verifyCaptcha, validate(registerSchema), authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login, returns token
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authLimiter, verifyCaptcha, validate(loginSchema), authController.login);
router.post('/google', authController.google);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 */
router.get('/me', auth, authController.me);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password/:token', authLimiter, validate(resetPasswordSchema), authController.resetPassword);

module.exports = router;
