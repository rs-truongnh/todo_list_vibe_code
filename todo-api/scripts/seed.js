#!/usr/bin/env node

/**
 * Standalone seeding script
 * Chạy: node scripts/seed.js
 */

require('dotenv').config();
const connectDB = require('../config/database');
const { seedDatabase } = require('../seed');

const runSeeding = async () => {
  try {
    console.log('🚀 Bắt đầu standalone database seeding...');

    // Kết nối database
    await connectDB();

    // Chạy seeding
    await seedDatabase();

    console.log('✨ Hoàn thành seeding! Đóng kết nối...');
    process.exit(0);

  } catch (error) {
    console.error('💥 Lỗi trong quá trình seeding:', error.message);
    process.exit(1);
  }
};

// Chạy nếu file này được execute trực tiếp
if (require.main === module) {
  runSeeding();
}

module.exports = { runSeeding };
