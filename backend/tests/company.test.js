const request = require('supertest');
const app = require('../src/app');

describe('Company Endpoints', () => {
    let token, employerId, companyId;
    const employer = {
        name: 'Employer Tester',
        email: 'employer@test.com',
        password: 'Password@123',
        role: 'EMPLOYER'
    };

    beforeEach(async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(employer);
        token = res.body.data.token;
        employerId = res.body.data.user._id;
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
        it('should return the employer\'s company', async () => {
            // Setup: Create company first
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
            // Setup
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
            // Setup: Create and artificially verify company 
            const compRes = await request(app)
                .post('/api/companies')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    businessName: 'Old Name',
                    district: 'Kandy',
                    contactPhone: '0712345679'
                });
            const Company = require('../src/models/company.model');
            await Company.findByIdAndUpdate(compRes.body.data.company._id, { verificationStatus: 'VERIFIED' });

            // Update
            const updateRes = await request(app)
                .patch('/api/companies/me')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    businessName: 'New Legal Name'
                })
                .expect(200);
            
            expect(updateRes.body.success).toBe(true);
            expect(updateRes.body.data.company.businessName).toBe('New Legal Name');
            expect(updateRes.body.data.company.verificationStatus).toBe('PENDING');
        });
    });
});
