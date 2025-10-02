import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Avatar,
  Chip,
  Grid,
  Card,
  CardContent,
  Fab,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Home as HomeIcon,
  Add as AddIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/SimpleAuthContext';
import { todoAPI } from '../services/api';
import AddTodoDialog from './AddTodoDialog';

const Home = () => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [todos, setTodos] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
  });
  const [hasLoadedTodos, setHasLoadedTodos] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Load todos ONLY ONCE when user is available
  useEffect(() => {
    if (user && !hasLoadedTodos) {
      console.log('🏠 Home - Loading todos for user:', user.email);
      setHasLoadedTodos(true);
      loadTodos();
    }
  }, [user, hasLoadedTodos]); // Explicit dependencies

  const loadTodos = async () => {
    try {
      const response = await todoAPI.getTodos();
      console.log('📡 API Response:', response); // Debug log

      if (response.success && response.data) {
        // Backend trả về data: todos, không phải data.todos
        const todoList = Array.isArray(response.data) ? response.data : []; // Đảm bảo todoList là array
        setTodos(todoList);

        // Calculate stats với safe check
        const stats = {
          total: todoList.length,
          completed: todoList.filter(todo => todo.status === 'completed').length,
          inProgress: todoList.filter(todo => todo.status === 'in-progress').length,
          pending: todoList.filter(todo => todo.status === 'pending').length,
        };
        setStats(stats);
      } else {
        // Nếu không có data, set empty array
        console.log('⚠️ No todos data, setting empty array');
        setTodos([]);
        setStats({
          total: 0,
          completed: 0,
          inProgress: 0,
          pending: 0,
        });
      }
    } catch (error) {
      console.error('Error loading todos:', error);
      // Trong trường hợp lỗi, đảm bảo state vẫn là array
      setTodos([]);
      setStats({
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
      });
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
  };

  const handleAddTodo = () => {
    setAddDialogOpen(true);
  };

  const handleDialogClose = () => {
    setAddDialogOpen(false);
  };

  const handleTodoCreated = async (newTodo) => {
    console.log('✅ New todo created:', newTodo);
    // Reload todos to get fresh data
    await loadTodos();
    setAddDialogOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'pending':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon />;
      case 'in-progress':
        return <ScheduleIcon />;
      case 'pending':
        return <WarningIcon />;
      default:
        return <AssignmentIcon />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* App Bar */}
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <HomeIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Todo App - Trang Chủ
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              <PersonIcon />
            </Avatar>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {user?.fullName}
            </Typography>
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
            >
              <MoreVertIcon />
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleMenuClose}>
              <PersonIcon sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} />
              Đăng xuất
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Welcome Section */}
        <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Typography variant="h4" gutterBottom>
            Xin chào, {user?.fullName}! 👋
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Hôm nay bạn có {stats.pending + stats.inProgress} công việc cần hoàn thành.
          </Typography>

          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={`${user?.role || 'User'}`}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
            <Chip
              label={`Tham gia: ${formatDate(user?.createdAt)}`}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
          </Box>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', borderLeft: '4px solid #2196f3' }}>
              <CardContent>
                <AssignmentIcon sx={{ fontSize: 40, color: '#2196f3', mb: 1 }} />
                <Typography variant="h4" color="#2196f3">
                  {stats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tổng công việc
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', borderLeft: '4px solid #4caf50' }}>
              <CardContent>
                <CheckCircleIcon sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
                <Typography variant="h4" color="#4caf50">
                  {stats.completed}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Đã hoàn thành
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', borderLeft: '4px solid #ff9800' }}>
              <CardContent>
                <ScheduleIcon sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
                <Typography variant="h4" color="#ff9800">
                  {stats.inProgress}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Đang thực hiện
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', borderLeft: '4px solid #f44336' }}>
              <CardContent>
                <WarningIcon sx={{ fontSize: 40, color: '#f44336', mb: 1 }} />
                <Typography variant="h4" color="#f44336">
                  {stats.pending}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Chờ thực hiện
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Todos */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssignmentIcon />
            Công việc gần đây
          </Typography>

          {(todos || []).length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <AssignmentIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chưa có công việc nào
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Hãy tạo công việc đầu tiên để bắt đầu quản lý task của bạn
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddTodo}>
                Tạo công việc đầu tiên
              </Button>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {(todos || []).slice(0, 6).map((todo) => (
                <Grid item xs={12} md={6} key={todo._id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                        <Typography variant="h6" component="h3">
                          {todo.title}
                        </Typography>
                        <Chip
                          icon={getStatusIcon(todo.status)}
                          label={todo.status}
                          color={getStatusColor(todo.status)}
                          size="small"
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {todo.description}
                      </Typography>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          Bắt đầu: {formatDate(todo.startDate)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Kết thúc: {formatDate(todo.endDate)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {(todos || []).length > 6 && (
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button variant="outlined">
                Xem tất cả công việc ({(todos || []).length})
              </Button>
            </Box>
          )}
        </Paper>

        {/* Quick Actions */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Hành động nhanh
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" startIcon={<AddIcon />} size="large" onClick={handleAddTodo}>
              Thêm công việc mới
            </Button>
            <Button variant="outlined" size="large">
              Xem báo cáo
            </Button>
            <Button variant="outlined" size="large">
              Cài đặt
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleAddTodo}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
        }}
      >
        <AddIcon />
      </Fab>

      {/* Add Todo Dialog */}
      <AddTodoDialog
        open={addDialogOpen}
        onClose={handleDialogClose}
        onTodoCreated={handleTodoCreated}
      />
    </Box>
  );
};

export default Home;
