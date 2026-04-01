const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../src/models/user.model');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkUser(name) {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/job_portal_db');
        console.log('Connected to database.');

        console.log(`Finding user: ${name}...`);
        const user = await User.findOne({ name: new RegExp(name, 'i') });

        if (user) {
            console.log(`- User: ${user.name} (${user.email})`);
            console.log(`  Role: ${user.role}`);
            console.log(`  Profile Picture: ${user.profilePicture}`);
            console.log(`  Google ID: ${user.googleId}`);
        } else {
            console.log(`User ${name} not found.`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Check failed:', error.message);
        process.exit(1);
    }
}

checkUser('The Hunter');
