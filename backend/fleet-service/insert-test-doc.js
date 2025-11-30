import dotenv from 'dotenv';
dotenv.config();

import connectDB from './src/config/db.js';
import mongoose from 'mongoose';

const run = async () => {
  try {
    const conn = await connectDB();

    const db = mongoose.connection.db;
    const collectionName = 'dev_checks';
    const doc = {
      test: 'gui-insert',
      createdBy: 'dev-script',
      timestamp: new Date().toISOString(),
      note: 'Inserted to confirm presence in Mongo GUI',
      random: Math.random().toString(36).slice(2, 10)
    };

    const result = await db.collection(collectionName).insertOne(doc);
    console.log('✅ Inserted test document into', collectionName);
    console.log('InsertedId:', result.insertedId.toString());

    // Close connection
    if (conn && conn.connection && typeof conn.connection.close === 'function') {
      await conn.connection.close();
      console.log('🔒 Connection closed');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Insert failed:', err);
    process.exit(1);
  }
};

run();
