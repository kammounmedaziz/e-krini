import connectDB from '../config/database.js';
import mongoose from 'mongoose';

/**
 * Simple integration test to verify database connection
 * Run with: node src/tests/database.test.js
 */

async function testDatabaseConnection() {
  console.log('🧪 Testing database connection...');

  try {
    // Connect to database
    await connectDB();

    // Test basic database operations
    console.log('✅ Connection established');

    // Get database info
    const db = mongoose.connection.db;
    const stats = await db.stats();

    console.log('📊 Database Stats:');
    console.log(`   - Database: ${db.databaseName}`);
    console.log(`   - Collections: ${stats.collections}`);
    console.log(`   - Documents: ${stats.objects}`);
    console.log(`   - Data Size: ${stats.dataSize} bytes`);

    // Test creating a simple collection and document
    const testCollection = db.collection('test_connection');
    const testDoc = { message: 'Database connection test', timestamp: new Date() };

    const result = await testCollection.insertOne(testDoc);
    console.log('✅ Insert operation successful');
    console.log(`   - Inserted ID: ${result.insertedId}`);

    // Clean up test data
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('✅ Cleanup successful');

    console.log('🎉 All database tests passed!');

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    process.exit(1);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testDatabaseConnection();
}

export default testDatabaseConnection;
