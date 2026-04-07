const request = require('supertest');
const app = require('../src/app');

describe('Geo Endpoints', () => {
    describe('POST /api/geo/geocode', () => {
        it('should successfully geocode a district', async () => {
            const res = await request(app)
                .post('/api/geo/geocode')
                .send({ district: 'Colombo' })
                .expect(200);
            
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('lat');
            expect(res.body.data).toHaveProperty('lng');
        });

        it('should return 400 if district is missing', async () => {
            const res = await request(app)
                .post('/api/geo/geocode')
                .send({})
                .expect(400);
            
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('district is required');
        });
    });
});
