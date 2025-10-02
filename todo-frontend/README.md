# Todo Frontend (React + Material UI)

Ứng dụng frontend cho dự án Todo, xây dựng bằng React 18 và Material UI, tích hợp xác thực JWT và dialog thêm công việc với Date/Time Picker.

## 🔧 Công nghệ
- React 18, React Router
- Material UI (@mui/material, @mui/icons-material)
- @mui/x-date-pickers + date-fns
- Axios (gọi API)

## 🚀 Tính năng chính
- Đăng nhập/Đăng ký với JWT (qua backend)
- Màn hình Home với thống kê nhanh
- Popup thêm công việc (AddTodoDialog) với Date/Time picker, priority, tags
- Protected routes (chỉ vào được sau khi đăng nhập)
- Tải lại danh sách todos sau khi tạo thành công

## 📁 Cấu trúc thư mục (rút gọn)

```
src/
	components/
		AddTodoDialog.js     # Dialog thêm công việc
		Home.js              # Dashboard chính
		Login.js, Register.js
		ProtectedRoute.js
	contexts/
		SimpleAuthContext.js # Quản lý trạng thái đăng nhập đơn giản
	services/
		api.js               # Axios client + endpoints
	App.js, index.js
```

## ⚙️ Biến môi trường
Tạo file `.env` trong thư mục `todo-frontend/` với nội dung:

```
REACT_APP_API_URL=http://localhost:8888
```

## 🏃 Cách chạy

1) Cài dependencies

```bash
npm install
```

2) Chạy app dev (mặc định http://localhost:3000)

```bash
npm start
```

Lưu ý: Hãy đảm bảo backend đang chạy ở cổng 8888 (hoặc cập nhật `REACT_APP_API_URL`).

## 📦 Build production

```bash
npm run build
```

Output sẽ nằm trong thư mục `build/`.

## 🔒 Xác thực
- Lưu trữ token trong context (`SimpleAuthContext`)
- Thêm `Authorization: Bearer <token>` cho các request qua `services/api.js`
- Tự động reload todos sau khi tạo mới thành công

## 🧩 Thành phần chính
- `AddTodoDialog`: Form tạo công việc, kiểm tra dữ liệu, chọn thời gian (DateTimePicker), tags, priority, status
- `Home`: Hiển thị danh sách, thống kê, nút mở dialog (FAB + các nút nhanh)
- `ProtectedRoute`: Chặn truy cập nếu chưa đăng nhập

## 🐞 Troubleshooting
- CORS: Nếu fetch lỗi, kiểm tra CORS ở backend
- Token hết hạn: Đăng nhập lại hoặc triển khai refresh token (nếu có)
- Hydration error tiêu đề dialog: Sử dụng text trực tiếp trong `DialogTitle` thay vì lồng `Typography` heading khác bên trong

## 📄 License
MIT
