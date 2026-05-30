"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import api from "@/lib/axios";
import { useAppDispatch } from "@/redux/hooks";
import { setCurrentUser } from "@/redux/features/auth/auth.slice";
import { registerSchema, RegisterType } from "@/schemas/auth.schema";

// React Icons
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { HiOutlineUserAdd } from "react-icons/hi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<RegisterType>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password");

  // Email/Password Registration
  const onSubmit = async (data: RegisterType) => {
    setIsLoading(true);

    try {
      // Create user in Firebase
      const result = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Update Firebase profile
      await updateProfile(result.user, {
        displayName: data.name,
      });

      // Get Firebase token
      const token = await result.user.getIdToken();
      localStorage.setItem("token", token);

      // Send name to backend via register endpoint
      const response = await api.post("/auth/register", {
        token: token,
        name: data.name
      });

      if (response.data.user) {
        // ✅ Save to Redux
        dispatch(setCurrentUser(response.data.user));
        
        // ✅ Save to localStorage for persistence on refresh
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Account created successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      reset();
      router.push("/");
      
    } catch (error: any) {
      console.error("Registration error:", error);
      
      if (error.code === "auth/email-already-in-use") {
        await Swal.fire({
          icon: "error",
          title: "Registration Failed",
          text: "This email is already registered. Please login instead.",
          showConfirmButton: false,
        });
      } else {
        await Swal.fire({
          icon: "error",
          title: "Registration Failed",
          text: error.message || "Failed to create account. Please try again.",
          showConfirmButton: false,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Google Registration
  const handleGoogleRegister = async () => {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      localStorage.setItem("token", token);

      // Get name from Google
      const googleName = result.user.displayName || "Google User";

      // Send name to backend via register endpoint
      const response = await api.post("/auth/register", {
        token: token,
        name: googleName
      });

      if (response.data.user) {
        // ✅ Save to Redux
        dispatch(setCurrentUser(response.data.user));
        
        // ✅ Save to localStorage for persistence on refresh
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Google account created successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      router.push("/");
      
    } catch (error: any) {
      console.error("Google registration error:", error);
      
      if (error.code === "auth/popup-closed-by-user") {
        console.log("User closed the Google popup");
      } else if (error.code === "auth/popup-blocked") {
        await Swal.fire({
          icon: "error",
          title: "Popup Blocked",
          text: "Please allow popups for this website and try again.",
          showConfirmButton: false,
        });
      } else if (error.code === "auth/account-exists-with-different-credential") {
        await Swal.fire({
          icon: "error",
          title: "Account Exists",
          text: "An account already exists with this email. Please login with your password.",
          showConfirmButton: false,
        });
      } else {
        await Swal.fire({
          icon: "error",
          title: "Registration Failed",
          text: error.message || "Failed to register with Google. Please try again.",
          showConfirmButton: false,
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
              type="text"
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

        {/* Confirm Password Field */}
        <div>
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              placeholder="Confirm Password"
              className={`pl-10 pr-10 border ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              } p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Password Requirements Hint */}
        {password && !errors.password && (
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <p className="font-medium mb-1">Password must have:</p>
            <div className="grid grid-cols-2 gap-1">
              <p className={password.length >= 8 ? "text-green-600" : ""}>
                {password.length >= 8 ? "✅" : "❌"} 8+ characters
              </p>
              <p className={/[a-z]/.test(password) ? "text-green-600" : ""}>
                {/[a-z]/.test(password) ? "✅" : "❌"} Lowercase letter
              </p>
              <p className={/[A-Z]/.test(password) ? "text-green-600" : ""}>
                {/[A-Z]/.test(password) ? "✅" : "❌"} Uppercase letter
              </p>
              <p className={/[0-9]/.test(password) ? "text-green-600" : ""}>
                {/[0-9]/.test(password) ? "✅" : "❌"} Number
              </p>
              <p className={/[@$!%*?&]/.test(password) ? "text-green-600" : ""}>
                {/[@$!%*?&]/.test(password) ? "✅" : "❌"} Special character
              </p>
            </div>
          </div>
        )}

        {/* Email Register Button */}
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
              <HiOutlineUserAdd className="text-xl" />
              Register
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

        {/* Google Register Button */}
        <button
          type="button"
          onClick={handleGoogleRegister}
          disabled={isGoogleLoading}
          className="border border-gray-300 text-gray-700 py-3 rounded-lg w-full font-semibold transition-all flex items-center justify-center gap-2 hover:bg-gray-50"
        >
          {isGoogleLoading ? (
            <AiOutlineLoading3Quarters className="animate-spin text-xl" />
          ) : (
            <>
              <FcGoogle className="text-xl" />
              Register with Google
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