const User = require('../models/user.model');
const { generateToken } = require('../utils/jwt');
const config = require('../config/env');
const { OAuth2Client } = require('google-auth-library');
const { cloudinary } = require('../config/cloudinary');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID');

const register = async (userData) => {
    if (userData.role === 'ADMIN') {
        throw { statusCode: 403, message: 'Admins cannot be registered publicly' };
    }
    if (await User.isEmailTaken(userData.email)) {
        throw { statusCode: 400, message: 'Email already taken' };
    }
    const user = await User.create(userData);
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
    // 1. Verify Google token
    const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // 2. Check if user already exists (by googleId or email)
    let user = await User.findOne({ 
        $or: [{ googleId }, { email }] 
    });

    if (user) {
        let needsSave = false;
        // If user exists but doesn't have googleId linked, link it now
        if (!user.googleId) {
            user.googleId = googleId;
            needsSave = true;
        }

        // If user already has a default/missing/external picture, sync with fresh Google sync to Cloudinary
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
        
        // Upgrade role if they use the Employer SSO flow
        if (role === 'EMPLOYER' && user.role === 'JOB_SEEKER') {
            user.role = 'EMPLOYER';
            needsSave = true;
        }

        if (needsSave) {
            await user.save();
        }
    } else {
        // 3. Create new user if they don't exist
        const userObj = {
            name,
            email,
            role,
            googleId,
            isEmailVerified: true // Google emails are implicitly verified
        };

        const newUser = new User(userObj);

        // Upload Google profile picture to Cloudinary if available
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
                // default will be used by the model
            }
        }

        user = await newUser.save();
    }

    if (user.status === 'SUSPENDED') {
        throw { statusCode: 403, message: 'Your account is suspended' };
    }

    // 4. Generate app JWT
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
    register,
    login,
    googleLogin,
    getCurrentUser,
    seedAdmin
};
