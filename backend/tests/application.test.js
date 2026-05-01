const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user.model');
const Job = require('../src/models/job.model');
const Company = require('../src/models/company.model');
const Application = require('../src/models/application.model');
const sendSms = require('../src/utils/sendSms');
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

    describe('PATCH /api/applications/:id/status', () => {
        let applicationId;

        beforeEach(async () => {
            const application = await Application.create({
                jobId,
                seekerId,
                employerId,
                status: 'APPLIED'
            });
            applicationId = application._id.toString();
        });

        it('triggers an SMS to the seeker when status is set to ACCEPTED', async () => {
            const res = await request(app)
                .patch(`/api/applications/${applicationId}/status`)
                .set('Authorization', `Bearer ${employerToken}`)
                .send({ status: 'ACCEPTED' })
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(sendSms).toHaveBeenCalledTimes(1);
            expect(sendSms).toHaveBeenCalledWith(expect.objectContaining({
                to: '0712345678',
                body: expect.stringContaining('ACCEPTED')
            }));
        });

        it('triggers an SMS to the seeker when status is set to REJECTED', async () => {
            await request(app)
                .patch(`/api/applications/${applicationId}/status`)
                .set('Authorization', `Bearer ${employerToken}`)
                .send({ status: 'REJECTED' })
                .expect(200);

            expect(sendSms).toHaveBeenCalledTimes(1);
            expect(sendSms).toHaveBeenCalledWith(expect.objectContaining({
                to: '0712345678',
                body: expect.stringContaining('REJECTED')
            }));
        });

        it('does not send an SMS on ACCEPTED if the seeker has no phone', async () => {
            await User.findByIdAndUpdate(seekerId, { $unset: { phone: '' } });

            await request(app)
                .patch(`/api/applications/${applicationId}/status`)
                .set('Authorization', `Bearer ${employerToken}`)
                .send({ status: 'ACCEPTED' })
                .expect(200);

            expect(sendSms).not.toHaveBeenCalled();
        });

        it('rejects illegal backwards transitions', async () => {
            await Application.findByIdAndUpdate(applicationId, { status: 'ACCEPTED' });

            const res = await request(app)
                .patch(`/api/applications/${applicationId}/status`)
                .set('Authorization', `Bearer ${employerToken}`)
                .send({ status: 'APPLIED' })
                .expect(400);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/Cannot change status/i);
        });
    });
});
