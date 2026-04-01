const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testCloudinary() {
    console.log('Testing Cloudinary Connection...');
    console.log(`Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
    
    try {
        // Use api.ping() to check basic connectivity and credentials
        const pingResult = await cloudinary.api.ping();
        console.log('Ping Result:', pingResult);
        
        if (pingResult.status === 'ok') {
            console.log('SUCCESS: Cloudinary is working perfectly!');
            
            // Optionally check for the default avatar we uploaded
            console.log('\nChecking for default avatar resource...');
            const resource = await cloudinary.api.resource('ruralwork/defaults/default_avatar');
            console.log('Found default avatar at:', resource.secure_url);
        } else {
            console.error('FAILURE: Cloudinary returned an unexpected ping status.');
        }

        process.exit(0);
    } catch (error) {
        console.error('ERROR: Cloudinary connection failed!');
        console.error('Message:', error.message);
        console.error('\nTips for troubleshooting:');
        console.log('1. Check if your API Key and Secret are correct in .env');
        console.log('2. Check if your internet connection is stable');
        console.log('3. Ensure your Cloudinary account is active and not over its limit');
        process.exit(1);
    }
}

testCloudinary();
