import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Success Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <span className="text-5xl">🎉</span>
        </div>

        {/* Title */}
        <h1 className="mt-6 text-3xl font-bold text-green-600">
          Payment Successful!
        </h1>

        {/* Message */}
        <p className="mt-3 text-gray-600">
          Thank you for your order. Your payment has been processed
          successfully.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="flex-1 rounded-lg bg-red-600 px-6 py-3 text-white font-semibold transition hover:bg-red-700"
          >
            🏠 Go to Home
          </Link>

          <Link
            href="/orders"
            className="flex-1 rounded-lg border border-red-600 px-6 py-3 font-semibold text-red-600 transition hover:bg-red-50"
          >
            📦 View Orders
          </Link>
        </div>
      </div>
    </div>
  );
}