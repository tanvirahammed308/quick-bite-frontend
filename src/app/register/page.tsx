"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useState } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { registerSchema, RegisterType } from "@/schemas/auth.schema";
import { setCurrentUser } from "@/redux/features/auth/auth.slice";
import api from "@/lib/axios";

// React Icons
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { HiOutlineUserAdd } from "react-icons/hi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<RegisterType>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password");

  const onSubmit = async (data: RegisterType) => {
    setIsLoading(true);

    try {
      Swal.fire({
        title: "Creating account...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const result = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      await updateProfile(result.user, {
        displayName: data.name,
      });

      const token = await result.user.getIdToken();
      localStorage.setItem("token", token);

      // Fetch current user data from backend 
      const response = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.user) {
        dispatch(setCurrentUser(response.data.user));
      }

      await Swal.fire({
        title: "Success!",
        text: "Account created successfully",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      reset();
      router.push("/");
      
    } catch (error: any) {
      await Swal.fire({
        title: "Registration Failed",
        text: error?.message || "Something went wrong",
        icon: "error",
        confirmButtonText: "Try Again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-2xl space-y-5 w-full max-w-md shadow-xl"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <HiOutlineUserAdd className="text-4xl text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-gray-500 text-sm">Join us to get started</p>
        </div>

        {/* Name Field */}
        <div>
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              {...register("name")}
              placeholder="Full Name"
              className={`pl-10 border ${
                errors.name ? "border-red-500" : "border-gray-300"
              } p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
              disabled={isLoading}
            />
          </div>
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <div className="relative">
            <MdEmail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            <input
              {...register("email")}
              placeholder="Email Address"
              type="email"
              className={`pl-10 border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="Password"
              className={`pl-10 pr-10 border ${
                errors.password ? "border-red-500" : "border-gray-300"
              } p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Password Requirements */}
        {password && !errors.password && (
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg space-y-1">
            <p className="font-medium mb-2">Password requirements:</p>
            <div className="grid grid-cols-2 gap-1">
              <p className={password.length >= 8 ? "text-green-600" : ""}>
                {password.length >= 8 ? "✅" : "❌"} 8+ characters
              </p>
              <p className={/[a-z]/.test(password) ? "text-green-600" : ""}>
                {/[a-z]/.test(password) ? "✅" : "❌"} Lowercase
              </p>
              <p className={/[A-Z]/.test(password) ? "text-green-600" : ""}>
                {/[A-Z]/.test(password) ? "✅" : "❌"} Uppercase
              </p>
              <p className={/[0-9]/.test(password) ? "text-green-600" : ""}>
                {/[0-9]/.test(password) ? "✅" : "❌"} Number
              </p>
              <p className={/[@$!%*?&]/.test(password) ? "text-green-600" : ""}>
                {/[@$!%*?&]/.test(password) ? "✅" : "❌"} Special char
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg w-full font-semibold transition-all flex items-center justify-center gap-2
            ${
              isLoading
                ? "opacity-50 cursor-not-allowed"
                : "hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02]"
            }`}
        >
          {isLoading ? (
            <>
              <AiOutlineLoading3Quarters className="animate-spin" />
              Creating Account...
            </>
          ) : (
            <>
              <HiOutlineUserAdd className="text-xl" />
              Register
            </>
          )}
        </button>

        {/* Login Link */}
        <div className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-blue-600 hover:text-blue-700 font-semibold hover:underline inline-flex items-center gap-1"
          >
            <FaEnvelope className="text-xs" />
            Login here
          </button>
        </div>
      </form>
    </div>
  );
}