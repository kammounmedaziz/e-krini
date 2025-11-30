#!/usr/bin/env node

import connectDB from './src/config/database.js';
import mongoose from 'mongoose';

/**
 * Test Script - Database Connection Verification
 * Usage: node test-connection.js
 */

async function testConnection() {
  try {
    console.log('🧪 Starting database connection test...\n');

    // Connect to database
    await connectDB();

    // Check connection state
    const connectionState = mongoose.connection.readyState;
    console.log(`✅ Connection State: ${connectionState === 1 ? 'Connected' : 'Disconnected'}\n`);

    // Get database info
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database object is not available');
    }

    const stats = await db.stats();

    console.log('📊 Database Information:');
    console.log(`   - Database Name: ${db.databaseName}`);
    console.log(`   - Collections Count: ${stats.collections}`);
    console.log(`   - Documents Count: ${stats.objects}`);
    console.log(`   - Data Size: ${stats.dataSize} bytes`);
    console.log(`   - Storage Size: ${stats.storageSize} bytes\n`);

    // Test CRUD operations
    console.log('🧪 Testing CRUD Operations...\n');

    const testCollection = db.collection('test_connection');

    // INSERT
    const testDoc = {
      message: 'Database connection test',
      timestamp: new Date(),
      testId: Math.random().toString(36).substring(7),
    };

    const insertResult = await testCollection.insertOne(testDoc);
    console.log('✅ INSERT operation successful');
    console.log(`   - Inserted ID: ${insertResult.insertedId}\n`);

    // FIND
    const foundDoc = await testCollection.findOne({ _id: insertResult.insertedId });
    console.log('✅ FIND operation successful');
    console.log(`   - Found Document: ${JSON.stringify(foundDoc)}\n`);

    // UPDATE
    const updateResult = await testCollection.updateOne(
      { _id: insertResult.insertedId },
      { $set: { message: 'Updated message' } }
    );
    console.log('✅ UPDATE operation successful');
    console.log(`   - Modified Count: ${updateResult.modifiedCount}\n`);

    // DELETE
    const deleteResult = await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log('✅ DELETE operation successful');
    console.log(`   - Deleted Count: ${deleteResult.deletedCount}\n`);

    console.log('✨ All tests passed successfully!\n');

    // Close connection
    await mongoose.connection.close();
    console.log('📡 Database connection closed');

    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\n⚠️  Make sure:');
    console.error('   1. MongoDB is running (docker-compose up -d)');
    console.error('   2. .env file is configured with correct MONGODB_URI');
    console.error('   3. Check the connection string in database.js\n');

    if (mongoose.connection.db) {
      await mongoose.connection.close();
    }

    process.exit(1);
  }
}

// Run the test
testConnection();
