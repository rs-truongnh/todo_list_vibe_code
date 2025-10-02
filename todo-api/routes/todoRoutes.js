const express = require('express');
const {
  getTodos,
  getTodo,
  createTodo,
  updateTodo,
  deleteTodo,
  getTodosByStatus,
  getTodosByDateRange,
  getOverdueTodos,
  getTodosCreatedByMe
} = require('../controllers/todoController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Áp dụng authentication cho tất cả todo routes
router.use(authenticateToken);

/**
 * @swagger
 * /api/todos:
 *   get:
 *     summary: Lấy danh sách tất cả todos
 *     tags: [Todos]
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/sortBy'
 *       - $ref: '#/components/parameters/sortOrder'
 *       - $ref: '#/components/parameters/statusFilter'
 *       - $ref: '#/components/parameters/priorityFilter'
 *     responses:
 *       200:
 *         description: Danh sách todos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   post:
 *     summary: Tạo todo mới
 *     tags: [Todos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTodoRequest'
 *     responses:
 *       201:
 *         description: Todo được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/todos/{id}:
 *   get:
 *     summary: Lấy todo theo ID
 *     tags: [Todos]
 *     parameters:
 *       - $ref: '#/components/parameters/todoId'
 *     responses:
 *       200:
 *         description: Thông tin todo
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Todo'
 *       404:
 *         description: Không tìm thấy todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: ID không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     summary: Cập nhật todo
 *     tags: [Todos]
 *     parameters:
 *       - $ref: '#/components/parameters/todoId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTodoRequest'
 *     responses:
 *       200:
 *         description: Todo được cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Todo'
 *       404:
 *         description: Không tìm thấy todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     summary: Xóa todo
 *     tags: [Todos]
 *     parameters:
 *       - $ref: '#/components/parameters/todoId'
 *     responses:
 *       200:
 *         description: Todo được xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Không tìm thấy todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: ID không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/todos/status/{status}:
 *   get:
 *     summary: Lấy todos theo trạng thái
 *     tags: [Special Queries]
 *     parameters:
 *       - $ref: '#/components/parameters/status'
 *     responses:
 *       200:
 *         description: Danh sách todos theo trạng thái
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Todo'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/todos/date-range:
 *   get:
 *     summary: Lấy todos trong khoảng thời gian
 *     tags: [Special Queries]
 *     parameters:
 *       - $ref: '#/components/parameters/startDate'
 *       - $ref: '#/components/parameters/endDate'
 *     responses:
 *       200:
 *         description: Danh sách todos trong khoảng thời gian
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Tham số ngày tháng không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/todos/overdue:
 *   get:
 *     summary: Lấy danh sách todos quá hạn
 *     tags: [Special Queries]
 *     responses:
 *       200:
 *         description: Danh sách todos quá hạn
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Todo'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/todos/created-by-me:
 *   get:
 *     summary: Lấy danh sách todos được tạo bởi user hiện tại
 *     tags: [User Queries]
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/sortBy'
 *       - $ref: '#/components/parameters/sortOrder'
 *       - $ref: '#/components/parameters/statusFilter'
 *       - $ref: '#/components/parameters/priorityFilter'
 *     responses:
 *       200:
 *         description: Danh sách todos được tạo bởi user
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     count:
 *                       type: number
 *                       example: 10
 *                     total:
 *                       type: number
 *                       example: 25
 *                     currentPage:
 *                       type: number
 *                       example: 1
 *                     totalPages:
 *                       type: number
 *                       example: 3
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Todo'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// Routes cơ bản
router.route('/')
  .get(getTodos)      // GET /api/todos - Lấy tất cả todos
  .post(createTodo);  // POST /api/todos - Tạo todo mới

// Routes đặc biệt (phải đặt trước route /:id)
router.get('/status/:status', getTodosByStatus);   // GET /api/todos/status/:status
router.get('/date-range', getTodosByDateRange);    // GET /api/todos/date-range
router.get('/overdue', getOverdueTodos);           // GET /api/todos/overdue
router.get('/created-by-me', getTodosCreatedByMe); // GET /api/todos/created-by-me

// Routes với ID
router.route('/:id')
  .get(getTodo)       // GET /api/todos/:id - Lấy một todo
  .put(updateTodo)    // PUT /api/todos/:id - Cập nhật todo
  .delete(deleteTodo); // DELETE /api/todos/:id - Xóa todo

module.exports = router;
