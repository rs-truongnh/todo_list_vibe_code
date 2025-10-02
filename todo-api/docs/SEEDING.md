# Database Seeding

## Tự động seeding khi khởi động server

Server sẽ tự động:
- ✅ Kiểm tra và tạo tài khoản admin nếu chưa có
- ✅ Tạo test users trong môi trường development

## Thông tin tài khoản admin mặc định

```
Username: admin
Email: admin@todoapi.com
Password: admin123456
Role: admin
```

⚠️ **QUAN TRỌNG**: Đổi password sau lần đăng nhập đầu tiên!

## Chạy seeding thủ công

```bash
# Chạy toàn bộ seeding process
npm run seed

# Hoặc chạy trực tiếp
node scripts/seed.js
```

## Test users (chỉ trong development)

Khi `NODE_ENV=development`, server sẽ tự động tạo các test users:

```
Username: testuser1
Email: test1@example.com
Password: test123456

Username: testuser2
Email: test2@example.com
Password: test123456
```

## Tùy chỉnh admin account

Để thay đổi thông tin admin mặc định, chỉnh sửa file `seed.js`:

```javascript
const adminData = {
  username: 'your-admin-username',
  email: 'your-admin@email.com',
  password: 'your-secure-password',
  fullName: 'Your Admin Name',
  role: 'admin'
};
```

## Production Notes

- 🔒 Seeding sẽ tự động chạy mỗi khi server khởi động
- ✅ Chỉ tạo admin user nếu chưa tồn tại
- ❌ Test users KHÔNG được tạo trong production
- 🛡️ Password sẽ được hash tự động bởi User model
