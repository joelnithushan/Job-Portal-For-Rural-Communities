const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user.model');
const Company = require('../src/models/company.model');
const { generateToken } = require('../src/utils/jwt');

describe('Company Endpoints', () => {
    let token, employerId;
    const employerData = {
        name: 'Employer Tester',
        email: 'employer@test.com',
        password: 'Password@123',
        role: 'EMPLOYER'
    };

    beforeEach(async () => {
        const employer = await User.create(employerData);
        employerId = employer._id;
        token = generateToken(employer._id.toString(), employer.role);
    });

    describe('POST /api/companies', () => {
        it('should successfully create a company profile', async () => {
            const res = await request(app)
                .post('/api/companies')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    businessName: 'Test Company',
                    district: 'Colombo',
                    contactPhone: '0712345678'
                })
                .expect(201);

            expect(res.body.success).toBe(true);
            expect(res.body.data.company.businessName).toBe('Test Company');
        });
    });

    describe('GET /api/companies/me', () => {
        it("should return the employer's company", async () => {
            await request(app)
                .post('/api/companies')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    businessName: 'My Company',
                    district: 'Kandy',
                    contactPhone: '0712345679'
                });

            const res = await request(app)
                .get('/api/companies/me')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data.company.businessName).toBe('My Company');
        });
    });

    describe('GET /api/companies/:id', () => {
        it('should return a company by ID', async () => {
            const compRes = await request(app)
                .post('/api/companies')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    businessName: 'Specific Company',
                    district: 'Galle',
                    contactPhone: '0712345670'
                });
            const id = compRes.body.data.company._id;

            const res = await request(app)
                .get(`/api/companies/${id}`)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data.company.businessName).toBe('Specific Company');
        });
    });

    describe('PATCH /api/companies/me', () => {
        it('should reset verificationStatus to PENDING if businessName is updated', async () => {
            const compRes = await request(app)
                .post('/api/companies')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    businessName: 'Old Name',
                    district: 'Kandy',
                    contactPhone: '0712345679'
                });
            await Company.findByIdAndUpdate(compRes.body.data.company._id, { verificationStatus: 'VERIFIED' });

            const updateRes = await request(app)
                .patch('/api/companies/me')
                .set('Authorization', `Bearer ${token}`)
                .send({ businessName: 'New Legal Name' })
                .expect(200);

            expect(updateRes.body.success).toBe(true);
            expect(updateRes.body.data.company.businessName).toBe('New Legal Name');
            expect(updateRes.body.data.company.verificationStatus).toBe('PENDING');
        });
    });
});
