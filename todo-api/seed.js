const User = require('./models/User');

const seedAdminUser = async () => {
  try {
    console.log('🌱 Đang kiểm tra tài khoản admin...');

    // Kiểm tra xem đã có admin chưa
    const existingAdmin = await User.findOne({
      $or: [
        { email: 'admin@todoapi.com' },
        { username: 'admin' },
        { role: 'admin' }
      ]
    });

    if (existingAdmin) {
      console.log('✅ Tài khoản admin đã tồn tại:', existingAdmin.email);
      return existingAdmin;
    }

    // Tạo admin user mới
    const adminData = {
      username: 'admin',
      email: 'admin@todoapi.com',
      password: 'admin123456', // Sẽ được hash tự động
      fullName: 'System Administrator',
      role: 'admin',
      isActive: true
    };

    const adminUser = await User.create(adminData);

    console.log('🎉 Tạo tài khoản admin thành công!');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Username:', adminUser.username);
    console.log('🔑 Password: admin123456');
    console.log('⚠️  Khuyến nghị: Đổi password sau lần đăng nhập đầu tiên!');

    return adminUser;

  } catch (error) {
    console.error('❌ Lỗi khi tạo admin user:', error.message);

    // Nếu lỗi duplicate key, có thể admin đã được tạo đồng thời
    if (error.code === 11000) {
      console.log('ℹ️  Admin user có thể đã được tạo bởi process khác');
      return null;
    }

    throw error;
  }
};

const seedDevelopmentUsers = async () => {
  try {
    // Chỉ chạy trong môi trường development
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    console.log('🧪 Tạo users cho môi trường development...');

    // Kiểm tra và tạo test users
    const testUsers = [
      {
        username: 'testuser1',
        email: 'test1@example.com',
        password: 'test123456',
        fullName: 'Test User 1',
        role: 'user'
      },
      {
        username: 'testuser2',
        email: 'test2@example.com',
        password: 'test123456',
        fullName: 'Test User 2',
        role: 'user'
      }
    ];

    for (const userData of testUsers) {
      const existingUser = await User.findOne({
        $or: [
          { email: userData.email },
          { username: userData.username }
        ]
      });

      if (!existingUser) {
        await User.create(userData);
        console.log(`✅ Tạo test user: ${userData.username} (${userData.email})`);
      } else {
        console.log(`ℹ️  Test user đã tồn tại: ${userData.username}`);
      }
    }

  } catch (error) {
    console.error('❌ Lỗi khi tạo development users:', error.message);
  }
};

const seedDatabase = async () => {
  try {
    console.log('🚀 Bắt đầu seeding database...');

    // Tạo admin user (luôn chạy)
    await seedAdminUser();

    // Tạo test users (chỉ trong development)
    await seedDevelopmentUsers();

    console.log('✨ Hoàn thành database seeding!');

  } catch (error) {
    console.error('💥 Lỗi trong quá trình seeding:', error.message);

    // Không exit process, chỉ log lỗi
    // Vì server vẫn nên chạy được ngay cả khi seeding fail
  }
};

module.exports = {
  seedDatabase,
  seedAdminUser,
  seedDevelopmentUsers
};
