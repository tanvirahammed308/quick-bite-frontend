"use client";

import { useEffect, useState } from "react";



import api from "@/lib/axios";
import StripeProvider from "@/redux/providers/StripeProvider";
import CheckoutForm from "@/components/payment/CheckoutForm";

export default function PaymentPage() {
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    const createIntent = async () => {
      try {
        const res = await api.post(
          "/payment/create-payment-intent",
          {
            amount: 2500,
          }
        );

        setClientSecret(res.data.clientSecret);
      } catch (error) {
        console.error("Payment Intent Error:", error);
      }
    };

    createIntent();
  }, []);

  if (!clientSecret) {
  return (
    <div className="flex min-h-100 items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-100 border-t-red-600"></div>

        <div className="text-center">
          <p className="text-lg font-semibold text-red-600">
            Loading Payment...
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Please wait while we prepare your payment.
          </p>
        </div>
      </div>
    </div>
  );
}

  return (
    <StripeProvider clientSecret={clientSecret}>
      <CheckoutForm />
    </StripeProvider>
  );
}