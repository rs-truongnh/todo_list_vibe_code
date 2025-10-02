const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const connectDB = require('./config/database');
const todoRoutes = require('./routes/todoRoutes');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');
const { seedDatabase } = require('./seed');

// Load env variables
dotenv.config();

// Connect to database and run seeding
connectDB().then(() => {
  // Chạy database seeding sau khi kết nối thành công
  seedDatabase();
});

const app = express();

// CORS middleware
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logger middleware
app.use(logger);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Todo API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
  }
}));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Kiểm tra trạng thái server
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server đang hoạt động bình thường
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "🚀 Todo API Server đang hoạt động"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-10-02T10:00:00.000Z"
 *                 environment:
 *                   type: string
 *                   example: "development"
 */
// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 Todo API Server đang hoạt động',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

/**
 * @swagger
 * /:
 *   get:
 *     summary: API Information và redirect to Swagger
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Thông tin API và hướng dẫn
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "🎯 Chào mừng đến với Todo List API"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 documentation:
 *                   type: string
 *                   example: "/api-docs"
 *                 endpoints:
 *                   type: object
 */
// Default route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🎯 Chào mừng đến với Todo List API',
    version: '1.0.0',
    documentation: {
      swagger: '/api-docs',
      description: 'Interactive API Documentation với Swagger UI'
    },
    endpoints: {
      'GET /health': 'Kiểm tra trạng thái server',
      'GET /api-docs': '📚 Swagger API Documentation',
      'GET /api/todos': 'Lấy tất cả todos',
      'POST /api/todos': 'Tạo todo mới',
      'GET /api/todos/:id': 'Lấy todo theo ID',
      'PUT /api/todos/:id': 'Cập nhật todo',
      'DELETE /api/todos/:id': 'Xóa todo',
      'GET /api/todos/status/:status': 'Lấy todos theo trạng thái',
      'GET /api/todos/date-range': 'Lấy todos trong khoảng thời gian',
      'GET /api/todos/overdue': 'Lấy todos quá hạn'
    }
  });
});

// Handle undefined routes (catch-all middleware)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} không tồn tại`
  });
});

// Error handler middleware (phải đặt cuối cùng)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy ở port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Info: http://localhost:${PORT}/`);
  console.log(`📖 Swagger Docs: http://localhost:${PORT}/api-docs`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('❌ Unhandled Rejection:', err.message);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('💤 Process terminated');
  });
});

module.exports = app;
