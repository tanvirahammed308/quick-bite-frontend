// app/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { AxiosError } from "axios";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useAppDispatch } from "@/redux/hooks";
import { setCurrentUser } from "@/redux/features/auth/auth.slice";
import Swal from "sweetalert2";
import api from "@/lib/axios";
import { auth } from "@/lib/firebase";
import { updateProfile as updateFirebaseProfile } from "firebase/auth";

// React Icons
import {
  FaUserCircle,
  FaEnvelope,
  FaCalendar,
  FaUserTag,
  FaEdit,
  FaSave,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";

export default function ProfilePage() {
  const dispatch = useAppDispatch();

  // Using your useAuthGuard hook
  const { user, loading } = useAuthGuard(); // No parameter = user only

  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [name, setName] = useState("");

  // Set name when user loads
  useEffect(() => {
    if (user) {
      queueMicrotask(() => setName(user.name || ""));
    }
  }, [user]);

  // Handle update profile
  const handleUpdate = async () => {
    if (!name.trim()) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Name cannot be empty",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    setIsUpdating(true);

    try {
      // Update in backend
      const response = await api.put("/auth/me", { name });

      if (response.data.user) {
        // Update Firebase profile
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
          await updateFirebaseProfile(firebaseUser, { displayName: name });
        }

        // Update Redux store
        dispatch(setCurrentUser(response.data.user));

        // Update localStorage
        localStorage.setItem("user", JSON.stringify(response.data.user));

        await Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Profile updated successfully",
          timer: 1500,
          showConfirmButton: false,
        });

        setIsEditing(false);
      }
    } catch (error) {
      console.error("Update error:", error);
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message || "Failed to update profile"
          : "Failed to update profile";
      await Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: message,
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // If no user, don't render (hook will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
          {/* Header */}
          <div className="bg-red-600 px-6 py-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">My Profile</h1>
                <p className="text-red-100 text-sm mt-1">Manage your account information</p>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-sm"
                >
                  <FaEdit />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            {/* Avatar Section */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <FaUserCircle className="w-24 h-24 text-red-300 bg-red-50 rounded-full border-4 border-white shadow-lg" />
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Name Field */}
              <div className="border-b border-red-100 pb-4">
                <label className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                  <FaUserTag className="text-red-600" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter your name"
                  />
                ) : (
                  <p className="text-gray-800 font-medium text-lg">{user.name}</p>
                )}
              </div>

              {/* Email Field (Read-only) */}
              <div className="border-b border-red-100 pb-4">
                <label className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                  <FaEnvelope className="text-red-600" />
                  Email Address
                </label>
                <p className="text-gray-800">{user.email}</p>
              </div>

              {/* Role Field */}
              <div className="border-b border-red-100 pb-4">
                <label className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                  <FaUserTag className="text-red-600" />
                  Account Type
                </label>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    user.role === "admin"
                      ? "bg-red-600 text-white"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {user.role === "admin" ? "Administrator" : "Regular User"}
                </span>
              </div>

              {/* Member Since */}
              <div className="border-b border-red-100 pb-4">
                <label className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                  <FaCalendar className="text-red-600" />
                  Member Since
                </label>
                <p className="text-gray-800">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {isUpdating ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setName(user.name);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    <FaTimes />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-md border border-red-100 p-4 text-center">
            <p className="text-2xl font-bold text-red-600">0</p>
            <p className="text-gray-500 text-sm">Total Orders</p>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-red-100 p-4 text-center">
            <p className="text-2xl font-bold text-red-600">0</p>
            <p className="text-gray-500 text-sm">Pending</p>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-red-100 p-4 text-center">
            <p className="text-2xl font-bold text-red-600">0</p>
            <p className="text-gray-500 text-sm">Favorites</p>
          </div>
        </div>
      </div>
    </div>
  );
}