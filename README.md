# 📝 Full-Stack Todo Application

Ứng dụng quản lý công việc (Todo App) full-stack với Node.js backend và React frontend, hỗ trợ JWT authentication và Material-UI interface.

## 🚀 Tính năng chính

### Backend (Node.js + Express + MongoDB)
- ✅ RESTful API với đầy đủ CRUD operations
- 🔐 JWT Authentication & Authorization
- 📊 MongoDB Atlas cloud database
- 📚 Swagger API documentation
- 🛡️ Middleware bảo mật và error handling
- 🌱 Auto-seeding dữ liệu mẫu
- 👥 Quản lý người tạo và người được giao việc

### Frontend (React 18 + Material-UI)
- 🎨 Modern Material-UI design system
- 🔑 Login/Register với form validation
- 🏠 Dashboard với thống kê công việc
- ➕ Popup dialog thêm công việc mới
- 📅 Date/Time picker cho deadline
- 🏷️ Tag system và priority management
- 📱 Responsive design cho mobile/desktop
- 🔄 Real-time data synchronization

## 📁 Cấu trúc dự án

```
D:\GMO\Copilot\
├── todo-api/                 # Backend Node.js API
│   ├── config/              # Database & JWT configuration
│   ├── controllers/         # API controllers
│   ├── middleware/          # Authentication & error handling
│   ├── models/             # MongoDB models (User, Todo)
│   ├── routes/             # API routes
│   ├── scripts/            # Database seeding
│   └── server.js           # Main server file
│
├── todo-frontend/           # Frontend React App
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # Authentication context
│   │   ├── services/       # API service layer
│   │   └── App.js         # Main App component
│   └── package.json
│
└── README.md              # Tài liệu này
```

## 🛠️ Cài đặt & Chạy dự án

### Yêu cầu hệ thống
- Node.js >= 16.x
- npm >= 8.x
- MongoDB Atlas account (hoặc MongoDB local)

### 1. Clone repository
```bash
git clone <your-repo-url>
cd Copilot
```

### 2. Cài đặt Backend
```bash
cd todo-api
npm install

# Cấu hình environment variables
cp .env.example .env
# Chỉnh sửa .env với MongoDB connection string và JWT secret

# Chạy server (port 8888)
npm start
```

### 3. Cài đặt Frontend
```bash
cd ../todo-frontend
npm install

# Chạy React app (port 3000)
npm start
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản mới
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/refresh` - Refresh JWT token

### Todos
- `GET /api/todos` - Lấy danh sách todos
- `POST /api/todos` - Tạo todo mới
- `GET /api/todos/:id` - Lấy chi tiết todo
- `PUT /api/todos/:id` - Cập nhật todo
- `DELETE /api/todos/:id` - Xóa todo
- `GET /api/todos/created-by-me` - Todos do user tạo
- `GET /api/todos/assigned-to-me` - Todos được giao cho user

## 📚 API Documentation

Truy cập Swagger UI tại: `http://localhost:8888/api-docs`

## 🔧 Cấu hình

### Backend Environment Variables
```env
# MongoDB
MONGODB_URI=mongodb+atlas://connection_string

# JWT
JWT_SECRET=your_super_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key

# Server
PORT=8888
NODE_ENV=development
```

### Frontend Environment Variables
```env
REACT_APP_API_URL=http://localhost:8888
```

## 🎯 Cách sử dụng

1. **Khởi động servers**: Backend (port 8888) và Frontend (port 3000)
2. **Truy cập**: http://localhost:3000
3. **Đăng ký/Đăng nhập**: Tạo tài khoản hoặc đăng nhập
4. **Quản lý todos**:
   - Xem dashboard với thống kê
   - Click nút "+" để thêm todo mới
   - Điền form với title, description, deadline, priority
   - Thêm tags và assign người làm
   - Submit để tạo todo

## 🔐 Bảo mật

- JWT token authentication với access & refresh tokens
- Password hashing với bcrypt
- CORS configuration cho cross-origin requests
- Input validation và sanitization
- Error handling middleware

## 🏷️ Tính năng nâng cao

### Todo Management
- **Priority levels**: Low, Medium, High
- **Status tracking**: Pending, In Progress, Completed
- **Tag system**: Phân loại công việc
- **Assignment**: Giao việc cho team members
- **Deadline tracking**: Date/time picker

### UI/UX
- **Material-UI components**: Professional design
- **Responsive layout**: Mobile-first approach
- **Loading states**: Better user experience
- **Form validation**: Real-time error handling
- **Popup dialogs**: Smooth interactions

## 🚀 Deployment

### Backend (Heroku/Railway/DigitalOcean)
```bash
# Build for production
npm run build

# Set environment variables on hosting platform
# Deploy using platform-specific commands
```

### Frontend (Netlify/Vercel/GitHub Pages)
```bash
# Build for production
npm run build

# Deploy build folder to hosting platform
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS errors**: Kiểm tra CORS configuration trong server.js
2. **Database connection**: Verify MongoDB connection string
3. **JWT errors**: Check JWT secret và token expiration
4. **Port conflicts**: Đảm bảo ports 3000 và 8888 không bị chiếm

### Debug Mode
- Backend: Xem logs trong console và MongoDB
- Frontend: Sử dụng React DevTools và Network tab

## 📄 License

MIT License - Xem file LICENSE để biết thêm chi tiết

## 👥 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra phần Troubleshooting
2. Xem API documentation tại `/api-docs`
3. Tạo issue trên GitHub repository

---

**Phát triển bởi**: Copilot
**Ngày tạo**: October 2025
**Version**: 1.0.0
