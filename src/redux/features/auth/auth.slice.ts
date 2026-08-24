import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IUpdateProfileData, IUpdateRoleData, IUser, IUserState } from "./auth.types";
import api from "@/lib/axios";
import { AxiosError } from "axios";

// Initial state
const initialState: IUserState = {
  currentUser: null,
  users: [],
  selectedUser: null,
  loading: true,
  usersLoading: false,
  error: null,
  totalCount: 0,
};

// ============= Async Thunks =============

// Get current logged-in user
export const getCurrentUser = createAsyncThunk(
  'user/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me');
      return response.data.user as IUser;
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || 'Failed to fetch current user';
        return rejectWithValue(message);
      }
      return rejectWithValue('Failed to fetch current user');
    }
  }
);

// Update own profile
export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (data: IUpdateProfileData, { rejectWithValue }) => {
    try {
      const response = await api.put('/auth/me', data);
      return response.data.user as IUser;
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || 'Failed to update profile';
        return rejectWithValue(message);
      }
      return rejectWithValue('Failed to update profile');
    }
  }
);

// Get all users (admin only)
export const getAllUsers = createAsyncThunk(
  'user/getAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth');
      return {
        users: response.data.users as IUser[],
        count: response.data.count as number,
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || 'Failed to fetch users';
        return rejectWithValue(message);
      }
      return rejectWithValue('Failed to fetch users');
    }
  }
);

// Get user by id (admin only)
export const getUserById = createAsyncThunk(
  'user/getUserById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/auth/${id}`);
      return response.data.user as IUser;
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || 'User not found';
        return rejectWithValue(message);
      }
      return rejectWithValue('User not found');
    }
  }
);

// Update user role (admin only)
export const updateUserRole = createAsyncThunk(
  'user/updateUserRole',
  async ({ id, role }: IUpdateRoleData, { rejectWithValue }) => {
    try {
      const response = await api.put(`/auth/${id}/role`, { role });
      return response.data.user as IUser;
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || 'Failed to update role';
        return rejectWithValue(message);
      }
      return rejectWithValue('Failed to update role');
    }
  }
);

// Delete user (admin only)
export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/auth/${id}`);
      return id;
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || 'Failed to delete user';
        return rejectWithValue(message);
      }
      return rejectWithValue('Failed to delete user');
    }
  }
);

// ============= Slice =============

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Clear error message
    clearError: (state) => {
      state.error = null;
    },

    // Clear selected user
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },

    // Clear all user data (for logout)
    clearUserData: (state) => {
      state.currentUser = null;
      state.users = [];
      state.selectedUser = null;
      state.loading = false;
      state.usersLoading = false;
      state.error = null;
      state.totalCount = 0;
    },

    // Set current user manually
    setCurrentUser: (state, action: PayloadAction<IUser | null>) => {
      state.currentUser = action.payload;
      state.loading = false;
    },
  },

  extraReducers: (builder) => {
    builder
      // ============= Get Current User (session) =============
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action: PayloadAction<IUser>) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.currentUser = null;
      })

      // ============= Update Profile (session) =============
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<IUser>) => {
        state.loading = false;
        state.currentUser = action.payload;

        const index = state.users.findIndex(u => u._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }

        if (state.selectedUser?._id === action.payload._id) {
          state.selectedUser = action.payload;
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ============= Get All Users (admin — separate loading) =============
      .addCase(getAllUsers.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload.users;
        state.totalCount = action.payload.count;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload as string;
      })

      // ============= Get User By ID (admin — separate loading) =============
      .addCase(getUserById.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
      })
      .addCase(getUserById.fulfilled, (state, action: PayloadAction<IUser>) => {
        state.usersLoading = false;
        state.selectedUser = action.payload;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload as string;
        state.selectedUser = null;
      })

      // ============= Update User Role (admin — separate loading) =============
      .addCase(updateUserRole.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action: PayloadAction<IUser>) => {
        state.usersLoading = false;

        const index = state.users.findIndex(u => u._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }

        if (state.selectedUser?._id === action.payload._id) {
          state.selectedUser = action.payload;
        }

        if (state.currentUser?._id === action.payload._id) {
          state.currentUser = action.payload;
        }
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload as string;
      })

      // ============= Delete User (admin — separate loading) =============
      .addCase(deleteUser.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.usersLoading = false;

        state.users = state.users.filter(u => u._id !== action.payload);
        state.totalCount -= 1;

        if (state.selectedUser?._id === action.payload) {
          state.selectedUser = null;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  clearError,
  clearSelectedUser,
  clearUserData,
  setCurrentUser,
} = userSlice.actions;

// Export reducer
export default userSlice.reducer;