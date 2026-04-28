const request = require('supertest');
const app = require('../src/app');
const Otp = require('../src/models/otp.model');

describe('Authentication API', () => {
    const jobSeeker = {
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'Password@123',
        role: 'JOB_SEEKER'
    };

    describe('POST /api/auth/register', () => {
        it('should successfully register a new user when a valid OTP exists', async () => {
            const otp = '123456';
            await Otp.create({ email: jobSeeker.email, otp });

            const res = await request(app)
                .post('/api/auth/register')
                .send({ ...jobSeeker, otp })
                .expect('Content-Type', /json/)
                .expect(201);

            expect(res.body).toHaveProperty('data');
            expect(res.body.data).toHaveProperty('user');
            expect(res.body.data).toHaveProperty('token');
            expect(res.body.data.user.email).toBe(jobSeeker.email);
        });

        it('should fail registration with an invalid email', async () => {
            const invalidUser = { ...jobSeeker, email: 'not-an-email', otp: '000000' };
            const res = await request(app)
                .post('/api/auth/register')
                .send(invalidUser)
                .expect(400);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toBeDefined();
        });

        it('should fail registration when OTP is missing or invalid', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ ...jobSeeker, otp: '999999' })
                .expect(400);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/otp/i);
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            const otp = '123456';
            await Otp.create({ email: jobSeeker.email, otp });
            await request(app)
                .post('/api/auth/register')
                .send({ ...jobSeeker, otp });
        });

        it('should successfully log in and return tokens', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: jobSeeker.email,
                    password: jobSeeker.password
                })
                .expect(200);

            expect(res.body).toHaveProperty('data');
            expect(res.body.data).toHaveProperty('user');
            expect(res.body.data).toHaveProperty('token');
            expect(res.body.data.user.email).toBe(jobSeeker.email);
        });

        it('should fail with incorrect password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: jobSeeker.email,
                    password: 'WrongPassword@123'
                })
                .expect(401);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Incorrect email');
        });
    });
});
