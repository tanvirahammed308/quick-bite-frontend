"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useAppDispatch } from "@/redux/hooks";
import {
clearCart,
getCart,
} from "@/redux/features/cart/cart.slice";

export default function PaymentSuccessPage() {
const dispatch = useAppDispatch();

const [clearingCart, setClearingCart] = useState(true);
const [cartCleared, setCartCleared] = useState(false);
const [clearError, setClearError] = useState(false);

useEffect(() => {
let mounted = true;


const clearPurchasedCart = async () => {
  try {
    console.log("Payment successful.");
    console.log("Clearing cart...");

    // Clear cart from backend/database
    await dispatch(clearCart()).unwrap();

    console.log("Cart cleared from backend.");

    // Get the latest cart from backend
    await dispatch(getCart()).unwrap();

    console.log("Redux cart refreshed.");

    if (mounted) {
      setCartCleared(true);
      setClearingCart(false);
    }
  } catch (error) {
    console.error("Failed to clear cart after payment:", error);

    if (mounted) {
      setClearError(true);
      setClearingCart(false);
    }
  }
};

clearPurchasedCart();

return () => {
  mounted = false;
};


}, [dispatch]);

return ( <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10"> <div className="w-full max-w-lg"> <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-10 text-center">

```
      {/* Success Icon */}
      <div className="mx-auto w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-200">
          <span className="text-4xl text-white">✓</span>
        </div>
      </div>

      {/* Celebration */}
      <div className="mt-5">
        <span className="text-4xl">🎉</span>
      </div>

      {/* Title */}
      <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-green-600">
        Payment Successful!
      </h1>

      {/* Message */}
      <p className="mt-4 text-gray-600 leading-relaxed">
        Thank you for your order. Your payment has been processed
        successfully.
      </p>

      {/* Cart Status */}
      {clearingCart && (
        <div className="mt-5 flex items-center justify-center gap-3 text-gray-500">
          <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />

          <span className="text-sm">
            Clearing your cart...
          </span>
        </div>
      )}

      {cartCleared && (
        <div className="mt-5 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
          <p className="text-sm font-semibold text-green-700">
            ✓ Your cart has been cleared successfully.
          </p>
        </div>
      )}

      {clearError && (
        <div className="mt-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm font-semibold text-red-700">
            Payment succeeded, but we could not clear your cart.
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm font-semibold text-red-600 hover:text-red-700 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Buttons */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">

        <Link
          href="/"
          className="flex-1 rounded-xl bg-red-600 px-6 py-3.5 text-white font-semibold transition hover:bg-red-700 shadow-lg shadow-red-200"
        >
          🏠 Go to Home
        </Link>

        <Link
          href="/orders"
          className="flex-1 rounded-xl border-2 border-red-600 px-6 py-3.5 font-semibold text-red-600 transition hover:bg-red-50"
        >
          📦 View Orders
        </Link>

      </div>

    </div>
  </div>
</div>


);
}
