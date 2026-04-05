const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/user.model');
const Job = require('../src/models/job.model');
const Application = require('../src/models/application.model');
const applicationService = require('../src/services/application.service');

async function testEmail() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB.');
        
        const testEmailAddr = 'joelnithushan4@gmail.com';
        
        let user = await User.findOne({ email: testEmailAddr });
        if (!user) {
            user = await User.create({
                name: 'Joel Nithushan Test',
                email: testEmailAddr,
                password: 'Password@123',
                role: 'JOB_SEEKER',
                phone: '0771234567',
                district: 'Colombo',
                nic: '123456789V',
                bio: 'Test bio for email feature testing'
            });
            console.log('Test user created.');
        } else {
            user.phone = user.phone || '0771234567';
            user.district = user.district || 'Colombo';
            user.nic = user.nic || '123456789V';
            user.bio = user.bio || 'Test bio for email feature testing';
            await user.save();
            console.log('Test user updated with required profile fields.');
        }

        let employer = await User.findOne({ role: 'EMPLOYER' });
        if (!employer) {
            employer = await User.create({
                name: 'Test Employer Co',
                email: 'testemployer123@gmail.com',
                password: 'Password@123',
                role: 'EMPLOYER'
            });
            console.log('Test employer created.');
        }

        let job = await Job.findOne({ status: 'OPEN' });
        if (!job) {
            const Company = require('../src/models/company.model');
            let company = await Company.findOne({ ownerId: employer._id });
            if (!company) {
                company = await Company.create({
                    name: 'Test Employer Co',
                    ownerId: employer._id,
                    industry: 'Tech',
                    description: 'Test',
                    district: 'Colombo'
                });
            }

            job = await Job.create({
                title: 'Test Software Engineer Position',
                description: 'We are looking for a test engineer',
                requirements: ['React', 'Node.js'],
                employerId: employer._id,
                companyId: company._id,
                status: 'OPEN',
                location: { type: 'Point', coordinates: [79.8612, 6.9271] },
                jobType: 'FULL_TIME',
                cvRequired: false
            });
            console.log('Test job created.');
        }

        await Application.deleteOne({ jobId: job._id, seekerId: user._id });
        console.log('Deleted previous application (if any) to re-test.');
        
        console.log(`Applying for job: "${job.title}" as ${user.email}...`);
        const application = await applicationService.applyToJob(job._id, user._id, 'http://example.com/cv.pdf');
        console.log('✅ Application submitted. Confirmation email should be sent!');
        
        console.log('Waiting 3 seconds before testing status update email...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('Updating application status to ACCEPTED...');
        await applicationService.updateStatus(application._id, job.employerId.toString(), 'ACCEPTED', 'Impressive profile! We would like to proceed with your application.');
        console.log('✅ Status updated to ACCEPTED. Status update email should be sent!');
        
    } catch (e) {
        console.error('Error during test:', e);
    } finally {
        await mongoose.disconnect();
        console.log('Test script finished.');
    }
}

testEmail();
