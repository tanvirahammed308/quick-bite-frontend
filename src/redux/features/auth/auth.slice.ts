import { IUserState } from "./auth.types";



// Initial state
const initialState: IUserState = {
  currentUser: null,
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
  totalCount: 0,
};

// ============= Async Thunks =============

// Get current logged-in user
export const getCurrentUser = createAsyncThunk(
  'user/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/me');
      return response.data.user as IUser;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get user');
    }
  }
);

// Update own profile
export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (data: IUpdateProfileData, { rejectWithValue }) => {
    try {
      const response = await api.put('/users/profile', data);
      return response.data.user as IUser;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

// Get all users (admin only)
export const getAllUsers = createAsyncThunk(
  'user/getAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users');
      return {
        users: response.data.users as IUser[],
        count: response.data.count as number,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

// Get user by id (admin only)
export const getUserById = createAsyncThunk(
  'user/getUserById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data.user as IUser;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'User not found');
    }
  }
);

// Update user role (admin only)
export const updateUserRole = createAsyncThunk(
  'user/updateUserRole',
  async ({ id, role }: IUpdateRoleData, { rejectWithValue }) => {
    try {
      const response = await api.put(`/users/${id}/role`, { role });
      return response.data.user as IUser;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update role');
    }
  }
);

// Delete user (admin only)
export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
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
      state.error = null;
      state.totalCount = 0;
    },
    
    // Set current user manually
    setCurrentUser: (state, action: PayloadAction<IUser | null>) => {
      state.currentUser = action.payload;
    },
  },
  
  extraReducers: (builder) => {
    builder
      // ============= Get Current User =============
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

      // ============= Update Profile =============
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<IUser>) => {
        state.loading = false;
        state.currentUser = action.payload;
        
        // Also update in users list if exists
        const index = state.users.findIndex(u => u._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        
        // Update selected user if it's the same
        if (state.selectedUser?._id === action.payload._id) {
          state.selectedUser = action.payload;
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ============= Get All Users =============
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.totalCount = action.payload.count;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ============= Get User By ID =============
      .addCase(getUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserById.fulfilled, (state, action: PayloadAction<IUser>) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.selectedUser = null;
      })

      // ============= Update User Role =============
      .addCase(updateUserRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action: PayloadAction<IUser>) => {
        state.loading = false;
        
        // Update in users list
        const index = state.users.findIndex(u => u._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        
        // Update selected user if it's the same
        if (state.selectedUser?._id === action.payload._id) {
          state.selectedUser = action.payload;
        }
        
        // Update current user if it's the same (admin changing own role)
        if (state.currentUser?._id === action.payload._id) {
          state.currentUser = action.payload;
        }
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ============= Delete User =============
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        // Remove from users list
        state.users = state.users.filter(u => u._id !== action.payload);
        state.totalCount -= 1;
        
        // Clear selected user if deleted
        if (state.selectedUser?._id === action.payload) {
          state.selectedUser = null;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
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