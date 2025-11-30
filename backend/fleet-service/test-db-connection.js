import dotenv from 'dotenv';
dotenv.config();

import connectDB from './src/config/database.js';

const run = async () => {
  try {
    const conn = await connectDB();
    console.log('✅ Test connection succeeded');

    // Close the underlying mongoose connection cleanly
    if (conn && conn.connection && typeof conn.connection.close === 'function') {
      await conn.connection.close();
      console.log('🔒 Connection closed');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Test connection failed:', err);
    process.exit(1);
  }
};

run();
