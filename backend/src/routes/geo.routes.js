const express = require('express');
const geoController = require('../controllers/geo.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Geo
 *   description: Geographic and location-based endpoints
 */

/**
 * @swagger
 * /api/geo/geocode:
 *   post:
 *     summary: Convert address string to geographic coordinates
 *     tags: [Geo]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [address]
 *             properties:
 *               address:
 *                 type: string
 *                 example: "Colombo, Sri Lanka"
 *     responses:
 *       200:
 *         description: Geocoding successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lat: { type: number, example: 6.9271 }
 *                 lng: { type: number, example: 79.8612 }
 */
router.post('/geocode', geoController.geocode);

module.exports = router;
