const User = require('../models/user.model');
const { generateToken } = require('../utils/jwt');
const config = require('../config/env');
const { OAuth2Client } = require('google-auth-library');
const Otp = require('../models/otp.model');
const sendEmail = require('../utils/sendEmail');
const { cloudinary } = require('../config/cloudinary');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID');

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendRegisterOtp = async (email) => {
    email = email.toLowerCase();
    
    if (await User.isEmailTaken(email)) {
        throw { statusCode: 400, message: 'Email already taken' };
    }

    const otpCode = generateOtp();

    // Upsert OTP
    await Otp.findOneAndUpdate(
        { email },
        { otp: otpCode, createdAt: Date.now() },
        { upsert: true, new: true }
    );

    const html = `
    <div style="max-width:520px;margin:0 auto;font-family:'DM Sans',Arial,sans-serif;color:#1a1a1a;">
        <div style="background:#8B1A1A;padding:28px;text-align:center;">
            <h1 style="color:#ffffff;font-size:22px;margin:0;letter-spacing:1px;">NextEra</h1>
        </div>
        <div style="padding:32px 28px;background:#ffffff;border:1px solid #e5e5e5;">
            <h2 style="font-size:20px;margin:0 0 12px 0;">Verify Your Email</h2>
            <p style="font-size:14px;line-height:1.6;color:#555;">
                Thank you for starting your registration with NextEra! Please use the following One-Time Password (OTP) to verify your remote email address and finish creating your account.
            </p>
            <div style="text-align:center;margin:28px 0;">
                <span style="display:inline-block;padding:14px 36px;background:#f5f5f5;color:#8B1A1A;
                           border:2px dashed #8B1A1A;font-size:24px;font-weight:700;letter-spacing:4px;">
                    ${otpCode}
                </span>
            </div>
            <p style="font-size:13px;color:#888;line-height:1.5;text-align:center;">
                This code expires in <strong>5 minutes</strong>.
            </p>
            <p style="font-size:13px;color:#888;line-height:1.5;">
                If you did not request this, you can safely ignore this email.
            </p>
        </div>
        <div style="padding:16px;text-align:center;font-size:12px;color:#aaa;">
            &copy; NextEra Job Portal
        </div>
    </div>`;

    await sendEmail({
        to: email,
        subject: 'NextEra — Registration OTP Verification',
        html,
    });
};

const register = async (userData) => {
    if (userData.role === 'ADMIN') {
        throw { statusCode: 403, message: 'Admins cannot be registered publicly' };
    }
    
    userData.email = userData.email.toLowerCase();
    
    if (await User.isEmailTaken(userData.email)) {
        throw { statusCode: 400, message: 'Email already taken' };
    }

    const validOtp = await Otp.findOne({ email: userData.email, otp: userData.otp });
    
    if (!validOtp) {
        throw { statusCode: 400, message: 'Invalid or expired OTP.' };
    }

    userData.isEmailVerified = true;

    const user = await User.create(userData);
    
    // Delete OTP logically after successful consumption
    await Otp.deleteOne({ email: userData.email });

    const token = generateToken(user._id, user.role);
    return { user, token };
};

const login = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user || !(await user.isPasswordMatch(password))) {
        throw { statusCode: 401, message: 'Incorrect email or password' };
    }
    if (user.status === 'SUSPENDED') {
        throw { statusCode: 403, message: 'Your account is suspended' };
    }
    const token = generateToken(user._id, user.role);
    return { user, token };
};

const googleLogin = async (idToken, role = 'JOB_SEEKER') => {
    const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ 
        $or: [{ googleId }, { email }] 
    });

    if (user) {
        let needsSave = false;
        if (!user.googleId) {
            user.googleId = googleId;
            needsSave = true;
        }

        const isDefault = user.profilePicture?.includes('/defaults/default_avatar');
        const isExternal = !user.profilePicture || user.profilePicture.includes('googleusercontent.com');

        if ((isDefault || isExternal) && picture) {
            try {
                const uploadResult = await cloudinary.uploader.upload(picture, {
                    folder: 'ruralwork/profiles',
                    public_id: `user_${user._id}_google`,
                    overwrite: true,
                });
                user.profilePicture = uploadResult.secure_url;
                needsSave = true;
            } catch (err) {
                console.error('Failed to update Google profile picture to Cloudinary:', err.message);
            }
        }
        
        if (role === 'EMPLOYER' && user.role === 'JOB_SEEKER') {
            user.role = 'EMPLOYER';
            needsSave = true;
        }

        if (needsSave) {
            await user.save();
        }
    } else {
        const userObj = {
            name,
            email,
            role,
            googleId,
            isEmailVerified: true // Google emails are implicitly verified
        };

        const newUser = new User(userObj);

        if (picture) {
            try {
                const uploadResult = await cloudinary.uploader.upload(picture, {
                    folder: 'ruralwork/profiles',
                    public_id: `user_${newUser._id}_google`,
                    overwrite: true,
                });
                newUser.profilePicture = uploadResult.secure_url;
            } catch (err) {
                console.error('Failed to upload Google profile picture to Cloudinary:', err.message);
            }
        }

        user = await newUser.save();
    }

    if (user.status === 'SUSPENDED') {
        throw { statusCode: 403, message: 'Your account is suspended' };
    }

    const token = generateToken(user._id, user.role);
    return { user, token };
};

const getCurrentUser = async (user) => {
    return user;
};

const seedAdmin = async () => {
    const adminEmail = config.admin.email;
    const adminPassword = config.admin.password;

    if (!adminEmail || !adminPassword) {
        return;
    }

    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
        await User.create({
            name: 'System Admin',
            email: adminEmail,
            password: adminPassword,
            role: 'ADMIN',
            isEmailVerified: true
        });
    }
};

module.exports = {
    sendRegisterOtp,
    register,
    login,
    googleLogin,
    getCurrentUser,
    seedAdmin
};
