const express = require('express');
const geoController = require('../controllers/geo.controller');

const router = express.Router();

router.post('/geocode', geoController.geocode);

module.exports = router;
