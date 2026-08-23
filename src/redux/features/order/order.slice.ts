// src/redux/features/order/order.slice.ts

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  IOrder,
  IOrderState,
  ICreateOrderData,
  ICreateOrderResponse,
  IGetOrdersResponse,
  IUpdateOrderStatusData,
} from "./order.types";
import api from "@/lib/axios";
import { AxiosError } from "axios";

// Initial state
const initialState: IOrderState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  totalOrders: 0,
};

// ============= Async Thunks =============

// Create a new order (checkout)
export const createOrder = createAsyncThunk(
  "order/createOrder",
  async (data: ICreateOrderData, { rejectWithValue }) => {
    try {
      const response = await api.post("/orders", data);
      return response.data as ICreateOrderResponse;
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || "Failed to create order";
        return rejectWithValue(message);
      }
      return rejectWithValue("Failed to create order");
    }
  }
);

// Get logged-in user's own orders
export const getMyOrders = createAsyncThunk(
  "order/getMyOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/orders/my-orders");
      return response.data as IGetOrdersResponse;
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || "Failed to fetch orders";
        return rejectWithValue(message);
      }
      return rejectWithValue("Failed to fetch orders");
    }
  }
);

// Get a single order by id
export const getSingleOrder = createAsyncThunk(
  "order/getSingleOrder",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data.order as IOrder;
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || "Order not found";
        return rejectWithValue(message);
      }
      return rejectWithValue("Order not found");
    }
  }
);

// Cancel an order
export const cancelOrder = createAsyncThunk(
  "order/cancelOrder",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/orders/cancel/${id}`);
      return response.data.order as IOrder;
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || "Failed to cancel order";
        return rejectWithValue(message);
      }
      return rejectWithValue("Failed to cancel order");
    }
  }
);

// Get all orders (admin only)
export const getAllOrders = createAsyncThunk(
  "order/getAllOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/orders");
      return response.data as IGetOrdersResponse;
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || "Failed to fetch orders";
        return rejectWithValue(message);
      }
      return rejectWithValue("Failed to fetch orders");
    }
  }
);

// Update order status (admin only)
export const updateOrderStatus = createAsyncThunk(
  "order/updateOrderStatus",
  async ({ id, data }: { id: string; data: IUpdateOrderStatusData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/orders/${id}/status`, data);
      return response.data.order as IOrder;
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || "Failed to update order status";
        return rejectWithValue(message);
      }
      return rejectWithValue("Failed to update order status");
    }
  }
);

// ============= Slice =============

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ============= Create Order =============
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action: PayloadAction<ICreateOrderResponse>) => {
        state.loading = false;
        state.currentOrder = action.payload.order;
        state.orders.unshift(action.payload.order);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ============= Get My Orders =============
      .addCase(getMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyOrders.fulfilled, (state, action: PayloadAction<IGetOrdersResponse>) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.totalOrders = action.payload.count ?? action.payload.orders.length;
      })
      .addCase(getMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ============= Get Single Order =============
      .addCase(getSingleOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSingleOrder.fulfilled, (state, action: PayloadAction<IOrder>) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(getSingleOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.currentOrder = null;
      })

      // ============= Cancel Order =============
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action: PayloadAction<IOrder>) => {
        state.loading = false;
        const index = state.orders.findIndex((o) => o._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.currentOrder?._id === action.payload._id) {
          state.currentOrder = action.payload;
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ============= Get All Orders (Admin) =============
      .addCase(getAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOrders.fulfilled, (state, action: PayloadAction<IGetOrdersResponse>) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.totalOrders = action.payload.count ?? action.payload.orders.length;
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ============= Update Order Status (Admin) =============
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action: PayloadAction<IOrder>) => {
        state.loading = false;
        const index = state.orders.findIndex((o) => o._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.currentOrder?._id === action.payload._id) {
          state.currentOrder = action.payload;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { clearOrderError, clearCurrentOrder } = orderSlice.actions;

// Export reducer
export default orderSlice.reducer;