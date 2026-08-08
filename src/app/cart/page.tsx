
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import {
  FaTrash,
  FaArrowLeft,
  FaPlus,
  FaMinus,
  FaLock,
  FaTruck,
  FaShieldAlt,
} from "react-icons/fa";
import Swal from "sweetalert2";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "@/redux/features/cart/cart.slice";
import type { ICartItem } from "@/redux/features/cart/cart.types";

export default function CartPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { cart } = useAppSelector((state) => state.cart);

  const { currentUser, loading: authLoading } = useAppSelector(
    (state) => state.auth
  );

  const [updatingItems, setUpdatingItems] = useState<
    Record<string, boolean>
  >({});

  const [isLoading, setIsLoading] = useState(true);

  // ============================================
  // LOAD CART
  // ============================================

  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      router.replace("/login?redirect=/cart");
      return;
    }

    const loadCart = async () => {
      try {
        await dispatch(getCart()).unwrap();
      } catch (error) {
        console.error("Failed to load cart:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, [currentUser, authLoading, dispatch, router]);

  // ============================================
  // GET PRODUCT ID
  // ============================================

  const getProductId = (item: ICartItem): string => {
    if (!item.product) {
      return item.name;
    }

    if (typeof item.product === "string") {
      return item.product;
    }

    if (typeof item.product === "object") {
      if ("_id" in item.product) {
        return String(item.product._id);
      }
    }

    return item.name;
  };

  // ============================================
  // UPDATE QUANTITY
  // ============================================

  const handleUpdateQuantity = async (
    productId: string,
    newQuantity: number
  ) => {
    if (newQuantity < 1) {
      await handleRemoveItem(productId);
      return;
    }

    setUpdatingItems((prev) => ({
      ...prev,
      [productId]: true,
    }));

    try {
      await dispatch(
        updateCartItem({
          productId,
          quantity: newQuantity,
        })
      ).unwrap();

      await dispatch(getCart()).unwrap();
    } catch (error: unknown) {
      console.error("Update cart error:", error);

      let message = "Failed to update cart.";

      if (error instanceof Error) {
        message = error.message;
      }

      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: message,
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setUpdatingItems((prev) => ({
        ...prev,
        [productId]: false,
      }));
    }
  };

  // ============================================
  // REMOVE ITEM
  // ============================================

  const handleRemoveItem = async (productId: string) => {
    const result = await Swal.fire({
      title: "Remove Item?",
      text: "Are you sure you want to remove this item?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Remove",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await dispatch(removeCartItem(productId)).unwrap();

      // Refresh cart
      await dispatch(getCart()).unwrap();

      await Swal.fire({
        icon: "success",
        title: "Removed!",
        text: "Item has been removed from your cart.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error: unknown) {
      console.error("Remove item error:", error);

      let message = "Failed to remove item.";

      if (error instanceof Error) {
        message = error.message;
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: message,
        confirmButtonColor: "#dc2626",
      });
    }
  };

  // ============================================
  // CLEAR ENTIRE CART
  // ============================================

  const handleClearCart = async () => {
    const result = await Swal.fire({
      title: "Clear Entire Cart?",
      text: "All items will be removed from your cart.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Clear Cart",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await dispatch(clearCart()).unwrap();

      // Refresh cart
      await dispatch(getCart()).unwrap();

      await Swal.fire({
        icon: "success",
        title: "Cart Cleared!",
        text: "All items have been removed.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error: unknown) {
      console.error("Clear cart error:", error);

      let message = "Failed to clear cart.";

      if (error instanceof Error) {
        message = error.message;
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: message,
        confirmButtonColor: "#dc2626",
      });
    }
  };

  // ============================================
  // CHECKOUT
  // ============================================

  const handleCheckout = () => {
    if (!cart?.items?.length) {
      Swal.fire({
        icon: "warning",
        title: "Cart is Empty",
        text: "Please add some items before checkout.",
        confirmButtonColor: "#dc2626",
      });

      return;
    }

    router.push("/payment");
  };

  // ============================================
  // CONTINUE SHOPPING
  // ============================================

  const handleContinueShopping = () => {
    router.push("/menu");
  };

  // ============================================
  // LOADING
  // ============================================

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 px-4">
        <div className="text-center">
          <div className="relative mx-auto h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-red-100" />

            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-600 animate-spin" />

            <div className="absolute inset-3 rounded-full bg-red-50 flex items-center justify-center">
              <span className="text-red-600 text-lg">🛒</span>
            </div>
          </div>

          <p className="mt-5 text-lg font-bold text-red-600">
            Loading Your Cart...
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Please wait while we load your items.
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // NOT LOGGED IN
  // ============================================

  if (!currentUser) {
    return null;
  }

  // ============================================
  // EMPTY CART
  // ============================================

  const hasItems =
    cart &&
    Array.isArray(cart.items) &&
    cart.items.length > 0;

  if (!hasItems) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-10 sm:p-14 text-center">
            <div className="mx-auto mb-6 w-24 h-24 rounded-full bg-red-50 flex items-center justify-center">
              <span className="text-5xl">🛒</span>
            </div>

            <h2 className="text-3xl font-bold text-gray-800">
              Your Cart Is Empty
            </h2>

            <p className="text-gray-500 mt-3 mb-8 max-w-md mx-auto">
              You have not added anything to your cart yet. Explore our
              menu and find something delicious!
            </p>

            <button
              onClick={handleContinueShopping}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 shadow-lg shadow-red-200"
            >
              <FaArrowLeft />
              Browse Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // ORDER CALCULATION
  // ============================================

  const subtotal = cart.totalPrice ?? 0;

  const tax = Number((subtotal * 0.1).toFixed(2));

  const deliveryFee = subtotal >= 30 ? 0 : 5.99;

  const total = Number(
    (subtotal + tax + deliveryFee).toFixed(2)
  );

  const totalItems = cart.totalItems ?? 0;

  // ============================================
  // MAIN UI
  // ============================================

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* ============================================
            HEADER
        ============================================ */}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">

          <div className="flex items-center gap-3">

            <button
              onClick={handleContinueShopping}
              className="p-3 rounded-full bg-white shadow-md hover:shadow-lg hover:bg-red-50 transition group"
              aria-label="Back to menu"
            >
              <FaArrowLeft className="text-gray-600 group-hover:text-red-600 transition" />
            </button>

            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Your Cart
              </h1>

              <p className="text-gray-500 text-sm mt-1">
                {totalItems}{" "}
                {totalItems === 1 ? "item" : "items"} in your cart
              </p>
            </div>

          </div>

          <button
            onClick={handleClearCart}
            className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 hover:bg-red-50 transition"
          >
            <FaTrash size={14} />
            Clear All
          </button>

        </div>

        {/* ============================================
            CONTENT
        ============================================ */}

        <div className="grid lg:grid-cols-3 gap-8">

          {/* ============================================
              CART ITEMS
          ============================================ */}

          <div className="lg:col-span-2 space-y-4">

            {cart.items.map((item: ICartItem) => {

              const itemPrice = item.price;
              const itemQuantity = item.quantity;
              const itemTotal = itemPrice * itemQuantity;
              const productId = getProductId(item);

              const isUpdating = updatingItems[productId];

              return (
                <div
                  key={productId}
                  className="bg-white rounded-2xl shadow-md p-4 flex gap-4 hover:shadow-xl transition-all duration-300 group"
                >

                  {/* Product Image */}

                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-gray-100 rounded-xl overflow-hidden shrink-0">

                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 640px) 96px, 112px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-3xl">🛒</span>
                      </div>
                    )}

                  </div>

                  {/* Product Details */}

                  <div className="flex-1 min-w-0">

                    <div className="flex justify-between items-start gap-3">

                      <div className="min-w-0">

                        <h3 className="font-semibold text-gray-800 text-lg truncate">
                          {item.name}
                        </h3>

                        <p className="text-gray-500 text-sm mt-1">
                          ${itemPrice.toFixed(2)} each
                        </p>

                      </div>

                      <button
                        onClick={() =>
                          handleRemoveItem(productId)
                        }
                        disabled={isUpdating}
                        className="text-gray-400 hover:text-red-500 transition disabled:opacity-50"
                        aria-label={`Remove ${item.name}`}
                      >
                        <FaTrash size={16} />
                      </button>

                    </div>

                    {/* Quantity + Total */}

                    <div className="flex items-center justify-between mt-5">

                      <div className="flex items-center gap-3">

                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              productId,
                              itemQuantity - 1
                            )
                          }
                          disabled={isUpdating}
                          className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-red-400 hover:bg-red-50 disabled:opacity-50 transition-all"
                          aria-label="Decrease quantity"
                        >
                          <FaMinus
                            size={12}
                            className="text-gray-600"
                          />
                        </button>

                        <div className="w-8 text-center font-semibold text-gray-800">

                          {isUpdating ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
                          ) : (
                            itemQuantity
                          )}

                        </div>

                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              productId,
                              itemQuantity + 1
                            )
                          }
                          disabled={isUpdating}
                          className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-red-400 hover:bg-red-50 disabled:opacity-50 transition-all"
                          aria-label="Increase quantity"
                        >
                          <FaPlus
                            size={12}
                            className="text-gray-600"
                          />
                        </button>

                      </div>

                      <p className="font-bold text-red-600 text-lg">
                        ${itemTotal.toFixed(2)}
                      </p>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>

          {/* ============================================
              ORDER SUMMARY
          ============================================ */}

          <div className="lg:col-span-1">

            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-20">

              <h2 className="text-xl font-bold text-gray-800 mb-4 pb-3 border-b">
                Order Summary
              </h2>

              {/* Subtotal */}

              <div className="flex justify-between py-3">
                <span className="text-gray-600">
                  Subtotal
                </span>

                <span className="font-semibold text-gray-800">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              {/* Delivery */}

              <div className="flex justify-between py-3 border-t">

                <span className="text-gray-600">
                  Delivery Fee
                </span>

                <span
                  className={
                    deliveryFee === 0
                      ? "text-green-600 font-semibold"
                      : "font-semibold text-gray-800"
                  }
                >
                  {deliveryFee === 0
                    ? "FREE"
                    : `$${deliveryFee.toFixed(2)}`}
                </span>

              </div>

              {/* Tax */}

              <div className="flex justify-between py-3 border-t">

                <span className="text-gray-600">
                  Tax (10%)
                </span>

                <span className="font-semibold text-gray-800">
                  ${tax.toFixed(2)}
                </span>

              </div>

              {/* Total */}

              <div className="flex justify-between py-4 border-t-2 mt-2">

                <span className="text-xl font-bold text-gray-800">
                  Total
                </span>

                <span className="text-2xl font-bold text-red-600">
                  ${total.toFixed(2)}
                </span>

              </div>

              {/* Free Delivery */}

              {subtotal < 30 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl">

                  <p className="text-sm text-blue-700 mb-2">
                    Add{" "}
                    <strong>
                      ${(30 - subtotal).toFixed(2)}
                    </strong>{" "}
                    more for free delivery.
                  </p>

                  <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">

                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          (subtotal / 30) * 100,
                          100
                        )}%`,
                      }}
                    />

                  </div>

                </div>
              )}

              {/* Benefits */}

              <div className="bg-gray-50 rounded-xl p-4 mt-4 space-y-3">

                <div className="flex items-center gap-2 text-sm">

                  <FaTruck className="text-green-600 shrink-0" />

                  <span className="text-gray-600">
                    Free delivery on orders over $30
                  </span>

                </div>

                <div className="flex items-center gap-2 text-sm">

                  <FaShieldAlt className="text-blue-600 shrink-0" />

                  <span className="text-gray-600">
                    Secure payment
                  </span>

                </div>

              </div>

              {/* Checkout */}

              <div className="mt-6 space-y-3">

                <button
                  onClick={handleCheckout}
                  className="w-full bg-linear-to-r from-red-600 to-red-500 text-white py-3.5 rounded-xl font-semibold hover:from-red-700 hover:to-red-600 transition-all duration-300 shadow-lg shadow-red-200 flex items-center justify-center gap-2"
                >
                  <FaLock size={16} />
                  Proceed to Payment
                </button>

                <button
                  onClick={handleContinueShopping}
                  className="w-full py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:border-red-300 hover:text-red-600 transition"
                >
                  Continue Shopping
                </button>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

