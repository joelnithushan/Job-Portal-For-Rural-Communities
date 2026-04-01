const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const { upload } = require('../config/cloudinary');
const {
    getProfile,
    updateProfile,
    uploadProfilePicture,
    deleteProfilePicture,
    deleteAccount,
} = require('../controllers/profile.controller');

router.get('/me', auth, getProfile);
router.patch('/me', auth, updateProfile);
router.delete('/me', auth, deleteAccount);
router.post('/me/picture', auth, upload.single('profilePicture'), uploadProfilePicture);
router.delete('/me/picture', auth, deleteProfilePicture);

module.exports = router;
