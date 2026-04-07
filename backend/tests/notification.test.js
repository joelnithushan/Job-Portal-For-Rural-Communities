const request = require('supertest');
const app = require('../src/app');

describe('Notification Endpoints', () => {
    let token;
    const user = {
        name: 'Notification Tester',
        email: 'notif@test.com',
        password: 'Password@123',
        role: 'JOB_SEEKER'
    };

    beforeEach(async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(user);
        token = res.body.data.token;
    });

    describe('GET /api/notifications/me', () => {
        it('should return user notifications', async () => {
            const res = await request(app)
                .get('/api/notifications/me')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
            
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('notifications');
            expect(Array.isArray(res.body.data.notifications)).toBe(true);
        });
    });

    describe('PATCH /api/notifications/read-all', () => {
        it('should mark all notifications as read', async () => {
            const res = await request(app)
                .patch('/api/notifications/read-all')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
            
            expect(res.body.success).toBe(true);
        });
    });
});
