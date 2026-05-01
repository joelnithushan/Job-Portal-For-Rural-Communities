const { cloudinary } = require('../config/cloudinary');
const User = require('../models/user.model');
const Job = require('../models/job.model');
const Application = require('../models/application.model');
const Company = require('../models/company.model');
const Notification = require('../models/notification.model');
const { successResponse, errorResponse } = require('../utils/response');
const { validateSriLankanNIC } = require('../utils/nicValidation');

const VALID_DISTRICTS = [
    'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
    'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 'Kandy',
    'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale',
    'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
    'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya',
];

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

const updateProfile = async (req, res) => {
    try {
        const { name, phone, district, bio, nic, address } = req.body;
        const errors = [];

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
        let parsedNicInfo = null;
        if (nic !== undefined && nic !== null && nic !== '') {
            const trimmedNic = String(nic).trim();
            parsedNicInfo = validateSriLankanNIC(trimmedNic);
            if (!parsedNicInfo) {
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
        if (address !== undefined && address !== null) {
            if (String(address).length > 255) {
                errors.push('Address cannot exceed 255 characters.');
            }
        }

        if (errors.length > 0) {
            return errorResponse(res, errors.join(' '), 400);
        }

        const updates = {};
        if (name !== undefined) updates.name = String(name).trim();
        if (phone !== undefined) updates.phone = phone ? String(phone).trim() : null;
        if (district !== undefined) updates.district = district || null;
        if (bio !== undefined) updates.bio = bio ? String(bio).trim() : null;
        if (address !== undefined) updates.address = address ? String(address).trim() : null;
        if (nic !== undefined) {
            updates.nic = nic ? String(nic).trim() : null;
            if (parsedNicInfo) {
                updates.dob = parsedNicInfo.dob;
                updates.gender = parsedNicInfo.gender;
            } else if (!nic) {
                updates.dob = null;
                updates.gender = null;
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        return successResponse(res, 'Profile updated successfully.', { user });
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return errorResponse(res, `This ${field} is already in use by another account.`, 400);
        }
        return errorResponse(res, 'Failed to update profile', 500);
    }
};

const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return errorResponse(res, 'No image file provided.', 400);
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

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

        user.profilePicture = req.file.path;
        await user.save();

        return successResponse(res, 'Profile picture updated.', {
            profilePicture: req.file.path,
        });
    } catch (error) {
        return errorResponse(res, 'Failed to upload profile picture', 500);
    }
};

const deleteProfilePicture = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        const defaultAvatar = 'https://res.cloudinary.com/dedoxaqug/image/upload/v1775924857/ruralwork/defaults/default_avatar.png';
        const isAlreadyDefault = !user.profilePicture || user.profilePicture.includes('/defaults/default_avatar');

        if (isAlreadyDefault) {
            return res.status(200).json({ success: true, message: 'Profile picture is already set to default.', user });
        }

        try {
            const oldPublicId = user.profilePicture
                .split('/').slice(-1)[0].split('.')[0];
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

const deleteAccount = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        if (user.role === 'ADMIN') {
            return errorResponse(res, 'Administrator accounts cannot be deleted directly from the profile. Contact system support if this is required.', 403);
        }

        if (user.role === 'JOB_SEEKER') {
            await Application.deleteMany({ seekerId: userId });
            
        } else if (user.role === 'EMPLOYER') {
            const employerJobs = await Job.find({ employerId: userId });
            const jobIds = employerJobs.map(job => job._id);

            if (jobIds.length > 0) {
                await Application.deleteMany({ jobId: { $in: jobIds } });
            }

            await Job.deleteMany({ employerId: userId });

            await Company.findOneAndDelete({ employerUserId: userId });
        }

        await Notification.deleteMany({ userId: userId });

        const defaultAvatar = 'https://res.cloudinary.com/dedoxaqug/image/upload/v1775924857/ruralwork/defaults/default_avatar.png';
        if (user.profilePicture && !user.profilePicture.includes('/defaults/default_avatar')) {
            try {
                const oldPublicId = user.profilePicture.split('/').slice(-1)[0].split('.')[0];
                if (oldPublicId && (oldPublicId.startsWith('user_') || user.profilePicture.includes('/profiles/'))) {
                    await cloudinary.uploader.destroy(`ruralwork/profiles/${oldPublicId}`);
                }
            } catch (err) {
                console.error('Failed to delete avatar from Cloudinary on Account Delete:', err.message);
            }
        }

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
