"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";

import { FirebaseError } from "firebase/app";

import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import api from "@/lib/axios";

import { useAppDispatch } from "@/redux/hooks";
import { setCurrentUser } from "@/redux/features/auth/auth.slice";

import {
  loginSchema,
  LoginType,
} from "@/schemas/auth.schema";

// React Icons
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

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

  // ============================================
  // REACT HOOK FORM
  // ============================================

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginType>({
    resolver: zodResolver(loginSchema),
  });

  // ============================================
  // EMAIL / PASSWORD LOGIN
  // ============================================

  const onSubmit = async (data: LoginType) => {
    setIsLoading(true);

    try {
      console.log("🔐 Starting email login...");

      // ==========================================
      // 1. LOGIN TO FIREBASE
      // ==========================================

      const result = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      console.log("✅ Firebase login successful");

      // ==========================================
      // 2. GET FIREBASE ID TOKEN
      // ==========================================

      const token = await result.user.getIdToken();

      console.log("✅ Firebase token received");

      // ==========================================
      // 3. SAVE TOKEN
      // ==========================================

      localStorage.setItem("token", token);

      // ==========================================
      // 4. GET USER FROM BACKEND
      // ==========================================

      const response = await api.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("✅ Backend user:", response.data.user);

      // ==========================================
      // 5. SAVE USER TO REDUX
      // ==========================================

      if (response.data.user) {
        dispatch(setCurrentUser(response.data.user));

        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );
      }

      // ==========================================
      // 6. SUCCESS MESSAGE
      // ==========================================

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Logged in successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      reset();

      // ==========================================
      // 7. REDIRECT
      // ==========================================

      router.push("/");
    } catch (error: unknown) {
      console.error("❌ Login error:", error);

      // ==========================================
      // FIREBASE ERROR
      // ==========================================

      if (error instanceof FirebaseError) {
        console.error("Firebase error code:", error.code);
        console.error("Firebase error message:", error.message);

        switch (error.code) {
          case "auth/invalid-credential":
            await Swal.fire({
              icon: "error",
              title: "Login Failed",
              text: "Invalid email or password. Please try again.",
              confirmButtonColor: "#d33",
              confirmButtonText: "OK",
            });
            break;

          case "auth/user-not-found":
            await Swal.fire({
              icon: "error",
              title: "Login Failed",
              text: "No account found with this email. Please register first.",
              confirmButtonColor: "#d33",
              confirmButtonText: "OK",
            });
            break;

          case "auth/wrong-password":
            await Swal.fire({
              icon: "error",
              title: "Login Failed",
              text: "Incorrect password. Please try again.",
              confirmButtonColor: "#d33",
              confirmButtonText: "OK",
            });
            break;

          case "auth/invalid-email":
            await Swal.fire({
              icon: "error",
              title: "Invalid Email",
              text: "Please enter a valid email address.",
              confirmButtonColor: "#d33",
              confirmButtonText: "OK",
            });
            break;

          case "auth/too-many-requests":
            await Swal.fire({
              icon: "error",
              title: "Too Many Attempts",
              text: "Too many failed attempts. Please try again later.",
              confirmButtonColor: "#d33",
              confirmButtonText: "OK",
            });
            break;

          case "auth/network-request-failed":
            await Swal.fire({
              icon: "error",
              title: "Network Error",
              text: "Please check your internet connection.",
              confirmButtonColor: "#d33",
              confirmButtonText: "OK",
            });
            break;

          case "auth/user-disabled":
            await Swal.fire({
              icon: "error",
              title: "Account Disabled",
              text: "Your account has been disabled.",
              confirmButtonColor: "#d33",
              confirmButtonText: "OK",
            });
            break;

          default:
            await Swal.fire({
              icon: "error",
              title: "Login Failed",
              text:
                error.message ||
                "Failed to login. Please try again.",
              confirmButtonColor: "#d33",
              confirmButtonText: "OK",
            });
        }

        return;
      }

      // ==========================================
      // NORMAL JAVASCRIPT ERROR
      // ==========================================

      if (error instanceof Error) {
        await Swal.fire({
          icon: "error",
          title: "Login Failed",
          text:
            error.message ||
            "Something went wrong. Please try again.",
          confirmButtonColor: "#d33",
          confirmButtonText: "OK",
        });

        return;
      }

      // ==========================================
      // UNKNOWN ERROR
      // ==========================================

      await Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Something went wrong. Please try again.",
        confirmButtonColor: "#d33",
        confirmButtonText: "OK",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // GOOGLE LOGIN
  // ============================================

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);

    const provider = new GoogleAuthProvider();

    try {
      console.log("🔐 Starting Google login...");

      // ==========================================
      // 1. GOOGLE FIREBASE LOGIN
      // ==========================================

      const result = await signInWithPopup(
        auth,
        provider
      );

      console.log("✅ Google Firebase login successful");

      // ==========================================
      // 2. GET FIREBASE TOKEN
      // ==========================================

      const token = await result.user.getIdToken();

      console.log("✅ Google Firebase token received");

      // ==========================================
      // 3. SAVE TOKEN
      // ==========================================

      localStorage.setItem("token", token);

      // ==========================================
      // 4. GET USER FROM BACKEND
      // ==========================================

      const response = await api.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("✅ Backend user:", response.data.user);

      // ==========================================
      // 5. SAVE USER TO REDUX
      // ==========================================

      if (response.data.user) {
        dispatch(setCurrentUser(response.data.user));

        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );
      }

      // ==========================================
      // 6. SUCCESS MESSAGE
      // ==========================================

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Logged in with Google successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      // ==========================================
      // 7. REDIRECT
      // ==========================================

      router.push("/");
    } catch (error: unknown) {
      console.error("❌ Google login error:", error);

      // ==========================================
      // FIREBASE ERROR
      // ==========================================

      if (error instanceof FirebaseError) {
        console.error("Firebase error code:", error.code);
        console.error("Firebase error message:", error.message);

        switch (error.code) {
          case "auth/popup-closed-by-user":
            console.log("Google popup was closed by user");
            break;

          case "auth/popup-blocked":
            await Swal.fire({
              icon: "error",
              title: "Popup Blocked",
              text: "Please allow popups for this website and try again.",
              confirmButtonColor: "#d33",
              confirmButtonText: "OK",
            });
            break;

          case "auth/cancelled-popup-request":
            console.log("Google popup request cancelled");
            break;

          case "auth/network-request-failed":
            await Swal.fire({
              icon: "error",
              title: "Network Error",
              text: "Please check your internet connection.",
              confirmButtonColor: "#d33",
              confirmButtonText: "OK",
            });
            break;

          default:
            await Swal.fire({
              icon: "error",
              title: "Google Login Failed",
              text:
                error.message ||
                "Failed to login with Google.",
              confirmButtonColor: "#d33",
              confirmButtonText: "OK",
            });
        }

        return;
      }

      // ==========================================
      // NORMAL JAVASCRIPT ERROR
      // ==========================================

      if (error instanceof Error) {
        await Swal.fire({
          icon: "error",
          title: "Google Login Failed",
          text:
            error.message ||
            "Something went wrong.",
          confirmButtonColor: "#d33",
          confirmButtonText: "OK",
        });

        return;
      }

      // ==========================================
      // UNKNOWN ERROR
      // ==========================================

      await Swal.fire({
        icon: "error",
        title: "Google Login Failed",
        text: "Something went wrong. Please try again.",
        confirmButtonColor: "#d33",
        confirmButtonText: "OK",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // ============================================
  // UI
  // ============================================

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-2xl space-y-5 w-full max-w-md shadow-xl"
      >

        {/* Header */}

        <div className="text-center space-y-2">

          <div className="flex justify-center">

            <div className="bg-red-100 p-3 rounded-full">

              <HiOutlineLogin className="text-4xl text-red-600" />

            </div>

          </div>

          <h1 className="text-3xl font-bold text-red-600">
            Welcome Back
          </h1>

          <p className="text-gray-500 text-sm">
            Login to your account
          </p>

        </div>

        {/* Email */}

        <div>

          <div className="relative">

            <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />

            <input
              {...register("email")}
              type="email"
              placeholder="Email Address"
              className={`pl-10 border ${
                errors.email
                  ? "border-red-500"
                  : "border-gray-300"
              } p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-red-500 transition-all`}
              disabled={isLoading || isGoogleLoading}
            />

          </div>

          {errors.email && (
            <p className="text-red-500 text-sm mt-1">
              {errors.email.message}
            </p>
          )}

        </div>

        {/* Password */}

        <div>

          <div className="relative">

            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              {...register("password")}
              placeholder="Password"
              className={`pl-10 pr-10 border ${
                errors.password
                  ? "border-red-500"
                  : "border-gray-300"
              } p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-red-500 transition-all`}
              disabled={isLoading || isGoogleLoading}
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={isLoading || isGoogleLoading}
            >
              {showPassword ? (
                <FaEyeSlash size={18} />
              ) : (
                <FaEye size={18} />
              )}
            </button>

          </div>

          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}

        </div>

        {/* Login Button */}

        <button
          type="submit"
          disabled={isLoading || isGoogleLoading}
          className={`bg-red-600 text-white py-3 rounded-lg w-full font-semibold transition-all flex items-center justify-center gap-2 ${
            isLoading || isGoogleLoading
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-red-700 transform hover:scale-[1.02]"
          }`}
        >

          {isLoading ? (
            <>
              <AiOutlineLoading3Quarters className="animate-spin text-xl" />
              Logging in...
            </>
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
            <div className="w-full border-t border-gray-300" />
          </div>

          <div className="relative flex justify-center text-sm">

            <span className="px-2 bg-white text-gray-500">
              Or continue with
            </span>

          </div>

        </div>

        {/* Google Login */}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading || isGoogleLoading}
          className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >

          {isGoogleLoading ? (
            <>
              <AiOutlineLoading3Quarters className="animate-spin text-xl" />
              Signing in...
            </>
          ) : (
            <>
              <FcGoogle className="text-xl" />
              Login with Google
            </>
          )}

        </button>

        {/* Register */}

        <div className="text-center text-sm text-gray-600">

          Do not have an account?{" "}

          <button
            type="button"
            onClick={() => router.push("/register")}
            className="text-red-600 hover:text-red-700 font-semibold hover:underline inline-flex items-center gap-1"
          >
            <FaEnvelope className="text-xs" />
            Create account
          </button>

        </div>

      </form>

    </div>
  );
}