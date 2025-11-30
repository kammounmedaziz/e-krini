import dotenv from 'dotenv';
dotenv.config();

import connectDB from './src/config/db.js';
import mongoose from 'mongoose';

// Usage:
//  node remove-test-doc.js --id=<insertedId>    => removes one document by id
//  node remove-test-doc.js --all                 => removes all docs created by dev-script

const argv = process.argv.slice(2);
const argMap = {};
for (const a of argv) {
  if (a.startsWith('--')) {
    const [k, v] = a.slice(2).split('=');
    argMap[k] = v === undefined ? true : v;
  }
}

const run = async () => {
  try {
    const conn = await connectDB();
    const db = mongoose.connection.db;
    const col = db.collection('dev_checks');

    if (argMap.id) {
      const { ObjectId } = mongoose.Types;
      const id = ObjectId.isValid(argMap.id) ? new ObjectId(argMap.id) : null;
      if (!id) {
        console.error('Invalid id provided.');
        process.exit(1);
      }
      const result = await col.deleteOne({ _id: id });
      console.log('Deleted count:', result.deletedCount);
    } else if (argMap.all) {
      const result = await col.deleteMany({ createdBy: 'dev-script' });
      console.log('Deleted count:', result.deletedCount);
    } else {
      console.log('No action taken. Provide --id=<id> or --all');
    }

    if (conn && conn.connection && typeof conn.connection.close === 'function') {
      await conn.connection.close();
    }
    process.exit(0);
  } catch (err) {
    console.error('Cleanup failed:', err);
    process.exit(1);
  }
};

run();
