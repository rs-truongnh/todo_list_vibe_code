const Todo = require('../models/Todo');

// @desc    Lấy tất cả todos của user hiện tại
// @route   GET /api/todos
// @access  Private
const getTodos = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build filter object - chỉ lấy todos của user hiện tại
    const filter = { user: req.user._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort
    };

    const todos = await Todo.find(filter)
      .populate('createdBy', 'fullName email')
      .populate('assignedTo', 'fullName email')
      .populate('user', 'fullName email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Todo.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: todos.length,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      data: todos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách todos',
      error: error.message
    });
  }
};

// @desc    Lấy một todo theo ID
// @route   GET /api/todos/:id
// @access  Private
const getTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id })
      .populate('createdBy', 'fullName email')
      .populate('assignedTo', 'fullName email')
      .populate('user', 'fullName email');

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy todo với ID này hoặc bạn không có quyền truy cập'
      });
    }

    res.status(200).json({
      success: true,
      data: todo
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID không hợp lệ'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy todo',
      error: error.message
    });
  }
};

// @desc    Tạo todo mới
// @route   POST /api/todos
// @access  Private
const createTodo = async (req, res) => {
  try {
    const { title, description, startTime, endTime, status, priority, tags, assignedTo } = req.body;

    // Validate required fields
    if (!title || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Tiêu đề, thời gian bắt đầu và thời gian kết thúc là bắt buộc'
      });
    }

    // Validate dates
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Thời gian không hợp lệ'
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: 'Thời gian kết thúc phải sau thời gian bắt đầu'
      });
    }

    // Validate assignedTo user if provided
    if (assignedTo) {
      const assignedUser = await require('../models/User').findById(assignedTo);
      if (!assignedUser) {
        return res.status(400).json({
          success: false,
          message: 'Người được giao việc không tồn tại'
        });
      }
    }

    const todo = await Todo.create({
      user: assignedTo || req.user._id, // Người được giao việc hoặc chính người tạo
      createdBy: req.user._id, // Người tạo todo
      assignedTo: assignedTo || req.user._id, // Người được giao việc
      title,
      description,
      startTime: start,
      endTime: end,
      status: status || 'pending',
      priority: priority || 'medium',
      tags: tags || []
    });

    res.status(201).json({
      success: true,
      message: 'Tạo todo thành công',
      data: todo
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo todo',
      error: error.message
    });
  }
};

// @desc    Cập nhật todo
// @route   PUT /api/todos/:id
// @access  Private
const updateTodo = async (req, res) => {
  try {
    const { title, description, startTime, endTime, status, priority, tags } = req.body;

    let todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy todo với ID này hoặc bạn không có quyền truy cập'
      });
    }

    // Validate dates if provided
    if (startTime || endTime) {
      const start = startTime ? new Date(startTime) : todo.startTime;
      const end = endTime ? new Date(endTime) : todo.endTime;

      if ((startTime && isNaN(start.getTime())) || (endTime && isNaN(end.getTime()))) {
        return res.status(400).json({
          success: false,
          message: 'Thời gian không hợp lệ'
        });
      }

      if (end <= start) {
        return res.status(400).json({
          success: false,
          message: 'Thời gian kết thúc phải sau thời gian bắt đầu'
        });
      }
    }

    // Update fields
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (startTime !== undefined) updateData.startTime = new Date(startTime);
    if (endTime !== undefined) updateData.endTime = new Date(endTime);
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (tags !== undefined) updateData.tags = tags;

    todo = await Todo.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Cập nhật todo thành công',
      data: todo
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID không hợp lệ'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật todo',
      error: error.message
    });
  }
};

// @desc    Xóa todo
// @route   DELETE /api/todos/:id
// @access  Private
const deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy todo với ID này hoặc bạn không có quyền truy cập'
      });
    }

    await Todo.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Xóa todo thành công'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID không hợp lệ'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa todo',
      error: error.message
    });
  }
};

// @desc    Lấy todos theo trạng thái
// @route   GET /api/todos/status/:status
// @access  Public
const getTodosByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const todos = await Todo.findByStatus(status);

    res.status(200).json({
      success: true,
      count: todos.length,
      data: todos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy todos theo trạng thái',
      error: error.message
    });
  }
};

// @desc    Lấy todos trong khoảng thời gian
// @route   GET /api/todos/date-range
// @access  Public
const getTodosByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Cần cung cấp startDate và endDate'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Ngày tháng không hợp lệ'
      });
    }

    const todos = await Todo.findByDateRange(start, end);

    res.status(200).json({
      success: true,
      count: todos.length,
      data: todos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy todos theo khoảng thời gian',
      error: error.message
    });
  }
};

// @desc    Lấy todos quá hạn
// @route   GET /api/todos/overdue
// @access  Public
const getOverdueTodos = async (req, res) => {
  try {
    const todos = await Todo.find({
      endTime: { $lt: new Date() },
      status: { $ne: 'completed' }
    });

    res.status(200).json({
      success: true,
      count: todos.length,
      data: todos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy todos quá hạn',
      error: error.message
    });
  }
};

// @desc    Lấy todos được tạo bởi user hiện tại
// @route   GET /api/todos/created-by-me
// @access  Private
const getTodosCreatedByMe = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build filter object - todos được tạo bởi user hiện tại
    const filter = { createdBy: req.user._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const todos = await Todo.find(filter)
      .populate('createdBy', 'fullName email')
      .populate('assignedTo', 'fullName email')
      .populate('user', 'fullName email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Todo.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: todos.length,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      data: todos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách todos đã tạo',
      error: error.message
    });
  }
};

module.exports = {
  getTodos,
  getTodo,
  createTodo,
  updateTodo,
  deleteTodo,
  getTodosByStatus,
  getTodosByDateRange,
  getOverdueTodos,
  getTodosCreatedByMe
};
