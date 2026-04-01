const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../src/models/user.model');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkRecentGoogleUsers() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/job_portal_db');
        console.log('Connected to database.');

        console.log('Finding recent Google users...');
        const users = await User.find({ googleId: { $exists: true } }).sort({ updatedAt: -1 }).limit(5);

        users.forEach(u => {
            console.log(`- User: ${u.name} (${u.email})`);
            console.log(`  Role: ${u.role}`);
            console.log(`  Profile Picture: ${u.profilePicture}`);
            console.log(`  Google ID: ${u.googleId}`);
            console.log('---');
        });

        process.exit(0);
    } catch (error) {
        console.error('Check failed:', error.message);
        process.exit(1);
    }
}

checkRecentGoogleUsers();
