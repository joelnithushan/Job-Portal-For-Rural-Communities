const User = require('../models/user.model');
const { generateToken } = require('../utils/jwt');
const config = require('../config/env');
const { OAuth2Client } = require('google-auth-library');

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
            if (!user.profilePicture && picture) {
                user.profilePicture = picture;
            }
            needsSave = true;
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
        user = await User.create({
            name,
            email,
            role,
            googleId,
            profilePicture: picture || null,
            isEmailVerified: true // Google emails are implicitly verified
        });
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
