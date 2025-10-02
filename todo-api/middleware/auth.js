const { verifyToken } = require('../config/jwt');
const User = require('../models/User');

// Middleware để verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    let token;

    // Lấy token từ Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Kiểm tra token có tồn tại không
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token không được cung cấp'
      });
    }

    try {
      // Verify token
      const decoded = verifyToken(token);

      // Kiểm tra type của token
      if (decoded.type !== 'access') {
        return res.status(401).json({
          success: false,
          message: 'Token type không hợp lệ'
        });
      }

      // Tìm user từ decoded token
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User không tồn tại'
        });
      }

      // Kiểm tra user có active không
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Tài khoản đã bị vô hiệu hóa'
        });
      }

      // Attach user to request object
      req.user = user;
      req.token = token;
      next();

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token đã hết hạn',
          code: 'TOKEN_EXPIRED'
        });
      }

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Token không hợp lệ',
          code: 'INVALID_TOKEN'
        });
      }

      throw error;
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xác thực token',
      error: error.message
    });
  }
};

// Middleware để kiểm tra role (optional)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Cần đăng nhập để truy cập'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }

    next();
  };
};

// Middleware optional authentication (không bắt buộc phải có token)
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = verifyToken(token);
        if (decoded.type === 'access') {
          const user = await User.findById(decoded.userId);
          if (user && user.isActive) {
            req.user = user;
            req.token = token;
          }
        }
      } catch (error) {
        // Ignore token errors in optional auth
        console.log('Optional auth token error:', error.message);
      }
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  authenticateToken,
  authorize,
  optionalAuth
};
