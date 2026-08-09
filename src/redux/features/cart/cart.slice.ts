// redux/features/cart/cart.slice.ts

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ICart, ICartState, IAddToCartData, IUpdateCartData } from "./cart.types";
import api from "@/lib/axios";
import { AxiosError } from "axios";

// Initial state
const initialState: ICartState = {
  cart: null,
  loading: false,
  error: null,
};

// ============= Async Thunks =============

// Get user cart
export const getCart = createAsyncThunk(
  "cart/getCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/cart");
      return response.data.cart as ICart;
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || "Failed to fetch cart";
        return rejectWithValue(message);
      }
      return rejectWithValue("Failed to fetch cart");
    }
  }
);

// Add to cart
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (data: IAddToCartData, { rejectWithValue }) => {
    try {
      const response = await api.post("/cart", data);
      return response.data.cart as ICart;
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || "Failed to add to cart";
        return rejectWithValue(message);
      }
      return rejectWithValue("Failed to add to cart");
    }
  }
);

// Update cart item quantity
export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async (data: IUpdateCartData, { rejectWithValue }) => {
    try {
      const response = await api.put("/cart", data);
      return response.data.cart as ICart;
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || "Failed to update cart";
        return rejectWithValue(message);
      }
      return rejectWithValue("Failed to update cart");
    }
  }
);

// Remove item from cart
export const removeCartItem = createAsyncThunk(
  "cart/removeCartItem",
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/cart/${productId}`);
      return response.data.cart as ICart;
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || "Failed to remove item";
        return rejectWithValue(message);
      }
      return rejectWithValue("Failed to remove item");
    }
  }
);

// Clear cart
export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      console.log("🛒 Sending DELETE /cart request...");

      const response = await api.delete("/cart");

      console.log("🛒 Clear cart response:", response.data);

      return response.data.cart as ICart;
    } catch (error: unknown) {
      console.error("❌ Clear cart request failed:", error);

      if (error instanceof AxiosError) {
        console.error("Status:", error.response?.status);
        console.error("Response:", error.response?.data);
        console.error("URL:", error.config?.url);

        return rejectWithValue({
          message:
            error.response?.data?.message ||
            "Failed to clear cart",
          status: error.response?.status,
        });
      }

      return rejectWithValue({
        message: "Failed to clear cart",
      });
    }
  }
);
// ============= Slice =============

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCartError: (state) => {
      state.error = null;
    },
    resetCart: (state) => {
      state.cart = null;
      state.loading = false;
      state.error = null;
    },
    updateLocalCartItem: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      if (state.cart) {
        const itemIndex = state.cart.items.findIndex(
          (item) => item.product === action.payload.productId
        );
        if (itemIndex !== -1) {
          if (action.payload.quantity <= 0) {
            state.cart.items.splice(itemIndex, 1);
          } else {
            state.cart.items[itemIndex].quantity = action.payload.quantity;
          }
          // Recalculate totals
          state.cart.totalItems = state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
          state.cart.totalPrice = state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        }
      }
    },
    removeLocalItem: (state, action: PayloadAction<ICart>) => {
      state.cart = action.payload;
    },
    clearLocalCart: (state, action: PayloadAction<ICart>) => {
      state.cart = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // ============= Get Cart =============
      .addCase(getCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCart.fulfilled, (state, action: PayloadAction<ICart>) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(getCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ============= Add to Cart =============
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action: PayloadAction<ICart>) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ============= Update Cart Item =============
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action: PayloadAction<ICart>) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ============= Remove Cart Item =============
      .addCase(removeCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeCartItem.fulfilled, (state, action: PayloadAction<ICart>) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ============= Clear Cart =============
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state, action: PayloadAction<ICart>) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions - MAKE SURE to export all of them
export const { 
  clearCartError, 
  resetCart, 
  updateLocalCartItem,
  removeLocalItem,
  clearLocalCart 
} = cartSlice.actions;

// Export reducer
export default cartSlice.reducer;