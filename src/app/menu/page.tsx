// app/components/MenuSection.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getAllProducts } from "@/redux/features/product/product.slice";
import { IProduct } from "@/redux/features/product/product.types";

import { FaPlus, FaMinus, FaEye } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  updateLocalCartItem,
} from "@/redux/features/cart/cart.slice";
import Swal from "sweetalert2";


interface MenuSectionProps {
  limit?: number;
  title?: string;
  subtitle?: string;
  showCart?: boolean;
}

interface LocalCartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export default function MenuSection({
  limit,
  title = "OUR MENU",
  subtitle = "Discover our signature dishes crafted with passion",
  showCart = true,
}: MenuSectionProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { products, loading, error } = useAppSelector(
    (state) => state.product
  );
  const { cart } = useAppSelector(
    (state) => state.cart
  );
  const { currentUser } = useAppSelector((state) => state.auth);

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Record<string, boolean>>({});
  const [localCartItems, setLocalCartItems] = useState<LocalCartItem[]>([]);
  
  // Use ref to prevent infinite loops
  const isUpdatingFromStorage = useRef(false);
  const isFirstRender = useRef(true);

 

  // Listen for storage changes (when CartPage updates the cart)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart' && !isUpdatingFromStorage.current) {
        isUpdatingFromStorage.current = true;
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          try {
            const parsed = JSON.parse(savedCart);
            if (Array.isArray(parsed)) {
              setLocalCartItems(parsed);
            }
          } catch (e) {
            console.error('Failed to parse cart:', e);
          }
        }
        setTimeout(() => {
          isUpdatingFromStorage.current = false;
        }, 100);
      }
    };

    const handleCartUpdated = () => {
      if (!isUpdatingFromStorage.current) {
        isUpdatingFromStorage.current = true;
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          try {
            const parsed = JSON.parse(savedCart);
            if (Array.isArray(parsed)) {
              setLocalCartItems(parsed);
            }
          } catch (e) {
            console.error('Failed to parse cart:', e);
          }
        }
        setTimeout(() => {
          isUpdatingFromStorage.current = false;
        }, 100);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleCartUpdated);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdated);
    };
  }, []);

  // Sync localStorage when localCartItems changes (but prevent infinite loop)
  useEffect(() => {
    if (!isFirstRender.current && !isUpdatingFromStorage.current) {
      localStorage.setItem('cart', JSON.stringify(localCartItems));
      // Dispatch custom event for same-tab updates
      window.dispatchEvent(new Event('cartUpdated'));
    }
  }, [localCartItems]);

  useEffect(() => {
    dispatch(getAllProducts());
    if (currentUser) {
      dispatch(getCart());
    }
  }, [dispatch, currentUser]);

  // Group products by category
  const groupedProducts = products.reduce<Record<string, IProduct[]>>(
    (acc, product) => {
      const category = product.category ?? "Other";
      (acc[category] = acc[category] || []).push(product);
      return acc;
    },
    {}
  );

  const availableCategories = Object.keys(groupedProducts).sort();

  const getDisplayPrice = (product: IProduct) => {
    if (product.name === "Slow Cooker Chile") {
      return "$15.00 - $25.00";
    }
    return `$${product.price.toFixed(2)}`;
  };

  const getBasePrice = (product: IProduct) => {
    if (product.name === "Slow Cooker Chile") return 15;
    return product.price;
  };

  const updateQuantity = (productId: string, change: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) + change),
    }));
  };

  const handleAddToCart = async (product: IProduct) => {
    if (!currentUser) {
      Swal.fire({
        icon: "info",
        title: "Login Required",
        text: "Please login to add items to your cart",
        confirmButtonColor: "#dc2626",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Login",
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/login");
        }
      });
      return;
    }

    const quantity = quantities[product._id] || 1;
    if (quantity === 0) return;

    // Add to localStorage cart
    const existingIndex = localCartItems.findIndex(item => item.id === product._id);
    let updatedLocalCart;
    if (existingIndex !== -1) {
      updatedLocalCart = [...localCartItems];
      updatedLocalCart[existingIndex].quantity += quantity;
    } else {
      updatedLocalCart = [...localCartItems, {
        id: product._id,
        name: product.name,
        image: product.image || '',
        price: getBasePrice(product),
        quantity: quantity
      }];
    }
    setLocalCartItems(updatedLocalCart);

    // Also try to add to Redux cart
    try {
      await dispatch(addToCart({ productId: product._id, quantity })).unwrap();
    } catch (error: unknown) {
      console.error('Redux add to cart failed:', error);
    }

    setQuantities((prev) => ({ ...prev, [product._id]: 0 }));
    setShowCartSidebar(true);
    
    Swal.fire({
      icon: "success",
      title: "Added to Cart!",
      text: `${quantity} × ${product.name} added to your cart`,
      timer: 1500,
      showConfirmButton: false,
      position: "bottom-end",
      toast: true,
    });
  };

  const handleUpdateCartQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveFromCart(productId);
      return;
    }

    // Update localStorage cart
    setLocalCartItems(prev => 
      prev.map(item => 
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );

    // Update UI immediately in Redux
    dispatch(updateLocalCartItem({ productId, quantity: newQuantity }));
    
    setUpdatingItems((prev) => ({ ...prev, [productId]: true }));
    try {
      await dispatch(updateCartItem({ productId, quantity: newQuantity })).unwrap();
    } catch (error: unknown) {
  Swal.fire({
    icon: "error",
    title: "Error",
    text: error instanceof Error ? error.message : "Something went wrong",
    confirmButtonColor: "#dc2626",
  });
} finally {
      setUpdatingItems((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleRemoveFromCart = async (productId: string) => {
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
      setLocalCartItems(prev => prev.filter(item => item.id !== productId));

      try {
        await dispatch(removeCartItem(productId)).unwrap();
        Swal.fire({
          icon: "success",
          title: "Removed!",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error: unknown) {
  Swal.fire({
    icon: "error",
    title: "Error",
    text: error instanceof Error ? error.message : "Something went wrong",
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
      setLocalCartItems([]);

      try {
        await dispatch(clearCart()).unwrap();
        Swal.fire({
          icon: "success",
          title: "Cleared!",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error: unknown) {
  Swal.fire({
    icon: "error",
    title: "Error",
    text: error instanceof Error ? error.message : "Something went wrong",
    confirmButtonColor: "#dc2626",
  });
}
    }
  };

  const handleViewDetails = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  // Use localCartItems for count and total when available, fallback to Redux cart
  const cartTotal = localCartItems.length > 0 
    ? localCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    : cart?.totalPrice || 0;
    
  const cartItemCount = localCartItems.length > 0
    ? localCartItems.reduce((sum, item) => sum + item.quantity, 0)
    : cart?.totalItems || 0;

  const displayCartItems = localCartItems.length > 0 ? localCartItems : (cart?.items || []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600">Error loading menu: {error}</p>
        <button
          onClick={() => dispatch(getAllProducts())}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        {/* HERO */}
        <div
          className="relative h-80 md:h-96 bg-cover bg-center rounded-2xl overflow-hidden mb-12 shadow-lg"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200')",
            backgroundBlendMode: "overlay",
          }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-3 tracking-tight">
              {title}
            </h1>
            <div className="w-20 h-1 bg-red-500 mx-auto my-3 rounded-full" />
            <p className="text-lg text-gray-200 max-w-2xl mx-auto">
              {subtitle}
            </p>
          </div>
        </div>

        {/* MENU GRID */}
        <div className="max-w-7xl mx-auto">
          <div className="space-y-12">
            {availableCategories.map((category) => (
              <div key={category}>
                {/* CATEGORY HEADER */}
                <div className="mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-red-500 rounded-full" />
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                      {category}
                    </h2>
                    <div className="flex-1 h-px bg-gray-300" />
                    <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-300">
                      {groupedProducts[category].length} items
                    </span>
                  </div>
                </div>

                {/* GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {groupedProducts[category].slice(0, limit).map((product) => (
                    <div
                      key={product._id}
                      className="bg-white border-2 border-gray-200 rounded-xl hover:border-red-300 hover:shadow-lg transition-all overflow-hidden group"
                    >
                      {/* IMAGE */}
                      <div
                        className="h-44 bg-gray-100 border-b border-gray-200 relative cursor-pointer"
                        onClick={() => handleViewDetails(product._id)}
                      >
                        {product.image ? (
                          <img
                            src={product.image}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            alt={product.name}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl">
                            🍽️
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <span className="bg-white text-gray-800 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2">
                            <FaEye /> Quick View
                          </span>
                        </div>
                      </div>

                      {/* INFO */}
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-gray-800 text-lg">
                              {product.name}
                            </h3>
                            <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                              {product.description}
                            </p>
                          </div>
                          <span className="text-red-600 font-bold whitespace-nowrap ml-2">
                            {getDisplayPrice(product)}
                          </span>
                        </div>

                        {/* BUTTONS SECTION */}
                        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t-2 border-gray-200">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(product._id, -1)}
                              className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
                            >
                              <FaMinus size={12} />
                            </button>
                            <span className="w-6 text-center font-medium text-sm">
                              {quantities[product._id] || 0}
                            </span>
                            <button
                              onClick={() => updateQuantity(product._id, 1)}
                              className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
                            >
                              <FaPlus size={12} />
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewDetails(product._id)}
                              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      
    </section>
  );
}