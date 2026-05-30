"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  FaHeart, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUserCircle,
  FaStore,
  FaClipboardList,
  FaCog,
} from "react-icons/fa";
import { MdOutlineRestaurantMenu, MdRestaurantMenu } from "react-icons/md";
import { HiOutlineUserAdd } from "react-icons/hi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function Navbar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentUser, loading } = useAppSelector((state) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Refs for click outside
  const sidebarRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if user is admin
  const isAdmin = currentUser?.role === "admin";

  // ✅ Restore user session on page refresh
  useEffect(() => {
    const restoreUserSession = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      
      if (token && savedUser && !currentUser) {
        try {
          // Verify token is still valid
          const response = await api.get("/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.data.user) {
            dispatch(setCurrentUser(response.data.user));
            // Update localStorage with fresh user data
            localStorage.setItem("user", JSON.stringify(response.data.user));
          }
        } catch (error) {
          console.error("Session expired:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
    };
    
    restoreUserSession();
  }, [dispatch, currentUser]);

  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      await signOut(auth);
      localStorage.removeItem("token");
      localStorage.removeItem("user"); // ✅ Also remove user from localStorage
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

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close sidebar if clicking outside
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) &&
          menuButtonRef.current && !menuButtonRef.current.contains(event.target as Node)) {
        setIsSidebarOpen(false);
      }
      
      // Close dropdown if clicking outside
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent body scroll when sidebar is open
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

  // Navigation links
  const navLinks = [
    { name: "Home", href: "/", icon: <FaHome className="text-xl" /> },
    { name: "Menu", href: "/menu", icon: <MdRestaurantMenu className="text-xl" /> },
    { name: "Cart", href: "/cart", icon: <FaShoppingCart className="text-xl" /> },
    { name: "Favorites", href: "/favorites", icon: <FaHeart className="text-xl" /> },
  ];

  // Admin links
  const adminLinks = [
    { name: "Dashboard", href: "/admin", icon: <FaClipboardList className="text-xl" /> },
    { name: "Manage Users", href: "/admin/users", icon: <FaUser className="text-xl" /> },
    { name: "Manage Orders", href: "/admin/orders", icon: <FaShoppingCart className="text-xl" /> },
  ];

  // User dropdown links
  const userDropdownLinks = [
    { name: "My Profile", href: "/profile", icon: <FaUserCircle className="text-xl" /> },
    { name: "My Orders", href: "/orders", icon: <FaClipboardList className="text-xl" /> },
    { name: "Settings", href: "/settings", icon: <FaCog className="text-xl" /> },
  ];

  return (
    <>
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link 
                href="/" 
                className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:opacity-80 transition"
                onClick={closeSidebar}
              >
                <MdOutlineRestaurantMenu className="text-blue-600" />
                <span >QuickBite</span>
               
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
              
              {/* Admin Links (visible only to admin) */}
              {isAdmin && (
                <div className="flex items-center space-x-8 border-l pl-8 ml-4">
                  {adminLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                    >
                      {link.icon}
                      {link.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Right side - User section */}
            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="flex items-center gap-2">
                  <AiOutlineLoading3Quarters className="animate-spin text-blue-600" />
                  <span className="text-gray-600 hidden sm:inline">Loading...</span>
                </div>
              ) : currentUser ? (
                // Logged in - User dropdown (desktop only)
                <div className="relative user-dropdown hidden md:block" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 focus:outline-none"
                  >
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2 hover:bg-gray-200 transition">
                      {currentUser.avatar ? (
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <FaUserCircle className="text-2xl text-gray-600" />
                      )}
                      <span className="text-sm font-medium text-gray-700 hidden lg:inline">
                        {currentUser.name?.split(" ")[0] || currentUser.email?.split("@")[0]}
                      </span>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {currentUser.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {currentUser.email}
                        </p>
                        {isAdmin && (
                          <span className="inline-block mt-1 text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                            Admin
                          </span>
                        )}
                      </div>

                      {userDropdownLinks.map((link) => (
                        <Link
                          key={link.name}
                          href={link.href}
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                        >
                          {link.icon}
                          {link.name}
                        </Link>
                      ))}

                      {isAdmin && (
                        <>
                          <div className="border-t border-gray-100 my-1"></div>
                          {adminLinks.map((link) => (
                            <Link
                              key={link.name}
                              href={link.href}
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                            >
                              {link.icon}
                              {link.name}
                            </Link>
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
                // Desktop Login/Register buttons
                <div className="hidden md:flex items-center gap-3">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
                  >
                    Login
                  </Link>
                  
                </div>
              )}

              {/* Mobile menu button */}
              <button
                ref={menuButtonRef}
                onClick={toggleSidebar}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition menu-button focus:outline-none"
                aria-label="Toggle menu"
              >
                {isSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      {isSidebarOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
            onClick={closeSidebar}
          />
          
          {/* Sidebar Content */}
          <div
            ref={sidebarRef}
            className="fixed left-0 top-14 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out overflow-y-auto"
          >
            {/* Sidebar Header - User Info (when logged in) */}
            {currentUser && (
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-3">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
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

            {/* Navigation Links */}
            <div className="py-4">
              
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={closeSidebar}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              ))}

              {/* Admin Links in Sidebar */}
              {isAdmin && (
                <>
                  <div className="border-t border-gray-100 my-2"></div>
                  <p className="px-4 text-xs text-gray-400 uppercase tracking-wider mb-2 mt-2">Admin Panel</p>
                  {adminLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={closeSidebar}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {link.icon}
                      <span>{link.name}</span>
                    </Link>
                  ))}
                </>
              )}

              {/* User Links in Sidebar (when logged in) */}
              {currentUser && (
                <>
                  <div className="border-t border-gray-100 my-2"></div>
                  <p className="px-4 text-xs text-gray-400 uppercase tracking-wider mb-2 mt-2">Account</p>
                  {userDropdownLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={closeSidebar}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {link.icon}
                      <span>{link.name}</span>
                    </Link>
                  ))}
                </>
              )}
            </div>

            {/* Auth Buttons for Sidebar (when not logged in) */}
            {!currentUser && !loading && (
              <div className="border-t border-gray-100 pt-4 pb-6">
                <div className="px-4 space-y-3">
                  <Link
                    href="/login"
                    onClick={closeSidebar}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
                  >
                    <FaUserCircle className="text-lg" />
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeSidebar}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition font-medium"
                  >
                    <HiOutlineUserAdd className="text-lg" />
                    Register
                  </Link>
                </div>
              </div>
            )}

            {/* Logout Button in Sidebar */}
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

            {/* Sidebar Footer */}
            <div className="border-t border-gray-100 pt-4 pb-6 bg-gray-50">
              <div className="px-4">
                <p className="text-xs text-gray-400 text-center">
                  &copy; 2024 QuickBite. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}