const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadDefaultAvatar() {
    const filePath = 'C:/Users/joeln/Downloads/icons8-user-100.png';
    
    if (!fs.existsSync(filePath)) {
        console.error('Default avatar file not found at:', filePath);
        process.exit(1);
    }

    try {
        console.log('Uploading default avatar to Cloudinary...');
        const result = await cloudinary.uploader.upload(filePath, {
            folder: 'ruralwork/defaults',
            public_id: 'default_avatar',
            overwrite: true,
            resource_type: 'image',
        });

        console.log('Default Avatar URL:', result.secure_url);
        console.log('Public ID:', result.public_id);
        return result.secure_url;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error.message);
        process.exit(1);
    }
}

uploadDefaultAvatar();
