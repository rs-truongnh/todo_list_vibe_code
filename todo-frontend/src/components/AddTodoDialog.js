import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  Chip,
  IconButton,
  Typography,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
import { todoAPI } from '../services/api';

const AddTodoDialog = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: new Date(),
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default 1 day later
    status: 'pending',
    priority: 'medium',
    tags: [],
  });

  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});

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

  // Handle date change
  const handleDateChange = (name, newValue) => {
    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }));

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Add tag
  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Tiêu đề là bắt buộc';
    } else if (formData.title.length > 200) {
      errors.title = 'Tiêu đề không được vượt quá 200 ký tự';
    }

    if (formData.description && formData.description.length > 1000) {
      errors.description = 'Mô tả không được vượt quá 1000 ký tự';
    }

    if (!formData.startTime) {
      errors.startTime = 'Thời gian bắt đầu là bắt buộc';
    }

    if (!formData.endTime) {
      errors.endTime = 'Thời gian kết thúc là bắt buộc';
    }

    if (formData.startTime && formData.endTime && formData.endTime <= formData.startTime) {
      errors.endTime = 'Thời gian kết thúc phải sau thời gian bắt đầu';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      console.log('📝 Creating todo:', formData);
      const response = await todoAPI.createTodo({
        title: formData.title,
        description: formData.description,
        startTime: formData.startTime.toISOString(),
        endTime: formData.endTime.toISOString(),
        status: formData.status,
        priority: formData.priority,
        tags: formData.tags,
      });

      if (response.success) {
        console.log('✅ Todo created successfully');
        onSuccess && onSuccess(response.data);
        handleClose();
      } else {
        setError(response.message || 'Tạo công việc thất bại');
      }
    } catch (err) {
      console.error('❌ Create todo error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Tạo công việc thất bại';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle close
  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        title: '',
        description: '',
        startTime: new Date(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'pending',
        priority: 'medium',
        tags: [],
      });
      setNewTag('');
      setError('');
      setFormErrors({});
      onClose();
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          Thêm Công Việc Mới
          <IconButton onClick={handleClose} disabled={isSubmitting}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 2 }}>
            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Title */}
              <TextField
                fullWidth
                label="Tiêu đề công việc *"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                error={!!formErrors.title}
                helperText={formErrors.title}
                disabled={isSubmitting}
                inputProps={{ maxLength: 200 }}
              />

              {/* Description */}
              <TextField
                fullWidth
                label="Mô tả chi tiết"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                error={!!formErrors.description}
                helperText={formErrors.description}
                disabled={isSubmitting}
                multiline
                rows={3}
                inputProps={{ maxLength: 1000 }}
              />

              {/* Date Time Row */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <DateTimePicker
                    label="Thời gian bắt đầu *"
                    value={formData.startTime}
                    onChange={(newValue) => handleDateChange('startTime', newValue)}
                    disabled={isSubmitting}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!formErrors.startTime}
                        helperText={formErrors.startTime}
                      />
                    )}
                  />
                </Box>

                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <DateTimePicker
                    label="Thời gian kết thúc *"
                    value={formData.endTime}
                    onChange={(newValue) => handleDateChange('endTime', newValue)}
                    disabled={isSubmitting}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!formErrors.endTime}
                        helperText={formErrors.endTime}
                      />
                    )}
                  />
                </Box>
              </Box>

              {/* Status and Priority Row */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    label="Trạng thái"
                  >
                    <MenuItem value="pending">Chờ thực hiện</MenuItem>
                    <MenuItem value="in-progress">Đang thực hiện</MenuItem>
                    <MenuItem value="completed">Hoàn thành</MenuItem>
                    <MenuItem value="cancelled">Đã hủy</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Độ ưu tiên</InputLabel>
                  <Select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    label="Độ ưu tiên"
                  >
                    <MenuItem value="low">Thấp</MenuItem>
                    <MenuItem value="medium">Trung bình</MenuItem>
                    <MenuItem value="high">Cao</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Tags */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Tags
                </Typography>

                {/* Add tag input */}
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    size="small"
                    label="Thêm tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    disabled={isSubmitting}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddTag}
                    disabled={isSubmitting || !newTag.trim()}
                    startIcon={<AddIcon />}
                  >
                    Thêm
                  </Button>
                </Box>

                {/* Display tags */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {formData.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      disabled={isSubmitting}
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{ minWidth: 100 }}
            >
              {isSubmitting ? 'Đang tạo...' : 'Tạo công việc'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
};

export default AddTodoDialog;
