const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/user.model');
const Job = require('./src/models/job.model');
const Application = require('./src/models/application.model');
const Notification = require('./src/models/notification.model');
const jobService = require('./src/services/job.service');
const applicationService = require('./src/services/application.service');

const sleep = ms => new Promise(r => setTimeout(r, ms));

const sampleJobsData = [
    { title: 'Machine Operator', description: 'Urgently looking for an experienced Juki machine operator for our new production line.', category: 'Garment', jobType: 'FULL_TIME', salaryMin: 45000, salaryMax: 60000 },
    { title: 'Packing Supervisor', description: 'Seeking a supervisor to manage the packing division and ensure quality control.', category: 'Garment', jobType: 'FULL_TIME', salaryMin: 50000, salaryMax: 70000 },
    { title: 'Site Supervisor', description: 'Experienced site supervisor required for a housing project.', category: 'Construction', jobType: 'CONTRACT', salaryMin: 80000, salaryMax: 120000 },
    { title: 'Mason / Builder', description: 'Need skilled masons for commercial building construction.', category: 'Construction', jobType: 'FULL_TIME', salaryMin: 60000, salaryMax: 85000 },
    { title: 'Supermarket Cashier', description: 'Friendly cashier needed for our Peradeniya branch. Training provided.', category: 'Retail', jobType: 'FULL_TIME', salaryMin: 35000, salaryMax: 45000 },
    { title: 'Store Keeper', description: 'Responsible for managing inventory and stock at the warehouse.', category: 'Retail', jobType: 'FULL_TIME', salaryMin: 40000, salaryMax: 55000 },
    { title: 'Delivery Rider', description: 'Deliver packages securely and efficiently within Kurunegala district. Must have own bike.', category: 'Logistics', jobType: 'PART_TIME', salaryMin: 30000, salaryMax: 50000 },
    { title: 'Logistics Coordinator', description: 'Coordinate delivery schedules and manage rider fleets.', category: 'Logistics', jobType: 'FULL_TIME', salaryMin: 55000, salaryMax: 75000 },
    { title: 'Tractor Driver', description: 'Experienced tractor driver needed for extensive farm plowing and harvesting.', category: 'Agriculture', jobType: 'FULL_TIME', salaryMin: 45000, salaryMax: 60000 },
    { title: 'Farm Field Officer', description: 'Oversee crop growth and manage daily farm laborers.', category: 'Agriculture', jobType: 'FULL_TIME', salaryMin: 50000, salaryMax: 65000 },
    { title: 'Heavy Vehicle Helper', description: 'Helper for lorry transport across districts.', category: 'Logistics', jobType: 'FULL_TIME', salaryMin: 40000, salaryMax: 50000 },
    { title: 'English Teacher', description: 'Looking for an experienced English teacher for evening classes.', category: 'Education', jobType: 'PART_TIME', salaryMin: 25000, salaryMax: 40000 },
    { title: 'Electrician', description: 'Certified electrician for commercial building maintenance.', category: 'Construction', jobType: 'CONTRACT', salaryMin: 60000, salaryMax: 80000 },
    { title: 'Graphic Designer', description: 'Creative designer for social media banners.', category: 'IT', jobType: 'PART_TIME', salaryMin: 30000, salaryMax: 45000 },
    { title: 'Tea Plucker', description: 'Experienced tea pluckers for high yield estate.', category: 'Agriculture', jobType: 'FULL_TIME', salaryMin: 35000, salaryMax: 45000 },
    { title: 'Hotel Receptionist', description: 'Friendly face for our front desk.', category: 'Hospitality', jobType: 'FULL_TIME', salaryMin: 40000, salaryMax: 55000 },
    { title: 'Security Guard', description: 'Night shift security for warehouse.', category: 'Others', jobType: 'FULL_TIME', salaryMin: 35000, salaryMax: 45000 },
    { title: 'Data Entry Operator', description: 'Fast typing speed required.', category: 'IT', jobType: 'CONTRACT', salaryMin: 30000, salaryMax: 40000 },
    { title: 'Plumber', description: 'Plumbing installations for new housing projects.', category: 'Construction', jobType: 'CONTRACT', salaryMin: 55000, salaryMax: 70000 },
    { title: 'Sales Assistant', description: 'Retail sales position with commissions.', category: 'Retail', jobType: 'FULL_TIME', salaryMin: 40000, salaryMax: 60000 },
    { title: 'Tuk-tuk Delivery Driver', description: 'Immediate requirement for reliable tuk-tuk drivers for grocery deliveries in Colombo suburban areas.', category: 'Logistics', jobType: 'FULL_TIME', salaryMin: 45000, salaryMax: 70000 },
    { title: 'Tea Estate Field Officer', description: 'Oversee daily plucking and maintenance activities in our Nuwara Eliya estate.', category: 'Agriculture', jobType: 'FULL_TIME', salaryMin: 55000, salaryMax: 80000 },
    { title: 'Hotel Housekeeping Sub-Staff', description: 'Cleaning and room maintenance for a mid-sized boutique hotel in Galle.', category: 'Hospitality', jobType: 'FULL_TIME', salaryMin: 35000, salaryMax: 50000 },
    { title: 'Tourist Boat Operator', description: 'Operate glass-bottom boats for coral watching in Hikkaduwa. Must have valid license.', category: 'Hospitality', jobType: 'CONTRACT', salaryMin: 50000, salaryMax: 90000 },
    { title: 'Coconut Palm Climber', description: 'Skilled climbers needed for monthly harvest in a large coconut estate near Chilaw.', category: 'Agriculture', jobType: 'CONTRACT', salaryMin: 60000, salaryMax: 95000 },
    { title: 'Pettah Shop Assistant', description: 'Helper for a wholesale hardware shop in Pettah. Heavy lifting involved.', category: 'Retail', jobType: 'FULL_TIME', salaryMin: 38000, salaryMax: 55000 },
    { title: 'Garment QC Specialist', description: 'Quality control for export-oriented apparel factory in Biyagama.', category: 'Garment', jobType: 'FULL_TIME', salaryMin: 48000, salaryMax: 72000 },
    { title: 'Junior IT Support', description: 'Basic hardware and software troubleshooting for a corporate office.', category: 'IT', jobType: 'FULL_TIME', salaryMin: 50000, salaryMax: 70000 },
    { title: 'Montessori Teacher', description: 'Caring teacher for a local preschool. Fluency in Sinhala/Tamil and basic English required.', category: 'Education', jobType: 'PART_TIME', salaryMin: 28000, salaryMax: 45000 },
    { title: 'Fish Processing Worker', description: 'Packing and sorting fish for export at Mutwal harbor.', category: 'Others', jobType: 'FULL_TIME', salaryMin: 40000, salaryMax: 60000 },
    { title: 'Auto Mechanic Helper', description: 'Supporting senior mechanics with vehicle repairs and services.', category: 'Others', jobType: 'FULL_TIME', salaryMin: 35000, salaryMax: 55000 },
    { title: 'Pharmacy Assistant', description: 'Dispensing medicines and managing inventory at a retail pharmacy.', category: 'Healthcare', jobType: 'FULL_TIME', salaryMin: 42000, salaryMax: 65000 },
    { title: 'Mobile Repair Technician', description: 'Solving hardware issues including screen replacements for smartphones.', category: 'IT', jobType: 'CONTRACT', salaryMin: 45000, salaryMax: 75000 },
    { title: 'Excavator Operator', description: 'Heavy machinery operator for drainage and construction projects.', category: 'Construction', jobType: 'FULL_TIME', salaryMin: 85000, salaryMax: 140000 },
];

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {});
        console.log('MongoDB connected for Job seeding...');
    } catch (err) {
        console.error('DB connection failed', err);
        process.exit(1);
    }
};

const seedJobsAndApps = async () => {
    await connectDB();
    try {
        console.log('Fetching seeded users...');
        const employers = await User.find({ role: 'EMPLOYER' }).limit(10);
        if (employers.length < 5) {
            console.log('Employers not found! Run seedSampleData.js first.');
            process.exit(1);
        }

        const seekers = await User.find({ role: 'JOB_SEEKER' }).limit(10);
        
        console.log('Clearing old sample jobs & applications...');
        const employerIds = employers.map(e => e._id);
        const seekerIds = seekers.map(s => s._id);
        
        await Application.deleteMany({ employerId: { $in: employerIds } });
        await Job.deleteMany({ employerId: { $in: employerIds } });
        await Notification.deleteMany({ userId: { $in: [...employerIds, ...seekerIds] } });

        console.log('Seeding Jobs (This takes time due to Nominatim API 1s limits)...');
        const createdJobs = [];
        for (let i = 0; i < sampleJobsData.length; i++) {
            const org = employers[Math.floor(i / 3.5)]; // approx 3-4 jobs per employer
            const jobData = {
                ...sampleJobsData[i],
                district: org.district,
                town: org.town || org.district, // If town doesn't exist just use district
                contactPhone: org.phone,
                employerId: org._id
            };
            
            try {
                // We use jobService to automatically trigger the Geocoding API
                const newJob = await jobService.createJob(jobData);
                createdJobs.push(newJob);
                console.log(`Created Job: ${newJob.title} in ${newJob.town}, ${newJob.district}`);
            } catch(e) {
                console.log(`Failed to create job ${jobData.title}`, e.message);
            }
            // Sleep 1.5 seconds to respect OpenStreetMap Nominatim API limits!
            await sleep(1500); 
        }

        console.log('Seeding Applications and Notifications (using applicationService)...');
        const statuses = ['APPLIED', 'REVIEWED', 'ACCEPTED', 'REJECTED'];
        for (const seeker of seekers) {
            // Seekers apply to 3 random jobs
            const shuffledJobs = [...createdJobs].sort(() => 0.5 - Math.random());
            const appliedJobs = shuffledJobs.slice(0, 3);
            
            for (const job of appliedJobs) {
                try {
                    // This creates the "New Application" notification for employers
                    const app = await applicationService.applyToJob(job._id, seeker._id);
                    
                    const finalStatus = statuses[Math.floor(Math.random() * statuses.length)];
                    if (finalStatus !== 'APPLIED') {
                        // This applies the mock status and creates the "Status Updated" notification for seekers
                        await applicationService.updateStatus(app._id, job.employerId.toString(), finalStatus, 'I have carefully reviewed your profile and verified your skills.');
                    }
                } catch(e) {
                    console.log(`Failed applying ${seeker.name} to ${job.title}`, e.message);
                }
            }
            console.log(`${seeker.name} applied for 3 jobs.`);
        }

        console.log('Successfully seeded Jobs and Applications!');
    } catch (err) {
        console.error('Seeding error:', err);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
};

seedJobsAndApps();
