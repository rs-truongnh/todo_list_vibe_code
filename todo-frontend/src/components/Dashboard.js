import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Avatar,
  Chip,
  Grid,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h6">Đang tải...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <Paper
        elevation={2}
        sx={{
          padding: 2,
          borderRadius: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <DashboardIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h5" component="h1">
            Todo Dashboard
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="subtitle1">{user?.fullName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ ml: 2 }}
          >
            Đăng xuất
          </Button>
        </Box>
      </Paper>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Chào mừng, {user?.fullName}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quản lý công việc của bạn một cách hiệu quả với Todo App.
          </Typography>

          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Chip
              label={`Role: ${user?.role || 'User'}`}
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`Tham gia: ${new Date(user?.createdAt).toLocaleDateString('vi-VN')}`}
              color="secondary"
              variant="outlined"
            />
          </Box>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <AssignmentIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Tổng công việc
              </Typography>
              <Typography variant="h4" color="primary">
                0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Chưa có công việc nào
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <AssignmentIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Hoàn thành
              </Typography>
              <Typography variant="h4" color="success.main">
                0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Công việc đã hoàn thành
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <AssignmentIcon sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Đang thực hiện
              </Typography>
              <Typography variant="h4" color="warning.main">
                0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Công việc đang làm
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Hành động nhanh
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" size="large">
              Thêm công việc mới
            </Button>
            <Button variant="outlined" size="large">
              Xem tất cả công việc
            </Button>
            <Button variant="outlined" size="large">
              Báo cáo tiến độ
            </Button>
          </Box>
        </Paper>

        {/* User Info Debug (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <Paper sx={{ p: 3, mt: 3, bgcolor: '#f0f0f0' }}>
            <Typography variant="h6" gutterBottom>
              Debug Info (Development)
            </Typography>
            <pre style={{ fontSize: '12px', overflow: 'auto' }}>
              {JSON.stringify(user, null, 2)}
            </pre>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default Dashboard;
