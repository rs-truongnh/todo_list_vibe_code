import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, apiUtils } from '../services/api';

// Create context
const AuthContext = createContext();

// Simple Auth Provider - NO REDUCER to avoid infinite loops
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state ONCE
  useEffect(() => {
    if (isInitialized) return;

    console.log('🔍 Auth - Initializing...');
    setIsInitialized(true);
    setIsLoading(true);

    try {
      if (apiUtils.hasToken()) {
        const storedUser = apiUtils.getUser();
        console.log('🔍 Found stored user:', storedUser);

        if (storedUser) {
          console.log('✅ Restoring user session');
          setUser(storedUser);
          setIsAuthenticated(true);
        } else {
          console.log('⚠️ No stored user data');
          apiUtils.clearTokens();
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        console.log('⚠️ No tokens found');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
      apiUtils.logout();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  // Login function
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      setError(null);

      const loginData = {
        identifier: credentials.email,
        password: credentials.password
      };

      console.log('📡 Calling login API...');
      const response = await authAPI.login(loginData);
      console.log('📡 Login response:', response);

      if (response.success) {
        const { user: userData, tokens } = response.data;

        // Save to localStorage
        apiUtils.saveTokens(tokens);
        apiUtils.saveUser(userData);

        // Update state
        setUser(userData);
        setIsAuthenticated(true);
        setError(null);

        console.log('✅ Login successful');
        return { success: true, user: userData };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setIsLoading(true);
      setError(null);

      const registerData = {
        username: userData.email.split('@')[0],
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName
      };

      const response = await authAPI.register(registerData);

      if (response.success) {
        const { user: newUser, tokens } = response.data;

        apiUtils.saveTokens(tokens);
        apiUtils.saveUser(newUser);

        setUser(newUser);
        setIsAuthenticated(true);
        setError(null);

        return { success: true, user: newUser };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local data
      apiUtils.logout();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Context value - use static object to prevent re-renders
  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
