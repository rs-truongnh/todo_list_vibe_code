import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/SimpleAuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, error, clearError, isLoading } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);

  // Redirect if already authenticated - WITH PROTECTION
  useEffect(() => {
    if (isAuthenticated && !hasRedirected) {
      console.log('🔐 Login - User authenticated, redirecting to home...');
      setHasRedirected(true);
      const from = location.state?.from?.pathname || '/home';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location, hasRedirected]);

  // Clear errors when component mounts or form data changes
  useEffect(() => {
    clearError();
    setFormErrors({});
  }, [formData, clearError]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔐 Login form submitted:', formData);

    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    console.log('✅ Form validation passed');
    setIsSubmitting(true);

    try {
      console.log('📡 Calling login API...');
      const result = await login(formData);
      console.log('📡 Login API result:', result);

      if (result.success) {
        console.log('✅ Login successful - useEffect will handle redirect');
        // Remove manual navigation - let useEffect handle it to avoid double redirect
      } else {
        console.log('❌ Login failed:', result.error);
      }
    } catch (err) {
      console.error('💥 Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle show/hide password
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  // Quick login for development (with demo accounts)
  const handleQuickLogin = async (email, password) => {
    setFormData({ email, password });
    setIsSubmitting(true);

    try {
      await login({ email, password });
    } catch (err) {
      console.error('Quick login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          padding: 4,
          width: '100%',
          maxWidth: 400,
          borderRadius: 2,
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', marginBottom: 3 }}>
          <LoginIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Đăng Nhập
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Đăng nhập vào tài khoản của bạn
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {error}
          </Alert>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Email Field */}
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              disabled={isSubmitting || isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Password Field */}
            <TextField
              fullWidth
              label="Mật khẩu"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              disabled={isSubmitting || isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePassword}
                      disabled={isSubmitting || isLoading}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting || isLoading}
              sx={{ mt: 1, py: 1.5 }}
            >
              {isSubmitting || isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Đăng Nhập'
              )}
            </Button>
          </Box>
        </form>

        {/* Development Quick Login */}
        {process.env.NODE_ENV === 'development' && (
          <>
            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Đăng nhập nhanh (Dev)
              </Typography>
            </Divider>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleQuickLogin('admin@todoapi.com', 'admin123456')}
                disabled={isSubmitting || isLoading}
              >
                Admin Account
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleQuickLogin('user1@example.com', 'password123')}
                disabled={isSubmitting || isLoading}
              >
                User 1 Account
              </Button>
            </Box>
          </>
        )}

        {/* Register Link */}
        <Box sx={{ textAlign: 'center', marginTop: 3 }}>
          <Typography variant="body2">
            Chưa có tài khoản?{' '}
            <Link
              component={RouterLink}
              to="/register"
              sx={{ textDecoration: 'none' }}
            >
              Đăng ký ngay
            </Link>
          </Typography>
        </Box>

        {/* Forgot Password Link */}
        <Box sx={{ textAlign: 'center', marginTop: 1 }}>
          <Link
            component={RouterLink}
            to="/forgot-password"
            variant="body2"
            sx={{ textDecoration: 'none' }}
          >
            Quên mật khẩu?
          </Link>
        </Box>

        {/* Debug Link (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <Box sx={{ textAlign: 'center', marginTop: 1 }}>
            <Link
              component={RouterLink}
              to="/debug"
              variant="body2"
              sx={{ textDecoration: 'none', color: 'orange' }}
            >
              🔧 API Debug Tool
            </Link>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Login;
