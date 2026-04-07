const request = require('supertest');
const app = require('../src/app');

describe('Profile Endpoints', () => {
    let token;
    const user = {
        name: 'Profile Tester',
        email: 'profile@test.com',
        password: 'Password@123',
        role: 'JOB_SEEKER'
    };

    beforeEach(async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(user);
        token = res.body.data.token;
    });

    describe('GET /api/profile/me', () => {
        it('should return the user profile', async () => {
            const res = await request(app)
                .get('/api/profile/me')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
            
            expect(res.body.success).toBe(true);
            expect(res.body.data.user.email).toBe(user.email);
        });

        it('should return 401 if not authenticated', async () => {
            await request(app)
                .get('/api/profile/me')
                .expect(401);
        });
    });

    describe('PATCH /api/profile/me', () => {
        it('should update the user profile', async () => {
            const res = await request(app)
                .patch('/api/profile/me')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Updated Name' })
                .expect(200);
            
            expect(res.body.success).toBe(true);
            expect(res.body.data.user.name).toBe('Updated Name');
        });
    });
});
