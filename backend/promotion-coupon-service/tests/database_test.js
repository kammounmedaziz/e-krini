import mongoose from 'mongoose';
import connectDB from '../src/config/database.js';

async function runTests() {
  console.log('🧪 Connecting to database...');
  await connectDB();

  try {
    // Test database connection
    if (mongoose.connection.readyState === 1) {
      console.log('✅ Database connection established');
    } else {
      console.error('❌ Database connection failed');
      process.exit(1);
    }

    const db = mongoose.connection.db;
    const stats = await db.stats();

    console.log('📊 Database Stats:');
    console.log(`   - Database: ${db.databaseName}`);
    console.log(`   - Collections: ${stats.collections}`);
    console.log(`   - Documents: ${stats.objects}`);
    console.log(`   - Data Size: ${stats.dataSize} bytes`);

    // Test CRUD operation
    const testCollection = db.collection('test_connection');
    const testDoc = { message: 'Database connection test', timestamp: new Date() };

    const result = await testCollection.insertOne(testDoc);
    console.log('✅ Insert operation successful');
    console.log(`   - Inserted ID: ${result.insertedId}`);

    const deleteResult = await testCollection.deleteOne({ _id: result.insertedId });
    console.log('✅ Cleanup successful');
    console.log(`   - Deleted Count: ${deleteResult.deletedCount}`);

  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
  }
}

runTests();
