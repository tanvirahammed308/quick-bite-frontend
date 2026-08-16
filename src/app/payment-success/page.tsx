"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/lib/firebase";
import { useAppDispatch } from "@/redux/hooks";
import { clearCart } from "@/redux/features/cart/cart.slice";

export default function PaymentSuccessPage() {
  const dispatch = useAppDispatch();

  const [clearing, setClearing] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    console.log("💳 Payment successful.");
    console.log("🔥 Waiting for Firebase authentication...");

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        console.log("🔥 Firebase auth state:", user);

        if (!user) {
          console.error("❌ Firebase user is null");

          if (mounted) {
            setError(
              "Authentication is not available. Please log in again."
            );
            setClearing(false);
          }

          return;
        }

        try {
          console.log(
            "✅ Firebase user:",
            user.uid
          );

          // Force refresh Firebase token
          const token = await user.getIdToken(true);

          console.log(
            "✅ Firebase token received:",
            !!token
          );

          console.log(
            "🛒 Clearing cart..."
          );

          await dispatch(clearCart()).unwrap();

          console.log(
            "✅ Cart cleared successfully"
          );

          if (mounted) {
            setClearing(false);
          }
        } catch (err) {
          console.error(
            "❌ Failed to clear cart:",
            err
          );

          if (mounted) {
            setError(
              "Payment succeeded, but we could not clear your cart."
            );
            setClearing(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-xl">

        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
            <span className="text-4xl text-white">
              ✓
            </span>
          </div>
        </div>

        <div className="mt-5 text-4xl">
          🎉
        </div>

        <h1 className="mt-4 text-3xl font-bold text-green-600">
          Payment Successful!
        </h1>

        <p className="mt-4 text-gray-600">
          Thank you for your order. Your payment has been
          processed successfully.
        </p>

        {clearing && (
          <div className="mt-6 rounded-xl bg-blue-50 p-4">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />

            <p className="mt-3 font-semibold text-blue-700">
              Clearing your cart...
            </p>
          </div>
        )}

        {!clearing && !error && (
          <div className="mt-6 rounded-xl bg-green-50 p-4">
            <p className="font-semibold text-green-700">
              ✓ Your cart has been cleared.
            </p>
          </div>
        )}

        {!clearing && error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4">
            <p className="font-semibold text-red-700">
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="flex-1 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700"
          >
            🏠 Go to Home
          </Link>

          <Link
            href="/menu"
            className="flex-1 rounded-xl border-2 border-red-600 px-6 py-3 font-semibold text-red-600 hover:bg-red-50"
          >
            🍽️ Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  );
}