const request = require('supertest');
const app = require('../src/app');

// Supertest allows testing express routes without starting the web server.

describe('Authentication API', () => {
    
    // We register a dummy user to be used in login
    const jobSeeker = {
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'Password@123',
        role: 'JOB_SEEKER'
    };

    describe('POST /api/auth/register', () => {
        it('should successfully register a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(jobSeeker)
                .expect('Content-Type', /json/)
                .expect(201);
            
            expect(res.body).toHaveProperty('data');
            expect(res.body.data).toHaveProperty('user');
            expect(res.body.data).toHaveProperty('token');
            expect(res.body.data.user.email).toBe(jobSeeker.email);
        });

        it('should fail registration with an invalid email', async () => {
            const invalidUser = { ...jobSeeker, email: 'not-an-email' };
            const res = await request(app)
                .post('/api/auth/register')
                .send(invalidUser)
                .expect(400);
            
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBeDefined();
        });
    });

    describe('POST /api/auth/login', () => {
        // Register the user first before logging in
        beforeEach(async () => {
            await request(app)
                .post('/api/auth/register')
                .send(jobSeeker);
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
