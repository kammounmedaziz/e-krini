import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

// Load environment variables
dotenv.config();

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-user-db', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('⚠️  Admin user already exists:', existingAdmin.username);
            return;
        }

        // Create admin user
        const adminData = {
            username: 'admin',
            email: 'admin@e-krini.com',
            password: 'Admin123!',
            role: 'admin',
            kycStatus: 'approved'
        };

        const admin = new User(adminData);
        await admin.save();

        console.log('🎉 Admin user created successfully!');
        console.log('Username: admin');
        console.log('Email: admin@e-krini.com');
        console.log('Password: Admin123!');
        console.log('Role: admin');

    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
};

// Run the script
createAdmin();