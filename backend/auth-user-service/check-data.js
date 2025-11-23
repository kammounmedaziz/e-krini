import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Agency from './src/models/Agency.js';
import Insurance from './src/models/Insurance.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/car-rental-auth';

async function checkData() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Check agencies
        const agencyCount = await Agency.countDocuments();
        console.log('📊 AGENCIES:');
        console.log(`   Total count: ${agencyCount}`);
        
        if (agencyCount > 0) {
            const agencies = await Agency.find().populate('userId', 'username email').limit(5);
            console.log('   Sample agencies:');
            agencies.forEach((agency, idx) => {
                console.log(`   ${idx + 1}. ${agency.companyName} (${agency.status})`);
                console.log(`      User: ${agency.userId?.username || 'N/A'}`);
                console.log(`      Created: ${agency.createdAt}`);
            });
        } else {
            console.log('   ❌ No agencies found!');
        }

        // Check insurance companies
        const insuranceCount = await Insurance.countDocuments();
        console.log('\n📊 INSURANCE COMPANIES:');
        console.log(`   Total count: ${insuranceCount}`);
        
        if (insuranceCount > 0) {
            const companies = await Insurance.find().populate('userId', 'username email').limit(5);
            console.log('   Sample companies:');
            companies.forEach((company, idx) => {
                console.log(`   ${idx + 1}. ${company.companyName} (${company.status})`);
                console.log(`      User: ${company.userId?.username || 'N/A'}`);
                console.log(`      Created: ${company.createdAt}`);
            });
        } else {
            console.log('   ❌ No insurance companies found!');
        }

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkData();
