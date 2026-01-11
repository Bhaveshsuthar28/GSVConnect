import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Base URL configuration - change localhost:2804 to your backend URL if different
const API_URL = import.meta.env.VITE_BASE_URL;

// Async Thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password, role }, { rejectWithValue }) => {
    try {
      // Determine endpoint based on role (student or alumni)
      // Defaulting to student if not specified, but UI should support both
      const endpoint = role === 'alumni' ? `${API_URL}/alumni/login` : `${API_URL}/students/login`;
      
      const response = await axios.post(endpoint, { email, password });
      
      // Store token in localStorage
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('userRole', role);
      
      return { ...response.data, role };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ name, email, password, role }, { rejectWithValue }) => {
    try {
      const endpoint = role === 'alumni' ? `${API_URL}/alumni/register` : `${API_URL}/students/register`;
      const response = await axios.post(endpoint, { name, email, password });
      return { ...response.data, email, role }; // Return email for OTP step
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ email, otp, role }, { rejectWithValue }) => {
    try {
      const endpoint = role === 'alumni' ? `${API_URL}/alumni/verify-email` : `${API_URL}/students/verify-email`;
      const response = await axios.post(endpoint, { email, otp });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'OTP verification failed');
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const role = auth.role || localStorage.getItem('userRole') || 'student';
      // Token might be in cookie now, so we don't strict check localStorage for token
      const token = localStorage.getItem('accessToken');
      
      const config = {
        withCredentials: true // Important for cookies
      };

      if (token) {
        config.headers = { Authorization: `Bearer ${token}` };
      }

      const endpoint = role === 'alumni' ? `${API_URL}/alumni/profile` : `${API_URL}/students/profile`;
      
      const response = await axios.get(endpoint, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (formData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const role = auth.role || localStorage.getItem('userRole') || 'student';
      const endpoint = role === 'alumni' ? `${API_URL}/alumni/profile` : `${API_URL}/students/profile`;
      
      const response = await axios.patch(endpoint, formData, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Update failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
       console.error("Logout failed at backend", error);
    } finally {
       dispatch(logout()); 
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,
  role: localStorage.getItem('userRole') || 'student', // 'student' or 'alumni'
  registrationStep: 'register', // 'register' or 'otp'
  lastRegisteredEmail: null, // to pre-fill OTP email
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userRole');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.role = 'student';
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
    resetRegistration: (state) => {
        state.registrationStep = 'register';
        state.lastRegisteredEmail = null;
    }
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.accessToken;
        state.role = action.payload.role;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.registrationStep = 'otp';
        state.lastRegisteredEmail = action.payload.email;
        state.role = action.payload.role;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Verify OTP
    builder
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.registrationStep = 'completed'; 
        
        // Auto-login if tokens are returned
        if (action.payload.accessToken) {
            state.isAuthenticated = true;
            state.token = action.payload.accessToken;
            localStorage.setItem('accessToken', action.payload.accessToken);
            localStorage.setItem('refreshToken', action.payload.refreshToken);
        }
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Profile 
    builder
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true; // Set authenticated if profile fetch succeeds (via cookie)
        // Ensure role matches what we fetched or determined
        if (action.payload.role) { // Assuming backend sends role, otherwise we trust state
            state.role = action.payload.role; 
            localStorage.setItem('userRole', action.payload.role);
        }
      })
      .addCase(fetchProfile.rejected, (state) => {
          // If profile fetch fails (401), we are not authenticated.
          state.isAuthenticated = false;
          state.user = null;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, setRole, resetRegistration } = authSlice.actions;
export default authSlice.reducer;
