import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { authAPI, apiUtils } from '../services/api';

// Auth states
const AUTH_STATES = {
  LOADING: 'LOADING',
  AUTHENTICATED: 'AUTHENTICATED',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  ERROR: 'ERROR',
};

// Auth actions
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
};

// Initial state
const initialState = {
  user: null,
  status: AUTH_STATES.LOADING,
  error: null,
  isAuthenticated: false,
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        status: AUTH_STATES.LOADING,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        status: AUTH_STATES.AUTHENTICATED,
        isAuthenticated: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        status: AUTH_STATES.UNAUTHENTICATED,
        isAuthenticated: false,
        error: null,
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        status: AUTH_STATES.ERROR,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Check if user is already logged in - ONLY ONCE
  useEffect(() => {
    if (hasInitialized) return; // Prevent multiple runs

    console.log('🔍 Auth check - initializing...');
    setHasInitialized(true);

    // Check if tokens exist in localStorage
    if (apiUtils.hasToken()) {
      const storedUser = apiUtils.getUser();
      console.log('🔍 Found stored user:', storedUser);

      if (storedUser) {
        console.log('✅ Using stored user data');
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user: storedUser },
        });
      } else {
        console.log('⚠️ Has token but no user data');
        apiUtils.logout();
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    } else {
      console.log('⚠️ No token found');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  }, [hasInitialized]); // Only depend on hasInitialized flag  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      // Transform credentials để match backend API
      const loginData = {
        identifier: credentials.email, // Backend expect 'identifier' instead of 'email'
        password: credentials.password
      };

      console.log('📡 Calling login API with:', loginData);
      const response = await authAPI.login(loginData);
      console.log('📡 Login response:', response);

      if (response.success) {
        const { user, tokens } = response.data;

        // Save tokens and user to localStorage
        apiUtils.saveTokens(tokens);
        apiUtils.saveUser(user);

        console.log('✅ Login successful, dispatching LOGIN_SUCCESS');
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user },
        });

        console.log('✅ Login process completed');
        return { success: true, user };
      } else {
        throw new Error(response.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.log('❌ Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Đăng nhập thất bại';
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      // Transform userData để match backend API
      const registerData = {
        username: userData.email.split('@')[0], // Tạo username từ email
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName
      };

      const response = await authAPI.register(registerData);

      if (response.success) {
        const { user, tokens } = response.data;

        // Save tokens and user to localStorage
        apiUtils.saveTokens(tokens);
        apiUtils.saveUser(user);

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user },
        });

        return { success: true, user };
      } else {
        throw new Error(response.message || 'Đăng ký thất bại');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Đăng ký thất bại';
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
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
      // Always clear local data regardless of API call result
      apiUtils.logout();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);

      if (response.success) {
        const updatedUser = response.data.user;

        // Update user in localStorage
        apiUtils.saveUser(updatedUser);

        dispatch({
          type: AUTH_ACTIONS.UPDATE_USER,
          payload: updatedUser,
        });

        return { success: true, user: updatedUser };
      } else {
        throw new Error(response.message || 'Cập nhật profile thất bại');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Cập nhật profile thất bại';
      return { success: false, error: errorMessage };
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      const response = await authAPI.changePassword(passwordData);

      if (response.success) {
        return { success: true, message: response.message };
      } else {
        throw new Error(response.message || 'Đổi mật khẩu thất bại');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Đổi mật khẩu thất bại';
      return { success: false, error: errorMessage };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Context value
  const value = {
    // State
    user: state.user,
    status: state.status,
    error: state.error,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.status === AUTH_STATES.LOADING,

    // Actions
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,

    // Auth states for comparison
    AUTH_STATES,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

// HOC for protected routes
export const withAuth = (WrappedComponent) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return <div>Loading...</div>; // You can replace with a proper loading component
    }

    if (!isAuthenticated) {
      return <div>Access Denied</div>; // You can replace with redirect to login
    }

    return <WrappedComponent {...props} />;
  };
};

export default AuthContext;
