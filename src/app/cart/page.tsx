// app/cart/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "@/redux/features/cart/cart.slice";
import { FaTrash, FaArrowLeft, FaPlus, FaMinus, FaLock, FaTruck, FaShieldAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import type { ICartItem } from "@/redux/features/cart/cart.types";

export default function CartPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const { cart } = useAppSelector((state) => state.cart);
  const { currentUser, loading: authLoading } = useAppSelector((state) => state.auth);
  
  const [updatingItems, setUpdatingItems] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser) {
        router.replace("/login?redirect=/cart");
      } else {
        dispatch(getCart()).finally(() => {
          setIsLoading(false);
        });
      }
    }
  }, [currentUser, authLoading, dispatch, router]);

  // Helper function to safely get product ID as string
  const getProductId = (item: ICartItem): string => {
    if (!item.product) return `item-${Date.now()}-${Math.random()}`;
    
    // If product is already a string, return it
    if (typeof item.product === 'string') {
      return item.product;
    }
    
    // If product is an object with _id
    if (typeof item.product === 'object' && item.product !== null) {
      // Check if it has _id property
      const productObj = item.product as any;
      if (productObj._id && typeof productObj._id === 'string') {
        return productObj._id;
      }
      if (productObj.id && typeof productObj.id === 'string') {
        return productObj.id;
      }
      // If it's a MongoDB ObjectId with toString method
      if (typeof productObj.toString === 'function') {
        return productObj.toString();
      }
    }
    
    // Fallback: use name + index to create unique key
    return `${item.name}-${Date.now()}-${Math.random()}`;
  };

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }

    setUpdatingItems((prev) => ({ ...prev, [productId]: true }));
    try {
      await dispatch(updateCartItem({ productId, quantity: newQuantity })).unwrap();
      await dispatch(getCart()).unwrap();
    } catch (error: any) {
      console.error("Update error:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error?.message || "Failed to update quantity",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [productId]: false }));
    }
  };

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

    if (result.isConfirmed) {
      try {
        await dispatch(removeCartItem(productId)).unwrap();
        await dispatch(getCart()).unwrap();
        Swal.fire({
          icon: "success",
          title: "Removed!",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error: any) {
        console.error("Remove error:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error?.message || "Failed to remove item",
          confirmButtonColor: "#dc2626",
        });
      }
    }
  };

  const handleClearCart = async () => {
    const result = await Swal.fire({
      title: "Clear Cart?",
      text: "Are you sure you want to clear your entire cart?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Clear All",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await dispatch(clearCart()).unwrap();
        await dispatch(getCart()).unwrap();
        Swal.fire({
          icon: "success",
          title: "Cleared!",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error: any) {
        console.error("Clear error:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error?.message || "Failed to clear cart",
          confirmButtonColor: "#dc2626",
        });
      }
    }
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  const handleContinueShopping = () => {
    router.push("/menu");
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  const hasValidCart = cart && Array.isArray(cart.items) && cart.items.length > 0;
  
  if (!hasValidCart) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-3xl shadow-xl p-12">
            <div className="text-8xl mb-6">🛒</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added any items yet</p>
            <Link
              href="/menu"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition duration-300"
            >
              <FaArrowLeft />
              Browse Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = cart.totalPrice ?? 0;
  const tax = Number((subtotal * 0.1).toFixed(2));
  const deliveryFee = subtotal >= 30 ? 0 : 5.99;
  const total = Number((subtotal + tax + deliveryFee).toFixed(2));
  const totalItems = cart.totalItems ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={handleContinueShopping}
              className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition group"
            >
              <FaArrowLeft className="text-gray-600 group-hover:text-red-600 transition" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Your Cart</h1>
              <p className="text-gray-500 text-sm mt-1">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </p>
            </div>
          </div>
          {cart.items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1 px-4 py-2 rounded-lg border border-red-200 hover:bg-red-50 transition"
            >
              <FaTrash size={14} />
              Clear All
            </button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item: ICartItem) => {
              const itemPrice = item.price;
              const itemQuantity = item.quantity;
              const itemTotal = itemPrice * itemQuantity;
              // Safely get product ID
              const productId = getProductId(item);
              
              return (
                <div
                  key={productId}
                  className="bg-white rounded-2xl shadow-md p-4 flex gap-4 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 640px) 96px, 112px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-3xl">🛒</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">{item.name}</h3>
                        <p className="text-gray-500 text-sm">
                          ${itemPrice.toFixed(2)} each
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(productId)}
                        disabled={updatingItems[productId]}
                        className="text-gray-400 hover:text-red-500 transition self-start disabled:opacity-50"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleUpdateQuantity(productId, itemQuantity - 1)}
                          disabled={updatingItems[productId]}
                          className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-red-400 hover:bg-red-50 disabled:opacity-50 transition-all duration-200"
                        >
                          <FaMinus size={12} className="text-gray-600" />
                        </button>
                        <span className="text-gray-800 font-semibold w-8 text-center">
                          {updatingItems[productId] ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                          ) : (
                            itemQuantity
                          )}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(productId, itemQuantity + 1)}
                          disabled={updatingItems[productId]}
                          className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-red-400 hover:bg-red-50 disabled:opacity-50 transition-all duration-200"
                        >
                          <FaPlus size={12} className="text-gray-600" />
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

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-bold text-gray-800 mb-4 pb-3 border-b">Order Summary</h2>

              <div className="flex justify-between py-3">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-3 border-t">
                <span className="text-gray-600">Delivery Fee</span>
                <span className={deliveryFee === 0 ? "text-green-600 font-semibold" : "font-semibold"}>
                  {deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between py-3 border-t">
                <span className="text-gray-600">Tax (10%)</span>
                <span className="font-semibold">${tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-4 border-t-2 mt-2">
                <span className="text-xl font-bold text-gray-800">Total</span>
                <span className="text-2xl font-bold text-red-600">
                  ${total.toFixed(2)}
                </span>
              </div>

              {subtotal < 30 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700 mb-2">
                    Add ${(30 - subtotal).toFixed(2)} more for free delivery
                  </p>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((subtotal / 30) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-4 mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <FaTruck className="text-green-600" />
                  <span className="text-gray-600">Free delivery on orders over $30</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FaShieldAlt className="text-blue-600" />
                  <span className="text-gray-600">Secure payment</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white py-3.5 rounded-xl font-semibold hover:from-red-700 hover:to-red-600 transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
                >
                  <FaLock size={16} />
                  Proceed to Checkout
                </button>
                <button
                  onClick={handleContinueShopping}
                  className="w-full py-3 border-2 border-gray-300 rounded-xl font-semibold hover:border-red-300 hover:text-red-600 transition"
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
