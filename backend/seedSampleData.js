const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/user.model');
const Company = require('./src/models/company.model');

const jobSeekers = [
    { name: 'Kamal Perera', email: 'kamal.seeker@gmail.com', password: 'Password@123', role: 'JOB_SEEKER', district: 'Colombo', phone: '+94711112222', bio: 'Experienced carpenter looking for daily wage work.' },
    { name: 'Nimali Silva', email: 'nimali.seeker@gmail.com', password: 'Password@123', role: 'JOB_SEEKER', district: 'Galle', phone: '+94772223333', bio: 'Skilled garment factory machine operator.' },
    { name: 'Sunil Rathnayake', email: 'sunil.seeker@gmail.com', password: 'Password@123', role: 'JOB_SEEKER', district: 'Kurunegala', phone: '+94753334444', bio: 'Reliable delivery rider with own motorcycle.' },
    { name: 'Fathima Nuzha', email: 'fathima.seeker@gmail.com', password: 'Password@123', role: 'JOB_SEEKER', district: 'Kandy', phone: '+94764445555', bio: 'Data entry clerk and fast typist.' },
    { name: 'Sivarajah Dinesh', email: 'dinesh.seeker@gmail.com', password: 'Password@123', role: 'JOB_SEEKER', district: 'Jaffna', phone: '+94785556666', bio: 'Farm hand and agricultural worker with 10 years experience.' },
    { name: 'Ravi Fernando', email: 'ravi.seeker@gmail.com', password: 'Password@123', role: 'JOB_SEEKER', district: 'Gampaha', phone: '+94711223344', bio: 'Licensed heavy vehicle driver.' },
    { name: 'Samanthi Silva', email: 'samanthi.seeker@gmail.com', password: 'Password@123', role: 'JOB_SEEKER', district: 'Colombo', phone: '+94772334455', bio: 'Experienced English teacher.' },
    { name: 'Mohamed Rizan', email: 'rizan.seeker@gmail.com', password: 'Password@123', role: 'JOB_SEEKER', district: 'Jaffna', phone: '+94753445566', bio: 'Certified electrician and plumber.' },
    { name: 'Kavindi Perera', email: 'kavindi.seeker@gmail.com', password: 'Password@123', role: 'JOB_SEEKER', district: 'Matara', phone: '+94764556677', bio: 'Creative graphic designer and translator.' },
    { name: 'Upali Wijeratne', email: 'upali.seeker@gmail.com', password: 'Password@123', role: 'JOB_SEEKER', district: 'Anuradhapura', phone: '+94785667788', bio: 'Tea plantation supervisor.' },
];

const employers = [
    { 
        user: { name: 'Kasun Bandara', email: 'hr@lakmugarments.lk', password: 'Password@123', role: 'EMPLOYER', district: 'Gampaha', phone: '+94771231234', profilePicture: 'https://api.dicebear.com/7.x/shapes/svg?seed=Lakmu&backgroundColor=0a5b83,1c799f' },
        company: { businessName: 'Lakmu Garments Ltd', description: 'A leading apparel manufacturer in the region.', district: 'Gampaha', town: 'Katunayake', contactPhone: '+94112233445' }
    },
    { 
        user: { name: 'Ruwan Kumara', email: 'manager@ceylonbuilders.lk', password: 'Password@123', role: 'EMPLOYER', district: 'Colombo', phone: '+94719876543', profilePicture: 'https://api.dicebear.com/7.x/shapes/svg?seed=CeylonBuilders&backgroundColor=b6e3f4,c0aede' },
        company: { businessName: 'Ceylon Builders & Construction', description: 'Commercial and residential building contractors.', district: 'Colombo', town: 'Maharagama', contactPhone: '+94115566778' }
    },
    { 
        user: { name: 'Priyanka Fernando', email: 'info@freshfoods.lk', password: 'Password@123', role: 'EMPLOYER', district: 'Kandy', phone: '+94761122334', profilePicture: 'https://api.dicebear.com/7.x/shapes/svg?seed=FreshFoods&backgroundColor=d1d4f9,ffdfbf' },
        company: { businessName: 'Fresh Foods Supermarket', description: 'Local grocery and supermarket chain.', district: 'Kandy', town: 'Peradeniya', contactPhone: '+94812233445' }
    },
    { 
        user: { name: 'Ahamed Fasly', email: 'ahamed@quickdelivery.lk', password: 'Password@123', role: 'EMPLOYER', district: 'Kurunegala', phone: '+94759988776', profilePicture: 'https://api.dicebear.com/7.x/shapes/svg?seed=QuickDelivery&backgroundColor=ffd5dc,ffdfbf' },
        company: { businessName: 'Quick Delivery Services', description: 'Island-wide fast delivery network.', district: 'Kurunegala', town: 'Kuliyapitiya', contactPhone: '+94372233445' }
    },
    { 
        user: { name: 'Malini Weerasinghe', email: 'careers@lankanagri.lk', password: 'Password@123', role: 'EMPLOYER', district: 'Anuradhapura', phone: '+94784455667', profilePicture: 'https://api.dicebear.com/7.x/shapes/svg?seed=LankanAgri&backgroundColor=b6e3f4,c0aede' },
        company: { businessName: 'Lankan Agri Exports', description: 'Agricultural farming and exporting firm.', district: 'Anuradhapura', town: 'Eppawala', contactPhone: '+94252233445' }
    },
    { 
        user: { name: 'Suren Raj', email: 'hr@buildmax.lk', password: 'Password@123', role: 'EMPLOYER', district: 'Galle', phone: '+94771122334', profilePicture: 'https://api.dicebear.com/7.x/shapes/svg?seed=BuildMax&backgroundColor=0a5b83,1c799f' },
        company: { businessName: 'BuildMax Construction', description: 'Top tier construction company.', district: 'Galle', town: 'Galle', contactPhone: '+94912233445' }
    },
    { 
        user: { name: 'Tharushi Perera', email: 'careers@oceanfoods.lk', password: 'Password@123', role: 'EMPLOYER', district: 'Matara', phone: '+94719988776', profilePicture: 'https://api.dicebear.com/7.x/shapes/svg?seed=OceanFoods&backgroundColor=b6e3f4,c0aede' },
        company: { businessName: 'Ocean Foods Pvt Ltd', description: 'Seafood processing and export company.', district: 'Matara', town: 'Weligama', contactPhone: '+94412233445' }
    },
    { 
        user: { name: 'Anura Dias', email: 'jobs@techsol.lk', password: 'Password@123', role: 'EMPLOYER', district: 'Colombo', phone: '+94761122334', profilePicture: 'https://api.dicebear.com/7.x/shapes/svg?seed=TechSol&backgroundColor=d1d4f9,ffdfbf' },
        company: { businessName: 'TechSol IT Services', description: 'Leading software development firm.', district: 'Colombo', town: 'Nugegoda', contactPhone: '+94112233445' }
    },
    { 
        user: { name: 'Dilhani Silva', email: 'admin@cityhospital.lk', password: 'Password@123', role: 'EMPLOYER', district: 'Kandy', phone: '+94759988776', profilePicture: 'https://api.dicebear.com/7.x/shapes/svg?seed=CityHospital&backgroundColor=ffd5dc,ffdfbf' },
        company: { businessName: 'City Hospital Kandy', description: 'Private healthcare provider.', district: 'Kandy', town: 'Kandy', contactPhone: '+94812233445' }
    },
    { 
        user: { name: 'Mahesh Kumara', email: 'info@stargroup.lk', password: 'Password@123', role: 'EMPLOYER', district: 'Gampaha', phone: '+94784455667', profilePicture: 'https://api.dicebear.com/7.x/shapes/svg?seed=StarGroup&backgroundColor=b6e3f4,c0aede' },
        company: { businessName: 'Star Group Hotels', description: 'Luxury hotel chain operator.', district: 'Gampaha', town: 'Negombo', contactPhone: '+94312233445' }
    },
];

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {});
        console.log('MongoDB connected for seeding...');
    } catch (err) {
        console.error('DB connection failed', err);
        process.exit(1);
    }
};

const seedData = async () => {
    await connectDB();
    try {
        console.log('Fixing indexes...');
        await User.collection.dropIndex('googleId_1').catch(e => console.log('Index drop ignored (may not exist)'));
        await User.syncIndexes();

        console.log('Clearing existing sample users (if any)...');
        const sampleEmails = [...jobSeekers.map(s => s.email), ...employers.map(e => e.user.email)];
        
        // Find existing users to delete their companies too
        const existingEmployers = await User.find({ email: { $in: sampleEmails }, role: 'EMPLOYER' });
        const existingEmployerIds = existingEmployers.map(e => e._id);
        
        if(existingEmployerIds.length > 0) {
           await Company.deleteMany({ employerUserId: { $in: existingEmployerIds } });
        }
        await User.deleteMany({ email: { $in: sampleEmails } });

        console.log('Seeding Job Seekers...');
        for (const seeker of jobSeekers) {
            await User.create(seeker);
        }

        console.log('Seeding Employers...');
        for (const emp of employers) {
            const newEmployer = await User.create(emp.user);
            await Company.create({
                ...emp.company,
                employerUserId: newEmployer._id,
                verificationStatus: 'VERIFIED'
            });
        }
        
        console.log('Successfully seeded 5 Job Seekers and 5 Employers!');
    } catch (err) {
        console.error('Seeding error:', err);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
};

seedData();
