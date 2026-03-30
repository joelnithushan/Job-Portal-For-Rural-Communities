const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const User = require('../src/models/user.model');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function migrateGooglePics() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/job_portal_db');
        console.log('Connected to database.');

        console.log('Finding users with Google-hosted profile pictures...');
        const users = await User.find({
            profilePicture: { $regex: /googleusercontent\.com/ }
        });

        console.log(`Found ${users.length} users to migrate.`);

        let successCount = 0;
        let failCount = 0;

        for (const user of users) {
            console.log(`Migrating: ${user.name} (${user.email})...`);
            
            try {
                // Fetch the current Google picture URL
                const googleUrl = user.profilePicture;
                
                // Upload to Cloudinary
                const uploadResult = await cloudinary.uploader.upload(googleUrl, {
                    folder: 'ruralwork/profiles',
                    public_id: `user_${user._id}_google`,
                    overwrite: true,
                });

                // Update user in database
                user.profilePicture = uploadResult.secure_url;
                await user.save();

                console.log(`  Successfully migrated -> ${uploadResult.secure_url}`);
                successCount++;
            } catch (err) {
                console.error(`  Failed to migrate ${user.email}:`, err.message);
                failCount++;
            }
        }

        console.log('\n--- Migration Finished ---');
        console.log(`Successfully migrated: ${successCount}`);
        console.log(`Failed to migrate:     ${failCount}`);

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error.message);
        process.exit(1);
    }
}

migrateGooglePics();
