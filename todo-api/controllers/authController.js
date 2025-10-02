const User = require('../models/User');
const { generateTokens, verifyToken } = require('../config/jwt');

// @desc    Đăng ký user mới
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email và password là bắt buộc'
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmailOrUsername(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email hoặc username đã được sử dụng'
      });
    }

    // Create new user
    const user = await User.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password,
      fullName: fullName?.trim()
    });

    // Generate tokens
    const tokens = generateTokens(user);

    // Save refresh token to user
    await user.addRefreshToken(tokens.refreshToken);

    // Update last login
    await user.updateLastLogin();

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        user: user.toSafeObject(),
        tokens
      }
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

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} đã được sử dụng`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng ký',
      error: error.message
    });
  }
};

// @desc    Đăng nhập
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier có thể là email hoặc username

    // Validate required fields
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/Username và password là bắt buộc'
      });
    }

    // Find user by email or username
    const user = await User.findByEmailOrUsername(identifier);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Thông tin đăng nhập không chính xác'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản đã bị vô hiệu hóa'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Thông tin đăng nhập không chính xác'
      });
    }

    // Generate tokens
    const tokens = generateTokens(user);

    // Save refresh token to user
    await user.addRefreshToken(tokens.refreshToken);

    // Update last login
    await user.updateLastLogin();

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        user: user.toSafeObject(),
        tokens
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng nhập',
      error: error.message
    });
  }
};

// @desc    Refresh Access Token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token là bắt buộc'
      });
    }

    // Verify refresh token
    const decoded = verifyToken(token, true);

    // Find user and check if refresh token exists
    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshTokens.some(rt => rt.token === token)) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token không hợp lệ'
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    // Replace old refresh token with new one
    await user.removeRefreshToken(token);
    await user.addRefreshToken(tokens.refreshToken);

    res.status(200).json({
      success: true,
      message: 'Token đã được làm mới',
      data: {
        tokens
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token không hợp lệ hoặc đã hết hạn'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server khi refresh token',
      error: error.message
    });
  }
};

// @desc    Đăng xuất
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    const user = req.user; // Từ middleware authentication

    if (token) {
      // Remove specific refresh token
      await user.removeRefreshToken(token);
    } else {
      // Clear all refresh tokens (logout from all devices)
      await user.clearRefreshTokens();
    }

    res.status(200).json({
      success: true,
      message: 'Đăng xuất thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng xuất',
      error: error.message
    });
  }
};

// @desc    Lấy thông tin user hiện tại
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = req.user; // Từ middleware authentication

    // Populate todo count
    const userWithStats = await User.findById(user._id).populate('todoCount');

    res.status(200).json({
      success: true,
      data: {
        user: userWithStats.toSafeObject()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin user',
      error: error.message
    });
  }
};

// @desc    Cập nhật thông tin user
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { fullName, email, username } = req.body;
    const user = req.user;

    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (email !== undefined) updateData.email = email.toLowerCase();
    if (username !== undefined) updateData.username = username;

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Cập nhật profile thành công',
      data: {
        user: updatedUser.toSafeObject()
      }
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

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} đã được sử dụng`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật profile',
      error: error.message
    });
  }
};

// @desc    Đổi password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password hiện tại và password mới là bắt buộc'
      });
    }

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Password hiện tại không chính xác'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Clear all refresh tokens để force logout all devices
    await user.clearRefreshTokens();

    res.status(200).json({
      success: true,
      message: 'Đổi password thành công. Vui lòng đăng nhập lại.'
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Password mới không hợp lệ',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đổi password',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  changePassword
};
