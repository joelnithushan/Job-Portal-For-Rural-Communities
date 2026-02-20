const express = require('express');
const adminController = require('../controllers/admin.controller');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

const router = express.Router();

router.use(auth);
router.use(requireRole('ADMIN'));

router.get('/users', adminController.getAllUsers);

module.exports = router;
