import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User.js';

dotenv.config();

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/car-rental-auth';

async function debugAuth() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Find admin user
        const adminUser = await User.findOne({ role: 'admin' });
        
        if (!adminUser) {
            console.log('❌ No admin user found in database!');
            console.log('📝 Creating test admin user...');
            
            const testAdmin = new User({
                username: 'admin',
                email: 'admin@example.com',
                password: 'Admin123!',
                role: 'admin'
            });
            
            await testAdmin.save();
            console.log('✅ Test admin created');
            console.log('   Username: admin');
            console.log('   Email: admin@example.com');
            console.log('   Password: Admin123!');
            console.log('   Role:', testAdmin.role);
            
            // Generate test token
            const testToken = jwt.sign(
                {
                    id: testAdmin._id,
                    username: testAdmin.username,
                    role: testAdmin.role
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '30m' }
            );
            
            console.log('\n🔑 Test Token:', testToken);
        } else {
            console.log('✅ Admin user found:');
            console.log('   ID:', adminUser._id);
            console.log('   Username:', adminUser.username);
            console.log('   Email:', adminUser.email);
            console.log('   Role:', adminUser.role);
            
            // Generate token for this admin
            const adminToken = jwt.sign(
                {
                    id: adminUser._id,
                    username: adminUser.username,
                    role: adminUser.role
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '30m' }
            );
            
            console.log('\n🔑 Admin Token:', adminToken);
            
            // Verify the token
            try {
                const decoded = jwt.verify(adminToken, process.env.ACCESS_TOKEN_SECRET);
                console.log('\n✅ Token verification successful:');
                console.log('   Decoded ID:', decoded.id);
                console.log('   Decoded Username:', decoded.username);
                console.log('   Decoded Role:', decoded.role);
            } catch (err) {
                console.log('❌ Token verification failed:', err.message);
            }
        }

        // Check all users
        const allUsers = await User.find({}, 'username email role');
        console.log('\n📋 All users in database:');
        allUsers.forEach(u => {
            console.log(`   - ${u.username} (${u.email}) - Role: ${u.role}`);
        });

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

debugAuth();
