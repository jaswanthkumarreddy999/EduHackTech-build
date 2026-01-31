/**
 * Seed Script - Creates default admin user
 * Run: node seed.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Import User model
const User = require('./modules/auth/user.model');

// Connect to DB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected for seeding');
    } catch (error) {
        console.error('❌ DB Connection Error:', error.message);
        process.exit(1);
    }
};

// Seed Admin
const seedAdmin = async () => {
    const adminEmail = 'admin@eduhacktech.com';
    const adminPassword = 'Admin@123'; // Default password - CHANGE IN PRODUCTION

    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists. Skipping seed.');
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        // Create admin user
        const admin = await User.create({
            name: 'Platform Admin',
            email: adminEmail,
            password: hashedPassword,
            role: 'admin'
        });

        console.log('✅ Admin user created successfully!');
        console.log('   Email:', adminEmail);
        console.log('   Password:', adminPassword);
        console.log('   ⚠️  Please change the password after first login!');

    } catch (error) {
        console.error('❌ Error seeding admin:', error.message);
    }
};

// Run
const run = async () => {
    await connectDB();
    await seedAdmin();

    // Disconnect after seeding
    await mongoose.disconnect();
    console.log('✅ Seeding complete. Disconnected from DB.');
    process.exit(0);
};

run();
