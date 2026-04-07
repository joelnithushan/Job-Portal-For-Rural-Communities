const request = require('supertest');
const app = require('../src/app');

// Important Note: we mock auth middlewares here to avoid deep dependency testing.
// However, since we use MongoMemoryServer, we can also test natively. We'll do it natively.

describe('Job APIs', () => {

    describe('GET /api/jobs', () => {
        it('should fetch paginated jobs successfully', async () => {
            const res = await request(app)
                .get('/api/jobs?limit=5&page=1')
                .expect(200);
            
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body).toHaveProperty('totalPages');
        });
    });

    describe('GET /api/jobs/:id', () => {
        it('should return 400 for an invalid Mongo ID format', async () => {
            const res = await request(app)
                .get('/api/jobs/invalid-format-id')
                .expect(400);
            
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('fails to match the required pattern');
        });
    });

});
