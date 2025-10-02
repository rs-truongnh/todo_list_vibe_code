# 🔧 Hướng dẫn thiết lập MongoDB Atlas

## Nếu bạn gặp lỗi "Authentication failed", hãy làm theo các bước sau:

### 1. Kiểm tra MongoDB Atlas Cluster
- Đăng nhập vào [MongoDB Atlas](https://cloud.mongodb.com)
- Kiểm tra cluster "TodoList" có đang chạy không

### 2. Kiểm tra Database User
- Vào **Database Access** trong MongoDB Atlas
- Đảm bảo user `truongnh_db_user` tồn tại
- Kiểm tra password có đúng không
- Đảm bảo user có quyền `readWrite` cho database

### 3. Kiểm tra Network Access
- Vào **Network Access** trong MongoDB Atlas
- Thêm IP address hiện tại vào whitelist
- Hoặc thêm `0.0.0.0/0` để cho phép từ mọi IP (chỉ dùng cho development)

### 4. Kiểm tra Connection String
Trong file `.env`, đảm bảo `MONGODB_URI` có format:
```
mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority&appName=<app-name>
```

### 5. Test kết nối
Nếu vẫn gặp vấn đề, thử tạo connection string mới:
- Vào **Database** > **Connect**
- Chọn **Connect your application**
- Copy connection string mới
- Thay thế `<password>` bằng password thật

## Alternative: Sử dụng MongoDB Local

Nếu không muốn dùng MongoDB Atlas, bạn có thể cài MongoDB local:

1. **Tải và cài MongoDB Community Edition**
   - [Download MongoDB](https://www.mongodb.com/try/download/community)

2. **Khởi động MongoDB service**
   ```bash
   # Windows
   net start MongoDB

   # hoặc chạy manual
   mongod
   ```

3. **Cập nhật .env**
   ```env
   MONGODB_URI=mongodb://localhost:27017/todolist
   DB_NAME=todolist
   ```

## Test Server

Sau khi fix xong, test bằng cách:
```bash
npm run dev
```

Server sẽ chạy tại: http://localhost:8888
