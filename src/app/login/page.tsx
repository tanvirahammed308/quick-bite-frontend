"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import api from "@/lib/axios";
import { useAppDispatch } from "@/redux/hooks";
import { setCurrentUser } from "@/redux/features/auth/auth.slice";
import { loginSchema, LoginType } from "@/schemas/auth.schema";

// React Icons
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { HiOutlineLogin } from "react-icons/hi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginType>({
    resolver: zodResolver(loginSchema),
  });

  // Email/Password Login
  const onSubmit = async (data: LoginType) => {
    setIsLoading(true);

    try {
      // Sign in with Firebase
      const result = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Get Firebase token
      const token = await result.user.getIdToken();

      // Store token in localStorage
      localStorage.setItem("token", token);

      // Get user from backend
      const response = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Save to Redux and localStorage if user exists
      if (response.data.user) {
        dispatch(setCurrentUser(response.data.user));
        // ✅ Save to localStorage for persistence on refresh
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Logged in successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      reset();
      router.push("/");
      
    } catch (error: any) {
      console.error("Login error:", error);
      
      if (error.code === "auth/invalid-credential") {
        await Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: "Invalid email or password. Please try again.",
          confirmButtonColor: "#d33",
          confirmButtonText: "OK",
        });
      } else if (error.code === "auth/user-not-found") {
        await Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: "No account found with this email. Please register first.",
          confirmButtonColor: "#d33",
          confirmButtonText: "OK",
        });
      } else if (error.code === "auth/wrong-password") {
        await Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: "Incorrect password. Please try again.",
          confirmButtonColor: "#d33",
          confirmButtonText: "OK",
        });
      } else if (error.code === "auth/too-many-requests") {
        await Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: "Too many failed attempts. Please try again later.",
          confirmButtonColor: "#d33",
          confirmButtonText: "OK",
        });
      } else if (error.code === "auth/network-request-failed") {
        await Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: "Network error. Please check your internet connection.",
          confirmButtonColor: "#d33",
          confirmButtonText: "OK",
        });
      } else {
        await Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: error.message || "Failed to login. Please try again.",
          confirmButtonColor: "#d33",
          confirmButtonText: "OK",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Google Login
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      localStorage.setItem("token", token);

      const response = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.user) {
        dispatch(setCurrentUser(response.data.user));
        // ✅ Save to localStorage for persistence on refresh
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Logged in with Google successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      router.push("/");
      
    } catch (error: any) {
      console.error("Google login error:", error);
      
      if (error.code === "auth/popup-closed-by-user") {
        console.log("User closed the Google popup");
      } else if (error.code === "auth/popup-blocked") {
        await Swal.fire({
          icon: "error",
          title: "Popup Blocked",
          text: "Please allow popups for this website and try again.",
          confirmButtonColor: "#d33",
          confirmButtonText: "OK",
        });
      } else {
        await Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: error.message || "Failed to login with Google. Please try again.",
          confirmButtonColor: "#d33",
          confirmButtonText: "OK",
        });
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-2xl space-y-5 w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <HiOutlineLogin className="text-4xl text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-gray-500 text-sm">Login to your account</p>
        </div>

        {/* Email Field */}
        <div>
          <div className="relative">
            <MdEmail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            <input
              {...register("email")}
              type="email"
              placeholder="Email Address"
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

        {/* Login Button */}
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
            <AiOutlineLoading3Quarters className="animate-spin text-xl" />
          ) : (
            <>
              <HiOutlineLogin className="text-xl" />
              Login
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          className="border border-gray-300 text-gray-700 py-3 rounded-lg w-full font-semibold transition-all flex items-center justify-center gap-2 hover:bg-gray-50"
        >
          {isGoogleLoading ? (
            <AiOutlineLoading3Quarters className="animate-spin text-xl" />
          ) : (
            <>
              <FcGoogle className="text-xl" />
              Login with Google
            </>
          )}
        </button>

        {/* Register Link */}
        <div className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="text-blue-600 hover:text-blue-700 font-semibold hover:underline inline-flex items-center gap-1"
          >
            <FaEnvelope className="text-xs" />
            Create account
          </button>
        </div>
      </form>
    </div>
  );
}