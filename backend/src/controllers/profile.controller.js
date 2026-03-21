const { cloudinary } = require('../config/cloudinary');
const User = require('../models/user.model');
const { successResponse, errorResponse } = require('../utils/response');

// Valid Sri Lanka districts
const VALID_DISTRICTS = [
    'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
    'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 'Kandy',
    'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale',
    'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
    'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya',
];

// GET /profile/me
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }
        return successResponse(res, 'Profile fetched.', { user });
    } catch (error) {
        return errorResponse(res, 'Failed to fetch profile', 500);
    }
};

// PATCH /profile/me
const updateProfile = async (req, res) => {
    try {
        const { name, phone, district, bio } = req.body;
        const errors = [];

        // Validation
        if (name !== undefined) {
            const trimmed = String(name).trim();
            if (trimmed.length < 2) errors.push('Name must be at least 2 characters.');
            if (trimmed.length > 60) errors.push('Name must be at most 60 characters.');
        }
        if (phone !== undefined && phone !== null && phone !== '') {
            if (!/^[0-9+\-\s()]{7,20}$/.test(phone)) {
                errors.push('Enter a valid phone number (7–20 digits).');
            }
        }
        if (district !== undefined && district !== null && district !== '') {
            if (!VALID_DISTRICTS.includes(district)) {
                errors.push('Select a valid district.');
            }
        }
        if (bio !== undefined && bio !== null) {
            if (String(bio).length > 500) {
                errors.push('Bio cannot exceed 500 characters.');
            }
        }

        if (errors.length > 0) {
            return errorResponse(res, errors.join(' '), 400);
        }

        // Build update object — only provided fields
        const updates = {};
        if (name !== undefined) updates.name = String(name).trim();
        if (phone !== undefined) updates.phone = phone ? String(phone).trim() : null;
        if (district !== undefined) updates.district = district || null;
        if (bio !== undefined) updates.bio = bio ? String(bio).trim() : null;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        return successResponse(res, 'Profile updated successfully.', { user });
    } catch (error) {
        return errorResponse(res, 'Failed to update profile', 500);
    }
};

// POST /profile/me/picture
const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return errorResponse(res, 'No image file provided.', 400);
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        // Delete old image from Cloudinary if exists
        if (user.profilePicture) {
            try {
                const oldPublicId = user.profilePicture
                    .split('/').slice(-1)[0].split('.')[0];
                if (oldPublicId && oldPublicId.startsWith('user_')) {
                    await cloudinary.uploader.destroy(`ruralwork/profiles/${oldPublicId}`);
                }
            } catch (err) {
                console.error('Failed to delete old profile picture:', err.message);
            }
        }

        // Update user with new picture URL
        user.profilePicture = req.file.path;
        await user.save();

        return successResponse(res, 'Profile picture updated.', {
            profilePicture: req.file.path,
        });
    } catch (error) {
        return errorResponse(res, 'Failed to upload profile picture', 500);
    }
};

// DELETE /profile/me/picture
const deleteProfilePicture = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        if (!user.profilePicture) {
            return errorResponse(res, 'No profile picture to remove.', 400);
        }

        // Delete from Cloudinary
        try {
            const oldPublicId = user.profilePicture
                .split('/').slice(-1)[0].split('.')[0];
            if (oldPublicId && oldPublicId.startsWith('user_')) {
                await cloudinary.uploader.destroy(`ruralwork/profiles/${oldPublicId}`);
            }
        } catch (err) {
            console.error('Failed to delete from Cloudinary:', err.message);
        }

        user.profilePicture = null;
        await user.save();

        return successResponse(res, 'Profile picture removed.', {
            profilePicture: null,
        });
    } catch (error) {
        return errorResponse(res, 'Failed to remove profile picture', 500);
    }
};

module.exports = {
    getProfile,
    updateProfile,
    uploadProfilePicture,
    deleteProfilePicture,
};
