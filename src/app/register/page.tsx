"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useState } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { registerSchema, RegisterType } from "@/schemas/auth.schema";
import { setCurrentUser } from "@/redux/features/auth/auth.slice";



export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch(); 
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterType>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterType) => {
    setIsLoading(true);

    try {
      // Show loading alert
      Swal.fire({
        title: "Creating account...",
        text: "Please wait while we create your account",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Firebase register
      const result = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Update firebase profile
      await updateProfile(result.user, {
        displayName: data.name,
      });

      // Get token
      const token = await result.user.getIdToken();

      // Store token
      localStorage.setItem("token", token);

      // Save user to MongoDB
      const response = await api.post("/auth", { token });

      //  Dispatch user to Redux store with type safety
      if (response.data.user) {
        dispatch(setCurrentUser(response.data.user));
      }

      // Success alert
      await Swal.fire({
        title: "Success!",
        text: "Your account has been created successfully",
        icon: "success",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Continue",
        timer: 2000,
      });

      // Reset form
      reset();

      // Redirect to home page
      router.push("/");
    } catch (error: any) {
      console.error("Registration error:", error);

      // Handle different error types
      let errorMessage = "Failed to create account";

      if (error.code) {
        switch (error.code) {
          case "auth/email-already-in-use":
            errorMessage = "This email is already registered. Please login instead.";
            break;
          case "auth/weak-password":
            errorMessage = "Password should be at least 6 characters";
            break;
          case "auth/invalid-email":
            errorMessage = "Please enter a valid email address";
            break;
          case "auth/network-request-failed":
            errorMessage = "Network error. Please check your internet connection";
            break;
          default:
            errorMessage = error.message || "Failed to create account";
        }
      }

      // Show error alert
      await Swal.fire({
        title: "Registration Failed",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#d33",
        confirmButtonText: "Try Again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white border border-gray-200 p-8 rounded-2xl space-y-5 w-full max-w-md shadow-xl"
      >
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-gray-500 text-sm">
            Join us to get started
          </p>
        </div>

        <div>
          <input
            {...register("name")}
            placeholder="Full Name"
            className={`border ${errors.name ? "border-red-500" : "border-gray-300"} 
              p-3 rounded-lg w-full focus:outline-none focus:ring-2 
              focus:ring-blue-500 transition-all`}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <input
            {...register("email")}
            placeholder="Email Address"
            type="email"
            className={`border ${errors.email ? "border-red-500" : "border-gray-300"} 
              p-3 rounded-lg w-full focus:outline-none focus:ring-2 
              focus:ring-blue-500 transition-all`}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <input
            type="password"
            {...register("password")}
            placeholder="Password"
            className={`border ${errors.password ? "border-red-500" : "border-gray-300"} 
              p-3 rounded-lg w-full focus:outline-none focus:ring-2 
              focus:ring-blue-500 transition-all`}
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`bg-gradient-to-r from-blue-600 to-indigo-600 text-white 
            px-5 py-3 rounded-lg w-full font-semibold transition-all 
            transform hover:scale-[1.02] hover:shadow-lg
            ${isLoading ? "opacity-70 cursor-not-allowed" : "hover:from-blue-700 hover:to-indigo-700"}`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Account...
            </span>
          ) : (
            "Register"
          )}
        </button>

        <div className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
          >
            Login here
          </button>
        </div>
      </form>
    </div>
  );
}