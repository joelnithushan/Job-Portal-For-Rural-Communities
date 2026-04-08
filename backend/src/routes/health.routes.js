const express = require('express');
const healthController = require('../controllers/health.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: System health check endpoints
 */

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Check if the API service is healthy and connected to DB
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "UP" }
 *                 uptime: { type: number, example: 1234.56 }
 *                 timestamp: { type: string, example: "2024-03-20T10:00:00Z" }
 */
router.get('/', healthController.getHealth);

module.exports = router;
