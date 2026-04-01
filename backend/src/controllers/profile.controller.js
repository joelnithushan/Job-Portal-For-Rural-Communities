const { cloudinary } = require('../config/cloudinary');
const User = require('../models/user.model');
const Job = require('../models/job.model');
const Application = require('../models/application.model');
const Company = require('../models/company.model');
const Notification = require('../models/notification.model');
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
        const { name, phone, district, bio, nic } = req.body;
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
        if (nic !== undefined && nic !== null && nic !== '') {
            if (!/^(?:\d{9}[vVxX]|\d{12})$/.test(String(nic).trim())) {
                errors.push('Enter a valid Sri Lankan NIC.');
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
        if (nic !== undefined) updates.nic = nic ? String(nic).trim() : null;

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

        const defaultAvatar = 'https://res.cloudinary.com/dedoxaqug/image/upload/v1774887841/ruralwork/defaults/default_avatar.png';
        const isAlreadyDefault = user.profilePicture === defaultAvatar;

        if (isAlreadyDefault || !user.profilePicture) {
            return res.status(200).json({ success: true, message: 'Profile picture is already set to default.', user });
        }

        // Delete from Cloudinary if it's a user-uploaded image
        try {
            const oldPublicId = user.profilePicture
                .split('/').slice(-1)[0].split('.')[0];
            // Only destroy if it belongs to the user-uploaded folder/prefix
            if (oldPublicId && (oldPublicId.startsWith('user_') || user.profilePicture.includes('/profiles/'))) {
                await cloudinary.uploader.destroy(`ruralwork/profiles/${oldPublicId}`);
            }
        } catch (err) {
            console.error('Failed to delete from Cloudinary:', err.message);
        }

        user.profilePicture = defaultAvatar;
        await user.save();

        return successResponse(res, 'Profile picture removed (reset to default).', {
            profilePicture: defaultAvatar,
        });
    } catch (error) {
        return errorResponse(res, 'Failed to remove profile picture', 500);
    }
};

// DELETE /profile/me
const deleteAccount = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        // ROLE-SPECIFIC CASCADE DELETION
        if (user.role === 'JOB_SEEKER') {
            // Delete all applications made by the seeker
            await Application.deleteMany({ seekerId: userId });
            
        } else if (user.role === 'EMPLOYER') {
            // Find all jobs posted by the employer
            const employerJobs = await Job.find({ employerId: userId });
            const jobIds = employerJobs.map(job => job._id);

            // Delete all applications linked to those jobs
            if (jobIds.length > 0) {
                await Application.deleteMany({ jobId: { $in: jobIds } });
            }

            // Delete actual jobs
            await Job.deleteMany({ employerId: userId });

            // Delete employer company profile
            await Company.findOneAndDelete({ employerId: userId });
        }

        // SHARED DELETION LOGIC
        // 1. Terminate all Notifications belonging to this user
        await Notification.deleteMany({ userId: userId });

        // 2. Eradicate Cloudinary Avatar (if not default and not Google external)
        const defaultAvatar = 'https://res.cloudinary.com/dedoxaqug/image/upload/v1774887841/ruralwork/defaults/default_avatar.png';
        if (user.profilePicture && user.profilePicture !== defaultAvatar) {
            try {
                const oldPublicId = user.profilePicture.split('/').slice(-1)[0].split('.')[0];
                if (oldPublicId && (oldPublicId.startsWith('user_') || user.profilePicture.includes('/profiles/'))) {
                    await cloudinary.uploader.destroy(`ruralwork/profiles/${oldPublicId}`);
                }
            } catch (err) {
                console.error('Failed to delete avatar from Cloudinary on Account Delete:', err.message);
            }
        }

        // 3. Purge the User Record
        await User.findByIdAndDelete(userId);

        return successResponse(res, 'Account and all associated data permanently deleted.', null, 200);

    } catch (error) {
        console.error('Account Deletion Error:', error);
        return errorResponse(res, 'Failed to permanently delete account', 500);
    }
};

module.exports = {
    getProfile,
    updateProfile,
    uploadProfilePicture,
    deleteProfilePicture,
    deleteAccount,
};
