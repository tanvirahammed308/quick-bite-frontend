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

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url:
          "http://localhost:3000/payment-success",
      },
    });

    if (error) {
      setMessage(error.message || "Payment failed");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      <PaymentElement />

      <button
        disabled={!stripe || loading}
        className="bg-black text-white px-6 py-3 rounded w-full"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>

      {message && (
        <p className="text-red-500">{message}</p>
      )}

    </form>
  );
}