// components/shared/Navbar.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { clearUserData, setCurrentUser } from "@/redux/features/auth/auth.slice";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import Swal from "sweetalert2";
import api from "@/lib/axios";

// React Icons
import {
  FaHome,
  FaUser,
  FaShoppingCart,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUserCircle,
  FaStore,
  FaClipboardList,
  FaCog,
  FaCalendarAlt,
  FaInfoCircle,
  FaEnvelope,
} from "react-icons/fa";
import { MdRestaurantMenu } from "react-icons/md";
import { HiOutlineUserAdd } from "react-icons/hi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import Image from "next/image";

// Shape of the data returned from the reservation SweetAlert2 form
interface ReservationFormData {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  requests: string;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const { currentUser, loading } = useAppSelector((state) => state.auth);
  const { cart } = useAppSelector((state) => state.cart);

  const cartCount = cart?.totalItems ?? 0;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
  const restoreUserSession = async () => {
    const token = localStorage.getItem("token");

    // No token at all -> definitely logged out, resolve immediately.
    if (!token) {
      // Defer to break the synchronous dispatch chain
      queueMicrotask(() => dispatch(clearUserData()));
      return;
    }

    // We already have a user in Redux -> nothing to restore.
    if (currentUser) {
      return;
    }

    // We have a token but no user in Redux yet -> verify with backend.
    try {
      const response = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.user) {
        dispatch(setCurrentUser(response.data.user));
        localStorage.setItem("user", JSON.stringify(response.data.user));
      } else {
        dispatch(clearUserData());
      }
    } catch (error) {
      console.error("Session expired:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      dispatch(clearUserData());
    }
  };

  restoreUserSession();
}, [dispatch, currentUser]);

  // Restore user session on page refresh (only on client)
  // Every path below MUST resolve loading (via dispatch) so the navbar
  // can never get stuck showing the "Loading..." state.
  useEffect(() => {
    const restoreUserSession = async () => {
      const token = localStorage.getItem("token");

      // No token at all -> definitely logged out, resolve immediately.
      if (!token) {
        dispatch(clearUserData());
        return;
      }

      // We already have a user in Redux -> nothing to restore.
      if (currentUser) {
        return;
      }

      // We have a token but no user in Redux yet -> verify with backend.
      try {
        const response = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.user) {
          dispatch(setCurrentUser(response.data.user));
          localStorage.setItem("user", JSON.stringify(response.data.user));
        } else {
          dispatch(clearUserData());
        }
      } catch (error) {
        console.error("Session expired:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        dispatch(clearUserData()); // resolve loading on failure
      }
    };

    restoreUserSession();
  }, [dispatch, currentUser]);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await signOut(auth);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      dispatch(clearUserData());

      await Swal.fire({
        icon: "success",
        title: "Logged Out",
        text: "You have been logged out successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      router.push("/login");
      setIsSidebarOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to logout. Please try again.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setIsLoggingOut(false);
      setIsDropdownOpen(false);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false);
      }

      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSidebarOpen]);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const navLinks = [
    { name: "Home", href: "/", icon: <FaHome className="text-xl" /> },
    { name: "Menu", href: "/menu", icon: <MdRestaurantMenu className="text-xl" /> },
    { name: "Cart", href: "/cart", icon: <FaShoppingCart className="text-xl" /> },
    { name: "About", href: "/about", icon: <FaInfoCircle className="text-xl" /> },
    { name: "Contact", href: "/contact", icon: <FaEnvelope className="text-xl" /> },
  ];

  const adminLinks = [
    { name: "Dashboard", href: "/admin", icon: <FaClipboardList className="text-xl" /> },
    { name: "Manage Products", href: "/admin/products", icon: <FaStore className="text-xl" /> },
    { name: "Manage Users", href: "/admin/users", icon: <FaUser className="text-xl" /> },
    { name: "Manage Orders", href: "/admin/orders", icon: <FaShoppingCart className="text-xl" /> },
  ];

  const userDropdownLinks = [
    { name: "My Profile", href: "/profile", icon: <FaUserCircle className="text-xl" /> },
    { name: "My Orders", href: "/orders", icon: <FaClipboardList className="text-xl" /> },
    { name: "Settings", href: "/settings", icon: <FaCog className="text-xl" /> },
  ];

  const handleNavigation = (href: string) => {
    setIsSidebarOpen(false);
    setIsDropdownOpen(false);
    router.push(href);
  };

  const handleReservation = () => {
    Swal.fire<ReservationFormData>({
      title: "Table Reservation",
      html: `
        <form id="reservation-form" class="space-y-4 text-left">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" id="name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" placeholder="Your name">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" id="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" placeholder="your@email.com">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" id="phone" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" placeholder="Phone number">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" id="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <select id="time" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500">
              <option value="12:00">12:00 PM</option>
              <option value="13:00">1:00 PM</option>
              <option value="14:00">2:00 PM</option>
              <option value="18:00">6:00 PM</option>
              <option value="19:00">7:00 PM</option>
              <option value="20:00">8:00 PM</option>
              <option value="21:00">9:00 PM</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
            <select id="guests" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500">
              <option value="1">1 Guest</option>
              <option value="2">2 Guests</option>
              <option value="3">3 Guests</option>
              <option value="4">4 Guests</option>
              <option value="5">5 Guests</option>
              <option value="6">6 Guests</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
            <textarea id="requests" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" placeholder="Any special requests?"></textarea>
          </div>
        </form>
      `,
      showCancelButton: true,
      confirmButtonText: "Book Now",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      background: "#ffffff",
      customClass: {
        title: "text-red-600 text-2xl font-bold",
        confirmButton: "bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg",
        cancelButton: "bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg",
      },
      preConfirm: (): ReservationFormData | false => {
        const name = (document.getElementById("name") as HTMLInputElement)?.value;
        const email = (document.getElementById("email") as HTMLInputElement)?.value;
        const phone = (document.getElementById("phone") as HTMLInputElement)?.value;
        const date = (document.getElementById("date") as HTMLInputElement)?.value;
        const time = (document.getElementById("time") as HTMLSelectElement)?.value;
        const guests = (document.getElementById("guests") as HTMLSelectElement)?.value;
        const requests = (document.getElementById("requests") as HTMLTextAreaElement)?.value;

        if (!name || !email || !phone || !date) {
          Swal.showValidationMessage("Please fill all required fields");
          return false;
        }

        return { name, email, phone, date, time, guests, requests };
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const booking: ReservationFormData = result.value;
        Swal.fire({
          icon: "success",
          title: "Reservation Confirmed!",
          text: `Thank you ${booking.name}! Your table has been booked for ${booking.date} at ${booking.time}.`,
          confirmButtonColor: "#dc2626",
          background: "#ffffff",
          iconColor: "#dc2626",
        });
      }
    });
  };

  // Show loading skeleton on server-side or before mounting
  if (!isMounted) {
    return (
      <nav className="bg-black/50 shadow-lg sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink:0">
              <div className="flex items-center gap-2 text-xl font-bold text-gray-300">
                <div className="w-10 h-10 bg-gray-600 rounded-full animate-pulse"></div>
                <div className="w-32 h-6 bg-gray-600 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-20 h-10 bg-gray-600 rounded-lg animate-pulse"></div>
              <div className="w-24 h-10 bg-gray-600 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="bg-black/50 shadow-lg sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink:0">
              <button
                onClick={() => handleNavigation("/")}
                className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer"
              >
                <Image
                  src="/images/logo/logo.png"
                  alt="Red Chili"
                  width={120}
                  height={40}
                  className="w-32 h-10 object-contain"
                />
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavigation(link.href)}
                  className={`relative flex items-center gap-2 transition-colors duration-200 font-medium cursor-pointer ${
                    isActive(link.href)
                      ? "text-red-500 border-b-2 border-red-500 pb-1"
                      : "text-white hover:text-red-500"
                  }`}
                >
                  {link.icon}
                  {link.name}

                  {/* Cart count badge */}
                  {link.name === "Cart" && cartCount > 0 && (
                    <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </button>
              ))}

              {/* Reservation Button */}
              <button
                onClick={handleReservation}
                className={`flex items-center gap-2 transition-colors duration-200 font-medium cursor-pointer ${
                  pathname === "/reservation"
                    ? "text-red-500 border-b-2 border-red-500 pb-1"
                    : "text-white hover:text-red-500"
                }`}
              >
                <FaCalendarAlt />
                Book a Table
              </button>
            </div>

            {/* Right side - User section */}
            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="flex items-center gap-2">
                  <AiOutlineLoading3Quarters className="animate-spin text-white" />
                  <span className="text-white hidden sm:inline">Loading...</span>
                </div>
              ) : currentUser ? (
                <div className="relative user-dropdown hidden md:block" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 focus:outline-none"
                  >
                    <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-2 hover:bg-white/20 transition">
                      {currentUser.avatar ? (
                        <Image
  src={currentUser.avatar}
  alt={currentUser.name}
  width={32}
  height={32}
  className="w-8 h-8 rounded-full object-cover"
/>
                      ) : (
                        <FaUserCircle className="text-2xl text-white" />
                      )}
                      <span className="text-sm font-medium text-white hidden lg:inline">
                        {currentUser.name?.split(" ")[0] || currentUser.email?.split("@")[0]}
                      </span>
                    </div>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {currentUser.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                            Admin
                          </span>
                        )}
                      </div>

                      {userDropdownLinks.map((link) => (
                        <button
                          key={link.name}
                          onClick={() => handleNavigation(link.href)}
                          className={`flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 transition text-left ${
                            isActive(link.href) ? "text-red-600 bg-red-50" : "text-gray-700"
                          }`}
                        >
                          {link.icon}
                          {link.name}
                        </button>
                      ))}

                      {isAdmin && (
                        <>
                          <div className="border-t border-gray-100 my-1"></div>
                          {adminLinks.map((link) => (
                            <button
                              key={link.name}
                              onClick={() => handleNavigation(link.href)}
                              className={`flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 transition text-left ${
                                isActive(link.href) ? "text-red-600 bg-red-50" : "text-gray-700"
                              }`}
                            >
                              {link.icon}
                              {link.name}
                            </button>
                          ))}
                        </>
                      )}

                      <div className="border-t border-gray-100 my-1"></div>

                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        {isLoggingOut ? (
                          <AiOutlineLoading3Quarters className="animate-spin" />
                        ) : (
                          <FaSignOutAlt />
                        )}
                        {isLoggingOut ? "Logging out..." : "Logout"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-3">
                  <button
                    onClick={() => handleNavigation("/login")}
                    className="px-4 py-2 text-white border border-red-600 rounded-lg hover:bg-red-600 transition font-medium cursor-pointer"
                  >
                    Login
                  </button>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                ref={menuButtonRef}
                onClick={toggleSidebar}
                className="md:hidden relative p-2 rounded-lg text-white hover:bg-white/10 transition menu-button focus:outline-none"
                aria-label="Toggle menu"
              >
                {isSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}

                {/* Cart count badge on mobile hamburger */}
                {cartCount > 0 && !isSidebarOpen && (
                  <span className="absolute -top-1 -right-3 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      {isSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
            onClick={closeSidebar}
          />

          <div
            ref={sidebarRef}
            className="fixed left-0 top-14 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out overflow-y-auto"
          >
            {currentUser && (
              <div className="p-4 border-b border-gray-200 bg-linear-r from-red-50 to-red-50">
                <div className="flex items-center gap-3">
                  {currentUser.avatar ? (
                    <Image
  src={currentUser.avatar}
  alt={currentUser.name}
  width={48}
  height={48}
  className="w-12 h-12 rounded-full object-cover"
/>
                  ) : (
                    <FaUserCircle className="text-4xl text-gray-500" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{currentUser.name}</p>
                    <p className="text-sm text-gray-500 truncate">{currentUser.email}</p>
                    {isAdmin && (
                      <span className="inline-block mt-1 text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="py-4">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavigation(link.href)}
                  className={`relative flex items-center gap-3 w-full px-4 py-3 transition-colors text-left ${
                    isActive(link.href)
                      ? "text-red-600 bg-red-50 border-l-4 border-red-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {link.icon}
                  <span>{link.name}</span>

                  {link.name === "Cart" && cartCount > 0 && (
                    <span className="ml-auto bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </button>
              ))}

              {/* Mobile Reservation Button */}
              <button
                onClick={() => {
                  closeSidebar();
                  handleReservation();
                }}
                className={`flex items-center gap-3 w-full px-4 py-3 transition-colors text-left ${
                  pathname === "/reservation"
                    ? "text-red-600 bg-red-50 border-l-4 border-red-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FaCalendarAlt />
                <span>Book a Table</span>
              </button>

              {isAdmin && (
                <>
                  <div className="border-t border-gray-100 my-2"></div>
                  <p className="px-4 text-xs text-gray-400 uppercase tracking-wider mb-2 mt-2">
                    Admin Panel
                  </p>
                  {adminLinks.map((link) => (
                    <button
                      key={link.name}
                      onClick={() => handleNavigation(link.href)}
                      className={`flex items-center gap-3 w-full px-4 py-3 transition-colors text-left ${
                        isActive(link.href)
                          ? "text-red-600 bg-red-50 border-l-4 border-red-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {link.icon}
                      <span>{link.name}</span>
                    </button>
                  ))}
                </>
              )}

              {currentUser && (
                <>
                  <div className="border-t border-gray-100 my-2"></div>
                  <p className="px-4 text-xs text-gray-400 uppercase tracking-wider mb-2 mt-2">
                    Account
                  </p>
                  {userDropdownLinks.map((link) => (
                    <button
                      key={link.name}
                      onClick={() => handleNavigation(link.href)}
                      className={`flex items-center gap-3 w-full px-4 py-3 transition-colors text-left ${
                        isActive(link.href)
                          ? "text-red-600 bg-red-50 border-l-4 border-red-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {link.icon}
                      <span>{link.name}</span>
                    </button>
                  ))}
                </>
              )}
            </div>

            {!currentUser && !loading && (
              <div className="border-t border-gray-100 pt-4 pb-6">
                <div className="px-4 space-y-3">
                  <button
                    onClick={() => handleNavigation("/login")}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition font-medium"
                  >
                    <FaUserCircle className="text-lg" />
                    Login
                  </button>
                  <button
                    onClick={() => handleNavigation("/register")}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                  >
                    <HiOutlineUserAdd className="text-lg" />
                    Register
                  </button>
                </div>
              </div>
            )}

            {currentUser && (
              <div className="border-t border-gray-100 pt-4 pb-6">
                <div className="px-4">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition font-medium"
                  >
                    {isLoggingOut ? (
                      <AiOutlineLoading3Quarters className="animate-spin" />
                    ) : (
                      <FaSignOutAlt />
                    )}
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              </div>
            )}

            <div className="border-t border-gray-100 pt-4 pb-6 bg-gray-50">
              <div className="px-4">
                <p className="text-xs text-gray-400 text-center">
                  &copy; 2024 Red Chili. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
