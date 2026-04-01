const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/user.model');

const fixAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'joelfiverr06@gmail.com';
        const rawPassword = 'sjdf vdjo aeqz zekk';

        const user = await User.findOne({ email });
        if (!user) {
            console.log('Admin user not found, creating one...');
            await User.create({
                name: 'System Admin',
                email: email,
                password: rawPassword,
                role: 'ADMIN',
                isEmailVerified: true
            });
            console.log('Admin created successfully.');
        } else {
            console.log('Admin user found, updating password and role...');
            user.password = rawPassword;
            user.role = 'ADMIN';
            // The pre-save hook in user.model.js will hash it
            await user.save();
            console.log('Admin password and role updated successfully.');
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error fixing admin:', error);
        process.exit(1);
    }
};

fixAdmin();
