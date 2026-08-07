"use client";

import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useState } from "react";

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setMessage("");

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
    });

    if (error) {
      setMessage(error.message || "Payment failed.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto rounded-2xl border bg-white shadow-xl p-8">
      <h2 className="text-2xl font-bold text-center text-gray-800">
        Secure Checkout
      </h2>

      <p className="text-center text-gray-500 mt-2 mb-6">
        Complete your payment securely with Stripe.
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="rounded-xl border p-4 bg-gray-50">
          <PaymentElement />
        </div>

        <button
          type="submit"
          disabled={!stripe || loading}
          className="w-full rounded-xl bg-red-600 py-3 text-white font-semibold transition-all duration-300 hover:bg-red-700 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="h-5 w-5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="opacity-25"
                />
                <path
                  fill="currentColor"
                  className="opacity-75"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Processing...
            </span>
          ) : (
            "💳 Pay Now"
          )}
        </button>

        {message && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-center text-red-600">
            {message}
          </div>
        )}
      </form>
    </div>
  );
}