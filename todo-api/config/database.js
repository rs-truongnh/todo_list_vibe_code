const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    console.log('🔌 Đang kết nối đến MongoDB...');

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME
    });

    console.log(`✅ MongoDB kết nối thành công: ${conn.connection.host}`);
    console.log(`📚 Database: ${conn.connection.name}`);

    // Return connection để có thể chain promises
    return conn;

  } catch (error) {
    console.error('❌ Lỗi kết nối MongoDB:', error.message);
    console.error('💡 Vui lòng kiểm tra:');
    console.error('   - MongoDB URI trong file .env');
    console.error('   - Username/Password');
    console.error('   - Network access (IP whitelist)');
    console.error('   - Database permissions');

    // Don't exit in development, just log the error
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }

    throw error; // Re-throw để catch được ở caller
  }
};

module.exports = connectDB;
