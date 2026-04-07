const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user.model');
const Job = require('../src/models/job.model');
const Company = require('../src/models/company.model');
const { generateToken } = require('../src/utils/jwt');

describe('Application Endpoints', () => {
    let seekerToken, employerToken, jobId, seekerId, employerId;
    
    beforeEach(async () => {
        await User.deleteMany({});
        await Job.deleteMany({});
        await Company.deleteMany({});

        // Create Employer
        const employer = await User.create({
            name: 'Employer',
            email: 'emp@test.com',
            password: 'Password@123',
            role: 'EMPLOYER'
        });
        employerId = employer._id;
        employerToken = generateToken(employerId.toString(), 'EMPLOYER');

        // Create Seeker with COMPLETE profile
        const seeker = await User.create({
            name: 'Seeker',
            email: 'seeker@test.com',
            password: 'Password@123',
            role: 'JOB_SEEKER',
            phone: '0712345678',
            district: 'Colombo',
            nic: '199012345678',
            bio: 'I am a hard worker.'
        });
        seekerId = seeker._id;
        seekerToken = generateToken(seekerId.toString(), 'JOB_SEEKER');

        // Create Company
        await Company.create({
            businessName: 'Co',
            district: 'Colombo',
            town: 'Pettah',
            contactPhone: '0712345678',
            employerUserId: employerId
        });

        // Create Job
        const job = await Job.create({
            title: 'Job',
            description: 'Desc',
            district: 'Colombo',
            town: 'Pettah',
            category: 'Retail',
            jobType: 'FULL_TIME',
            contactPhone: '0712345678',
            employerId: employerId
        });
        jobId = job._id.toString();
    });

    it('should successfully apply for a job', async () => {
        const res = await request(app)
            .post('/api/applications')
            .set('Authorization', `Bearer ${seekerToken}`)
            .send({ jobId })
            .expect(201);
        
        expect(res.body.success).toBe(true);
        expect(res.body.data.application).toBeDefined();
    });

    it('should fail if seeker tries to apply for their own job', async () => {
        // Change the employer's role to JOB_SEEKER in the DB so they can pass the middleware,
        // and complete their profile so they COULD apply.
        const emp = await User.findById(employerId);
        emp.role = 'JOB_SEEKER';
        emp.phone = '0712345679'; // Use unique phone number to avoid duplicate key error
        emp.district = 'Colombo';
        emp.nic = '199012345679'; // Unique NIC
        emp.bio = 'I am a hard worker.';
        await emp.save();
        
        const res = await request(app)
            .post('/api/applications')
            .set('Authorization', `Bearer ${employerToken}`)
            .send({ jobId });
        
        // Cannot apply to own job
        expect(res.status).toBe(400); 
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('apply to your own job');
    });

    it('should fail if the employer is suspended', async () => {
        // Suspend the employer
        const emp = await User.findById(employerId);
        emp.status = 'SUSPENDED';
        await emp.save();
        
        const res = await request(app)
            .post('/api/applications')
            .set('Authorization', `Bearer ${seekerToken}`)
            .send({ jobId });
        
        // Cannot apply
        expect(res.status).toBe(400); // Again, thrown as generic error
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('currently unavailable');
    });
});
