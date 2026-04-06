const axios = require('axios');
const { errorResponse } = require('../utils/response');

const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

/**
 * Express middleware to verify Google reCAPTCHA v3 token.
 * Expects `captchaToken` in req.body.
 * A score >= 0.5 is considered human.
 */
const verifyCaptcha = async (req, res, next) => {
    const { captchaToken } = req.body;

    if (!captchaToken) {
        return errorResponse(res, 'Security verification is required. Please try again.', 400);
    }

    try {
        const params = new URLSearchParams();
        params.append('secret', process.env.RECAPTCHA_SECRET);
        params.append('response', captchaToken);

        const { data } = await axios.post(RECAPTCHA_VERIFY_URL, params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        if (!data.success) {
            console.warn('reCAPTCHA verification failed:', data['error-codes']);
            return errorResponse(res, 'Security verification failed. Please try again.', 400);
        }

        // reCAPTCHA v3 score check (0.0 to 1.0)
        // 1.0 is very likely a human, 0.0 is very likely a bot.
        if (data.score < 0.5) {
            console.warn(`reCAPTCHA suspicious activity blocked. Score: ${data.score}`);
            return errorResponse(res, 'Suspicious activity detected. Please try again.', 403);
        }

        // Remove captchaToken so it doesn't leak into business logic
        delete req.body.captchaToken;
        next();
    } catch (error) {
        console.error('reCAPTCHA verification error:', error.message);
        return errorResponse(res, 'Security service unavailable. Please try again later.', 503);
    }
};

module.exports = verifyCaptcha;
