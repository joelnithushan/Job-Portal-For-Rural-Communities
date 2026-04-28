const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user.model');
const { generateToken } = require('../src/utils/jwt');

describe('Profile Endpoints', () => {
    let token;
    const userData = {
        name: 'Profile Tester',
        email: 'profile@test.com',
        password: 'Password@123',
        role: 'JOB_SEEKER'
    };

    beforeEach(async () => {
        const user = await User.create(userData);
        token = generateToken(user._id.toString(), user.role);
    });

    describe('GET /api/profile/me', () => {
        it('should return the user profile', async () => {
            const res = await request(app)
                .get('/api/profile/me')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data.user.email).toBe(userData.email);
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
