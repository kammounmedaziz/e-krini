import connectDB from '../config/database.js';
import mongoose from 'mongoose';

/**
 * Simple integration test to verify database connection
 * Run with: npm test
 */

describe('Database Connection Tests', () => {
  beforeAll(async () => {
    // Connect to database before tests
    await connectDB();
  });

  afterAll(async () => {
    // Close connection after tests
    await mongoose.connection.close();
  });

  test('should establish database connection', async () => {
    console.log('🧪 Testing database connection...');

    // Test basic database operations
    expect(mongoose.connection.readyState).toBe(1); // Connected
    console.log('✅ Connection established');

    // Get database info
    const db = mongoose.connection.db;
    const stats = await db.stats();

    console.log('📊 Database Stats:');
    console.log(`   - Database: ${db.databaseName}`);
    console.log(`   - Collections: ${stats.collections}`);
    console.log(`   - Documents: ${stats.objects}`);
    console.log(`   - Data Size: ${stats.dataSize} bytes`);

    expect(db.databaseName).toBeDefined();
    expect(stats.collections).toBeGreaterThanOrEqual(0);
  });

  test('should perform basic CRUD operations', async () => {
    const db = mongoose.connection.db;

    // Test creating a simple collection and document
    const testCollection = db.collection('test_connection');
    const testDoc = { message: 'Database connection test', timestamp: new Date() };

    const result = await testCollection.insertOne(testDoc);
    console.log('✅ Insert operation successful');
    console.log(`   - Inserted ID: ${result.insertedId}`);

    expect(result.insertedId).toBeDefined();

    // Clean up test data
    const deleteResult = await testCollection.deleteOne({ _id: result.insertedId });
    console.log('✅ Cleanup successful');

    expect(deleteResult.deletedCount).toBe(1);
  });
});
