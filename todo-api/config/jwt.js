const jwt = require('jsonwebtoken');

// Generate JWT Access Token
const generateAccessToken = (userId, username, email) => {
  return jwt.sign(
    {
      userId,
      username,
      email,
      type: 'access'
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '15m', // Default 15 minutes
      issuer: 'todo-api',
      audience: 'todo-app'
    }
  );
};

// Generate JWT Refresh Token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    {
      userId,
      type: 'refresh'
    },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d', // Default 7 days
      issuer: 'todo-api',
      audience: 'todo-app'
    }
  );
};

// Verify JWT Token
const verifyToken = (token, isRefreshToken = false) => {
  const secret = isRefreshToken
    ? (process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET)
    : process.env.JWT_SECRET;

  return jwt.verify(token, secret);
};

// Generate both tokens
const generateTokens = (user) => {
  const accessToken = generateAccessToken(user._id, user.username, user.email);
  const refreshToken = generateRefreshToken(user._id);

  return {
    accessToken,
    refreshToken,
    expiresIn: process.env.JWT_EXPIRE || '15m'
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  generateTokens
};
