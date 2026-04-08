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
/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile management endpoints
 */

/**
 * @swagger
 * /api/profile/me:
 *   get:
 *     summary: Get current logged-in user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/me', auth, getProfile);

/**
 * @swagger
 * /api/profile/me:
 *   patch:
 *     summary: Update current logged-in user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.patch('/me', auth, updateProfile);

/**
 * @swagger
 * /api/profile/me:
 *   delete:
 *     summary: Delete current logged-in user account
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account successfully deleted
 */
router.delete('/me', auth, deleteAccount);

/**
 * @swagger
 * /api/profile/me/picture:
 *   post:
 *     summary: Upload profile picture explicitly
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Picture uploaded successfully
 */
router.post('/me/picture', auth, upload.single('profilePicture'), uploadProfilePicture);

/**
 * @swagger
 * /api/profile/me/picture:
 *   delete:
 *     summary: Delete current profile picture
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Picture deleted successfully
 */
router.delete('/me/picture', auth, deleteProfilePicture);

module.exports = router;
