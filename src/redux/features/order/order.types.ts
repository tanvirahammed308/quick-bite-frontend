// redux/features/order/order.types.ts
import type { ReactNode } from "react";


export interface IOrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export type PaymentMethod = "stripe" | "cash_on_delivery";
export type PaymentStatus = "pending" | "paid" | "failed";
export type OrderStatus = 
  | "pending" 
  | "confirmed" 
  | "preparing" 
  | "out_for_delivery" 
  | "delivered" 
  | "cancelled";

export interface IOrder {
  _id: string;
  user: string;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  stripePaymentIntentId: string;
  totalItems: number;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateOrderData {
  shippingAddress: IShippingAddress;
  paymentMethod: PaymentMethod;
}

export interface ICreateOrderResponse {
  success: boolean;
  order: IOrder;
  clientSecret: string | null;
}

export interface IGetOrdersResponse {
  success: boolean;
  orders: IOrder[];
  count?: number;
}

export interface IUpdateOrderStatusData {
  orderStatus: OrderStatus;
}

export interface IOrderState {
  orders: IOrder[];
  currentOrder: IOrder | null;
  loading: boolean;
  error: string | null;
  totalOrders: number;
}

// Helper types for order status display
export interface IOrderStatusInfo {
  label: string;
  color: string;
  icon: React.ReactNode;
}

export const ORDER_STATUS_INFO: Record<OrderStatus, IOrderStatusInfo> = {
  pending: {
    label: "Order Placed",
    color: "bg-yellow-100 text-yellow-800",
    icon: null, // Will be set in component
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800",
    icon: null,
  },
  preparing: {
    label: "Preparing",
    color: "bg-purple-100 text-purple-800",
    icon: null,
  },
  out_for_delivery: {
    label: "Out for Delivery",
    color: "bg-orange-100 text-orange-800",
    icon: null,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-800",
    icon: null,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
    icon: null,
  },
};

export const ORDER_STATUS_STEPS: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
];