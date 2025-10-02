import React, { useState } from 'react';
import { Box, Paper, Button, Typography, Alert, TextField, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import axios from 'axios';

const ApiDebug = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiUrl, setApiUrl] = useState('http://localhost:8888');

  const testConnection = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      // Test basic connection
      const response = await axios.get(`${apiUrl}/health`);
      setTestResult({
        type: 'success',
        message: 'API connection successful!',
        data: response.data,
        status: response.status
      });
    } catch (error) {
      setTestResult({
        type: 'error',
        message: 'API connection failed!',
        error: error.message,
        details: error.response?.data || 'No response data',
        status: error.response?.status || 'No status'
      });
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      const response = await axios.post(`${apiUrl}/api/auth/login`, {
        email: 'admin@todoapi.com',
        password: 'admin123456'
      });

      setTestResult({
        type: 'success',
        message: 'Login test successful!',
        data: response.data,
        status: response.status
      });
    } catch (error) {
      setTestResult({
        type: 'error',
        message: 'Login test failed!',
        error: error.message,
        details: error.response?.data || 'No response data',
        status: error.response?.status || 'No status'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      {/* Back to Login */}
      <Box sx={{ mb: 2 }}>
        <Button
          component={RouterLink}
          to="/login"
          startIcon={<ArrowBack />}
          variant="outlined"
        >
          Quay lại Login
        </Button>
      </Box>

      <Typography variant="h4" gutterBottom>
        API Debug Tool
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          API Configuration
        </Typography>

        <TextField
          fullWidth
          label="API Base URL"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            onClick={testConnection}
            disabled={loading}
          >
            Test Connection
          </Button>
          <Button
            variant="outlined"
            onClick={testLogin}
            disabled={loading}
          >
            Test Login
          </Button>
        </Box>

        {loading && (
          <Alert severity="info">Testing API connection...</Alert>
        )}

        {testResult && (
          <Alert severity={testResult.type} sx={{ mt: 2 }}>
            <Typography variant="h6">{testResult.message}</Typography>
            <Typography variant="body2">Status: {testResult.status}</Typography>
            {testResult.error && (
              <Typography variant="body2">Error: {testResult.error}</Typography>
            )}
            <pre style={{ marginTop: 10, fontSize: 12, overflow: 'auto' }}>
              {JSON.stringify(testResult.data || testResult.details, null, 2)}
            </pre>
          </Alert>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Environment Info
        </Typography>
        <Typography variant="body2">
          REACT_APP_API_URL: {process.env.REACT_APP_API_URL || 'Not set'}
        </Typography>
        <Typography variant="body2">
          Current API URL: {apiUrl}
        </Typography>
        <Typography variant="body2">
          NODE_ENV: {process.env.NODE_ENV}
        </Typography>
      </Paper>
    </Box>
  );
};

export default ApiDebug;
