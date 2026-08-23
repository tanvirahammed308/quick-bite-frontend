// app/admin/page.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getAllProducts } from "@/redux/features/product/product.slice";
import { getAllOrders } from "@/redux/features/order/order.slice";
import { getAllUsers } from "@/redux/features/auth/auth.slice";
import { ORDER_STATUS_INFO } from "@/redux/features/order/order.types";
import {
  FaSpinner,
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaDollarSign,
  FaExclamationTriangle,
  FaArrowRight,
  FaClipboardList,
  FaStore,
  FaUserCog,
  FaChartLine,
} from "react-icons/fa";

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuthGuard(true);
  const dispatch = useAppDispatch();

  const { products, loading: productsLoading } = useAppSelector((state) => state.product);
  const { orders, loading: ordersLoading } = useAppSelector((state) => state.order);
  const { users, loading: usersLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(getAllProducts());
      dispatch(getAllOrders());
      dispatch(getAllUsers());
    }
  }, [dispatch, user]);

  const dataLoading = productsLoading || ordersLoading || usersLoading;

  // ============================================
  // COMPUTED STATS
  // ============================================

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const pendingOrdersCount = orders.filter(
    (o) => o.orderStatus === "pending" || o.orderStatus === "confirmed"
  ).length;

  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock < 10).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // ============================================
  // LOADING / GUARD
  // ============================================

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  // ============================================
  // STAT CARD CONFIG
  // ============================================

  const statCards = [
    {
      label: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: <FaDollarSign />,
      accent: "bg-red-600 text-white",
    },
    {
      label: "Total Orders",
      value: orders.length,
      icon: <FaShoppingCart />,
      accent: "bg-white text-red-600 border border-red-200",
    },
    {
      label: "Total Products",
      value: products.length,
      icon: <FaBox />,
      accent: "bg-white text-red-600 border border-red-200",
    },
    {
      label: "Total Users",
      value: users.length,
      icon: <FaUsers />,
      accent: "bg-white text-red-600 border border-red-200",
    },
  ];

  const quickLinks = [
    {
      label: "Manage Products",
      href: "/admin/products",
      icon: <FaStore className="text-xl" />,
      description: "Add, edit, or remove menu items",
    },
    {
      label: "Manage Orders",
      href: "/admin/orders",
      icon: <FaClipboardList className="text-xl" />,
      description: "View and update order statuses",
    },
    {
      label: "Manage Users",
      href: "/admin/users",
      icon: <FaUserCog className="text-xl" />,
      description: "View users and manage roles",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-red-600">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {user.name?.split(" ")[0] || "Admin"}
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl shadow-lg border border-red-100 p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`p-3 rounded-xl text-lg ${stat.accent}`}>{stat.icon}</span>
              </div>
              <p className="text-gray-500 text-sm">{stat.label}</p>
              {dataLoading ? (
                <div className="h-8 w-20 bg-red-50 rounded animate-pulse mt-1" />
              ) : (
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
              )}
            </div>
          ))}
        </div>

        {/* Alerts row */}
        {!dataLoading && (pendingOrdersCount > 0 || lowStockCount > 0 || outOfStockCount > 0) && (
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {pendingOrdersCount > 0 && (
              <Link
                href="/admin/orders"
                className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 hover:bg-red-100 transition"
              >
                <FaExclamationTriangle className="text-red-600 text-xl shrink-0" />
                <div>
                  <p className="font-semibold text-red-700">{pendingOrdersCount} pending orders</p>
                  <p className="text-xs text-red-600">Need confirmation or preparation</p>
                </div>
              </Link>
            )}
            {lowStockCount > 0 && (
              <Link
                href="/admin/products"
                className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 hover:bg-red-100 transition"
              >
                <FaExclamationTriangle className="text-red-600 text-xl shrink-0" />
                <div>
                  <p className="font-semibold text-red-700">{lowStockCount} products low on stock</p>
                  <p className="text-xs text-red-600">Fewer than 10 units remaining</p>
                </div>
              </Link>
            )}
            {outOfStockCount > 0 && (
              <Link
                href="/admin/products"
                className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 hover:bg-red-100 transition"
              >
                <FaExclamationTriangle className="text-red-600 text-xl shrink-0" />
                <div>
                  <p className="font-semibold text-red-700">{outOfStockCount} products out of stock</p>
                  <p className="text-xs text-red-600">Restock needed</p>
                </div>
              </Link>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-red-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FaChartLine className="text-red-600" />
                Recent Orders
              </h2>
              <Link
                href="/admin/orders"
                className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
              >
                View all <FaArrowRight size={12} />
              </Link>
            </div>

            {dataLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 bg-red-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <p className="text-gray-500 text-sm py-8 text-center">No orders yet.</p>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((order) => {
                  const statusInfo = ORDER_STATUS_INFO[order.orderStatus];
                  return (
                    <Link
                      key={order._id}
                      href={`/admin/orders?id=${order._id}`}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-red-50 transition"
                    >
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                        <span className="font-semibold text-red-600 text-sm w-16 text-right">
                          ₹{order.totalPrice.toFixed(0)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-5">Quick Actions</h2>
            <div className="space-y-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 p-4 rounded-xl border border-red-100 hover:bg-red-50 hover:border-red-200 transition group"
                >
                  <span className="p-2.5 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-600 group-hover:text-white transition">
                    {link.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{link.label}</p>
                    <p className="text-xs text-gray-500 truncate">{link.description}</p>
                  </div>
                  <FaArrowRight className="text-gray-300 group-hover:text-red-600 transition shrink-0" size={12} />
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}