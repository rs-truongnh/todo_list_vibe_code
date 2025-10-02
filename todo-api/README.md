# Todo List API

Một REST API đầy đủ cho ứng dụng Todo List được xây dựng với Node.js, Express và MongoDB.

## 🚀 Tính năng

- ✅ Tạo, đọc, cập nhật, xóa todos (CRUD)
- 📅 Quản lý thời gian bắt đầu và kết thúc
- 🎯 Trạng thái công việc: pending, in-progress, completed, cancelled
- 🔥 Độ ưu tiên: low, medium, high
- 🏷️ Tags cho việc phân loại
- 🔍 Tìm kiếm theo trạng thái, khoảng thời gian
- ⏰ Phát hiện công việc quá hạn
- 📖 Phân trang và sắp xếp
- 🛡️ Validation dữ liệu
- 📝 Middleware logging và xử lý lỗi

## 🛠️ Cài đặt

### Yêu cầu hệ thống
- Node.js >= 14.x
- MongoDB >= 4.x
- npm hoặc yarn

### Các bước cài đặt

1. **Clone repository**
```bash
git clone <repository-url>
cd todo-api
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Cấu hình environment variables**
Tạo file `.env` trong thư mục root và cấu hình:
```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/todolist
DB_NAME=todolist

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Secret (nếu cần authentication sau này)
JWT_SECRET=your-jwt-secret-key-here

# CORS Origin
CORS_ORIGIN=http://localhost:3000
```

4. **Khởi động MongoDB**
```bash
# Trên Windows
net start MongoDB

# Trên macOS với Homebrew
brew services start mongodb/brew/mongodb-community

# Trên Linux
sudo systemctl start mongod
```

5. **Chạy ứng dụng**
```bash
# Development mode với nodemon
npm run dev

# Production mode
npm start
```

Server sẽ chạy tại `http://localhost:3000`

## 📚 API Endpoints

### Cơ bản
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/` | Trang chủ API |
| GET | `/health` | Kiểm tra trạng thái server |

### Todos
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/todos` | Lấy tất cả todos |
| POST | `/api/todos` | Tạo todo mới |
| GET | `/api/todos/:id` | Lấy todo theo ID |
| PUT | `/api/todos/:id` | Cập nhật todo |
| DELETE | `/api/todos/:id` | Xóa todo |

### Tính năng nâng cao
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/todos/status/:status` | Lấy todos theo trạng thái |
| GET | `/api/todos/date-range` | Lấy todos trong khoảng thời gian |
| GET | `/api/todos/overdue` | Lấy todos quá hạn |

## 📋 Cấu trúc dữ liệu

### Todo Schema
```javascript
{
  "title": "string (required, max 200 chars)",
  "description": "string (optional, max 1000 chars)",
  "startTime": "Date (required)",
  "endTime": "Date (required, must be after startTime)",
  "status": "enum ['pending', 'in-progress', 'completed', 'cancelled'] (default: 'pending')",
  "priority": "enum ['low', 'medium', 'high'] (default: 'medium')",
  "tags": ["array of strings"],
  "createdAt": "Date (auto-generated)",
  "updatedAt": "Date (auto-generated)"
}
```

## 🔧 Ví dụ sử dụng

### 1. Tạo todo mới
```bash
curl -X POST http://localhost:3000/api/todos \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Hoàn thành dự án",
    "description": "Viết code và test API",
    "startTime": "2024-01-01T09:00:00.000Z",
    "endTime": "2024-01-01T17:00:00.000Z",
    "status": "pending",
    "priority": "high",
    "tags": ["work", "urgent"]
  }'
```

### 2. Lấy tất cả todos với phân trang
```bash
curl "http://localhost:3000/api/todos?page=1&limit=10&status=pending&sortBy=createdAt&sortOrder=desc"
```

### 3. Cập nhật trạng thái todo
```bash
curl -X PUT http://localhost:3000/api/todos/[todo-id] \\
  -H "Content-Type: application/json" \\
  -d '{"status": "completed"}'
```

### 4. Lấy todos trong khoảng thời gian
```bash
curl "http://localhost:3000/api/todos/date-range?startDate=2024-01-01&endDate=2024-01-31"
```

## 📁 Cấu trúc thư mục

```
todo-api/
├── config/
│   └── database.js          # Cấu hình kết nối MongoDB
├── controllers/
│   └── todoController.js    # Logic xử lý business
├── middleware/
│   ├── errorHandler.js      # Xử lý lỗi
│   └── logger.js           # Logging requests
├── models/
│   └── Todo.js             # MongoDB model/schema
├── routes/
│   └── todoRoutes.js       # Định nghĩa API routes
├── .env                    # Environment variables
├── .gitignore             # Git ignore file
├── package.json           # Dependencies và scripts
├── README.md              # Documentation
└── server.js              # Entry point
```

## 🔍 Query Parameters

### GET /api/todos
- `page`: Số trang (default: 1)
- `limit`: Số lượng items per page (default: 10)
- `status`: Filter theo trạng thái
- `priority`: Filter theo độ ưu tiên
- `sortBy`: Field để sort (default: 'createdAt')
- `sortOrder`: 'asc' hoặc 'desc' (default: 'desc')

## 🚨 Error Handling

API trả về consistent error format:
```javascript
{
  "success": false,
  "message": "Error message",
  "errors": ["Additional error details"] // optional
}
```

## 🧪 Testing

Bạn có thể test API bằng:
- Postman
- curl commands
- REST Client extensions trong VS Code
- Insomnia

## 📝 Ghi chú phát triển

### Tính năng có thể mở rộng
- [ ] Authentication & Authorization
- [ ] File attachments cho todos
- [ ] Notifications/Reminders
- [ ] Collaborative todos
- [ ] API rate limiting
- [ ] Swagger/OpenAPI documentation
- [ ] Unit tests
- [ ] Docker containerization

### Scripts npm có sẵn
- `npm start`: Chạy production server
- `npm run dev`: Chạy development server với nodemon
- `npm test`: Chạy tests (chưa implement)

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Support

Nếu bạn gặp vấn đề, hãy tạo issue trên GitHub hoặc liên hệ qua email.

---
**Happy Coding! 🎉**
