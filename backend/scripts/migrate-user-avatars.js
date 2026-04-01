const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../src/models/user.model');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const defaultAvatar = 'https://res.cloudinary.com/dedoxaqug/image/upload/v1774887841/ruralwork/defaults/default_avatar.png';

async function migrateAvatars() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/job_portal_db');
        console.log('Connected to database.');

        console.log('Checking for users with null or missing profile pictures...');
        const result = await User.updateMany(
            { $or: [{ profilePicture: null }, { profilePicture: { $exists: false } }] },
            { $set: { profilePicture: defaultAvatar } }
        );

        console.log(`Migration complete. Updated ${result.modifiedCount} users.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error.message);
        process.exit(1);
    }
}

migrateAvatars();
