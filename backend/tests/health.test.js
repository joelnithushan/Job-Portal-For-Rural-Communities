const request = require('supertest');
const express = require('express');
const router = require('../src/routes/index');

const app = express();
app.use(express.json());
app.use('/api', router);

describe('Health Endpoints', () => {
    it('GET /api/health - should return 200 and success status', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBeDefined();
    });
});
