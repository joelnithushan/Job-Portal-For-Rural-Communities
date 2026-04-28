const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user.model');
const { generateToken } = require('../src/utils/jwt');

describe('Admin Endpoints', () => {
    let adminToken, adminId;
    
    beforeEach(async () => {
        await User.deleteMany({});
        const admin = await User.create({
            name: 'Admin',
            email: 'admin@test.com',
            password: 'Password@123',
            role: 'ADMIN',
            phone: '0710000001'
        });
        adminId = admin._id;
        adminToken = generateToken(admin._id.toString(), 'ADMIN');
    });

    describe('GET /api/admin/users', () => {
        it('should fail if user is not an admin', async () => {
             const seeker = await User.create({
                 name: 'Seeker',
                 email: 'seeker@test.com',
                 password: 'Password@123',
                 role: 'JOB_SEEKER',
                 phone: '0710000002'
             });
             const seekerToken = generateToken(seeker._id.toString(), 'JOB_SEEKER');

             const res = await request(app)
                 .get('/api/admin/users')
                 .set('Authorization', `Bearer ${seekerToken}`);
             
             expect(res.status).toBe(403);
        });

        it('should succeed if user is an admin', async () => {
             const res = await request(app)
                 .get('/api/admin/users')
                 .set('Authorization', `Bearer ${adminToken}`);
             
             expect(res.status).toBe(200);
             expect(res.body.success).toBe(true);
        });
    });
});
