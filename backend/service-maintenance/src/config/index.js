const fs = require('fs');
let defaultConfig = {};
try {
  defaultConfig = require('./db.json');
} catch (e) {
  defaultConfig = {};
}

const url = process.env.MONGODB_URI || defaultConfig.url || 'mongodb://127.0.0.1:27017/maintenance_db';

module.exports = { url };
