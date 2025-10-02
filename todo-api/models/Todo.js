const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Todo phải thuộc về một user']
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Todo phải có người tạo']
  },
  assignedTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: [true, 'Tiêu đề công việc là bắt buộc'],
    trim: true,
    maxlength: [200, 'Tiêu đề không được vượt quá 200 ký tự']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Mô tả không được vượt quá 1000 ký tự']
  },
  startTime: {
    type: Date,
    required: [true, 'Thời gian bắt đầu là bắt buộc']
  },
  endTime: {
    type: Date,
    required: [true, 'Thời gian kết thúc là bắt buộc'],
    validate: {
      validator: function (value) {
        return value > this.startTime;
      },
      message: 'Thời gian kết thúc phải sau thời gian bắt đầu'
    }
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['pending', 'in-progress', 'completed', 'cancelled'],
      message: 'Trạng thái phải là: pending, in-progress, completed, hoặc cancelled'
    },
    default: 'pending'
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high'],
      message: 'Độ ưu tiên phải là: low, medium, hoặc high'
    },
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Tự động tạo createdAt và updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field để tính duration
todoSchema.virtual('duration').get(function () {
  if (this.startTime && this.endTime) {
    return Math.ceil((this.endTime - this.startTime) / (1000 * 60 * 60)); // Trả về số giờ
  }
  return 0;
});

// Index để tối ưu hóa truy vấn
todoSchema.index({ user: 1, status: 1 });
todoSchema.index({ user: 1, startTime: 1 });
todoSchema.index({ user: 1, endTime: 1 });
todoSchema.index({ user: 1, createdAt: -1 });
todoSchema.index({ status: 1 });
todoSchema.index({ startTime: 1 });
todoSchema.index({ endTime: 1 });
todoSchema.index({ createdAt: -1 });

// Pre-save middleware để cập nhật updatedAt
todoSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Instance method để check if todo is overdue
todoSchema.methods.isOverdue = function () {
  return this.endTime < new Date() && this.status !== 'completed';
};

// Static method để tìm todos theo status
todoSchema.statics.findByStatus = function (status) {
  return this.find({ status });
};

// Static method để tìm todos trong khoảng thời gian
todoSchema.statics.findByDateRange = function (startDate, endDate) {
  return this.find({
    $or: [
      { startTime: { $gte: startDate, $lte: endDate } },
      { endTime: { $gte: startDate, $lte: endDate } },
      { startTime: { $lte: startDate }, endTime: { $gte: endDate } }
    ]
  });
};

module.exports = mongoose.model('Todo', todoSchema);
