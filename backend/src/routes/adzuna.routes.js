const express = require('express');
const { searchJobs } = require('../controllers/adzuna.controller');
const auth = require('../middlewares/auth.middleware');

const router = express.Router();

// All adzuna routes protected
router.use(auth);

router.get('/jobs', searchJobs);

module.exports = router;
