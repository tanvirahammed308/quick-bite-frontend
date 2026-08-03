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
    return <div className="text-center mt-20">Loading...</div>;
  }

  return (
    <StripeProvider clientSecret={clientSecret}>
      <CheckoutForm />
    </StripeProvider>
  );
}