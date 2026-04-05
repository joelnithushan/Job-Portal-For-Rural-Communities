const express = require('express');
const { searchJobs } = require('../controllers/jooble.controller');
const auth = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(auth);
router.get('/jobs', searchJobs);

module.exports = router;
