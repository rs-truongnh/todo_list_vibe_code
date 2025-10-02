const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username là bắt buộc'],
    unique: true,
    trim: true,
    minlength: [3, 'Username phải có ít nhất 3 ký tự'],
    maxlength: [20, 'Username không được vượt quá 20 ký tự'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username chỉ được chứa chữ cái, số và dấu gạch dưới']
  },
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Email không hợp lệ'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password là bắt buộc'],
    minlength: [6, 'Password phải có ít nhất 6 ký tự'],
    select: false // Không trả về password khi query user
  },
  fullName: {
    type: String,
    trim: true,
    maxlength: [50, 'Họ tên không được vượt quá 50 ký tự']
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  refreshTokens: [{
    token: String,
    createdAt: {
      type: Date,
      default: Date.now,
      expires: '7d' // Refresh token expires in 7 days
    }
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
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      delete ret.password;
      delete ret.refreshTokens;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes để tối ưu hóa truy vấn
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });

// Virtual field để đếm số todos
userSchema.virtual('todoCount', {
  ref: 'Todo',
  localField: '_id',
  foreignField: 'user',
  count: true
});

// Pre-save middleware để hash password
userSchema.pre('save', async function (next) {
  // Chỉ hash password nếu nó được modify
  if (!this.isModified('password')) return next();

  try {
    // Hash password với cost factor 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware để cập nhật updatedAt
userSchema.pre('save', function (next) {
  if (!this.isNew) {
    this.updatedAt = new Date();
  }
  next();
});

// Instance method để so sánh password
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Error comparing password');
  }
};

// Instance method để tạo user object an toàn (không có sensitive data)
userSchema.methods.toSafeObject = function () {
  const user = this.toObject();
  delete user.password;
  delete user.refreshTokens;
  delete user.__v;
  return user;
};

// Static method để tìm user theo email hoặc username
userSchema.statics.findByEmailOrUsername = function (identifier) {
  return this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier }
    ]
  }).select('+password');
};

// Static method để tìm user active
userSchema.statics.findActive = function (query = {}) {
  return this.find({ ...query, isActive: true });
};

// Instance method để cập nhật last login
userSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  return this.save();
};

// Instance method để add refresh token
userSchema.methods.addRefreshToken = function (token) {
  // Giữ tối đa 5 refresh tokens
  if (this.refreshTokens.length >= 5) {
    this.refreshTokens.shift(); // Xóa token cũ nhất
  }

  this.refreshTokens.push({
    token,
    createdAt: new Date()
  });

  return this.save();
};

// Instance method để remove refresh token
userSchema.methods.removeRefreshToken = function (token) {
  this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token);
  return this.save();
};

// Instance method để clear all refresh tokens
userSchema.methods.clearRefreshTokens = function () {
  this.refreshTokens = [];
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
