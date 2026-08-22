// app/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FaBoxOpen,
  FaArrowLeft,
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaTimesCircle,
  FaReceipt,
  FaUtensils,
} from "react-icons/fa";

import api from "@/lib/axios";
import { useAuthGuard } from "@/hooks/useAuthGuard"; // adjust path if needed
import type { IOrder, OrderStatus } from "@/redux/features/order/order.types";
import { ORDER_STATUS_INFO } from "@/redux/features/order/order.types";

// Real icons per status, matched to ORDER_STATUS_INFO's keys
const STATUS_ICONS: Record<OrderStatus, React.ReactNode> = {
  pending: <FaClock size={12} />,
  confirmed: <FaCheckCircle size={12} />,
  preparing: <FaUtensils size={12} />,
  out_for_delivery: <FaTruck size={12} />,
  delivered: <FaCheckCircle size={12} />,
  cancelled: <FaTimesCircle size={12} />,
};

export default function OrdersPage() {
  const router = useRouter();

  const { user: currentUser, loading: authLoading } = useAuthGuard();

  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) return; // useAuthGuard already redirects

    const loadOrders = async () => {
      try {
        const response = await api.get("/orders/my-orders");
        setOrders(response.data.orders ?? []);
      } catch (err) {
        console.error("Failed to load orders:", err);
        setError("Failed to load your orders. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [currentUser, authLoading]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center">
          <div className="relative mx-auto h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-red-100" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-600 animate-spin" />
            <div className="absolute inset-3 rounded-full bg-red-50 flex items-center justify-center">
              <FaReceipt className="text-red-600" />
            </div>
          </div>
          <p className="mt-5 text-lg font-bold text-red-600">Loading Your Orders...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return null;

  if (error) {
    console.log("error",error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="max-w-md text-center bg-white border-2 border-red-100 rounded-2xl shadow-lg p-10">
          <FaTimesCircle className="mx-auto text-4xl text-red-500 mb-4" />
          <p className="text-gray-700 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border-2 border-red-50 rounded-3xl shadow-xl p-10 sm:p-14 text-center">
            <div className="mx-auto mb-6 w-24 h-24 rounded-full bg-red-50 flex items-center justify-center">
              <FaBoxOpen className="text-5xl text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">No Orders Yet</h2>
            <p className="text-gray-500 mt-3 mb-8 max-w-md mx-auto">
              You haven&apos;t placed any orders yet. Explore our menu and treat yourself!
            </p>
            <button
              onClick={() => router.push("/menu")}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 shadow-lg shadow-red-200"
            >
              <FaArrowLeft />
              Browse Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.push("/")}
            className="p-3 rounded-full bg-white border border-red-100 shadow-sm hover:shadow-md hover:bg-red-50 transition group"
            aria-label="Back to home"
          >
            <FaArrowLeft className="text-red-600 group-hover:text-red-700 transition" />
          </button>

          <div>
            <h1 className="text-3xl font-bold text-red-600">My Orders</h1>
            <p className="text-gray-500 text-sm mt-1">
              {orders.length} {orders.length === 1 ? "order" : "orders"} placed
            </p>
          </div>
        </div>

        {/* Orders list */}
        <div className="space-y-5">
          {orders.map((order) => {
            const statusInfo = ORDER_STATUS_INFO[order.orderStatus];

            return (
              <div
                key={order._id}
                className="bg-white border border-red-100 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Order header strip */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-red-50/60 px-5 py-3 border-b border-red-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaReceipt className="text-red-600" />
                    <span className="font-medium text-gray-800">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span>{formatDate(order.createdAt)}</span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}
                  >
                    {STATUS_ICONS[order.orderStatus]}
                    {statusInfo.label}
                  </span>
                </div>

                {/* Items */}
                <div className="p-5 space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="relative w-14 h-14 bg-red-50 rounded-xl overflow-hidden shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FaBoxOpen className="text-red-300" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                      </div>

                      <p className="font-semibold text-red-600 whitespace-nowrap">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Totals breakdown */}
                <div className="px-5 py-4 border-t border-red-100 bg-white space-y-1.5">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Delivery Fee</span>
                    <span>
                      {order.deliveryFee === 0 ? "FREE" : `$${order.deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax</span>
                    <span>${order.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 mt-1 border-t border-red-50">
                    <span className="text-gray-700 font-medium">Order Total</span>
                    <span className="text-xl font-bold text-red-600">
                      ${order.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}