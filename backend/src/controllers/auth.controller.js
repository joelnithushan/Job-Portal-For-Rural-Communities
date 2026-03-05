const crypto = require('crypto');
const authService = require('../services/auth.service');
const User = require('../models/user.model');
const sendEmail = require('../utils/sendEmail');
const { successResponse } = require('../utils/response');

const register = async (req, res, next) => {
    try {
        const { user, token } = await authService.register(req.body);
        successResponse(res, 'User registered successfully', { user, token }, 201);
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await authService.login(email, password);
        successResponse(res, 'Login successful', { user, token });
    } catch (error) {
        next(error);
    }
};

const me = async (req, res, next) => {
    try {
        const user = await authService.getCurrentUser(req.user);
        successResponse(res, 'User profile retrieved', { user });
    } catch (error) {
        next(error);
    }
};

const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });

        // Always return success (don't reveal if email exists)
        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'If this email exists, a reset link has been sent.',
            });
        }

        // Generate token
        const token = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Save hashed token to user
        user.passwordResetToken = hashedToken;
        user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
        await user.save();

        // Build reset URL (send raw token)
        const resetURL = `${process.env.CLIENT_URL}/reset-password/${token}`;

        // Email HTML
        const html = `
        <div style="max-width:520px;margin:0 auto;font-family:'DM Sans',Arial,sans-serif;color:#1a1a1a;">
            <div style="background:#8B1A1A;padding:28px;text-align:center;">
                <h1 style="color:#ffffff;font-size:22px;margin:0;letter-spacing:1px;">NextEra</h1>
            </div>
            <div style="padding:32px 28px;background:#ffffff;border:1px solid #e5e5e5;">
                <h2 style="font-size:20px;margin:0 0 12px 0;">Reset Your Password</h2>
                <p style="font-size:14px;line-height:1.6;color:#555;">
                    You requested a password reset. Click the button below to set a new password.
                    This link expires in <strong>15 minutes</strong>.
                </p>
                <div style="text-align:center;margin:28px 0;">
                    <a href="${resetURL}"
                       style="display:inline-block;padding:14px 36px;background:#8B1A1A;color:#ffffff;
                              text-decoration:none;font-size:14px;font-weight:600;letter-spacing:1px;
                              text-transform:uppercase;">
                        RESET PASSWORD
                    </a>
                </div>
                <p style="font-size:13px;color:#888;line-height:1.5;">
                    If you did not request this, you can safely ignore this email.
                    Your password will remain unchanged.
                </p>
            </div>
            <div style="padding:16px;text-align:center;font-size:12px;color:#aaa;">
                &copy; NextEra Job Portal
            </div>
        </div>`;

        try {
            await sendEmail({
                to: user.email,
                subject: 'NextEra — Password Reset Request',
                html,
            });
        } catch (emailError) {
            // Clear token on email failure
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save();
            return res.status(500).json({
                success: false,
                message: 'Email could not be sent. Try again later.',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'If this email exists, a reset link has been sent.',
        });
    } catch (error) {
        next(error);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Hash incoming token to compare with DB
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Token is invalid or has expired.',
            });
        }

        // Validate password length
        if (!password || password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long.',
            });
        }

        // Update password (pre-save hook will hash it)
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password has been reset successfully.',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    me,
    forgotPassword,
    resetPassword,
};
