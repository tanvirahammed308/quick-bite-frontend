"use client";

import { useState, useEffect } from "react";
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
  FaCog
} from "react-icons/fa";
import { MdRestaurantMenu } from "react-icons/md";
import { HiOutlineUserAdd } from "react-icons/hi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function Navbar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentUser, loading } = useAppSelector((state) => state.auth); // Note: state.user not state.auth
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Check if user is admin
  const isAdmin = currentUser?.role === "admin";

  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Sign out from Firebase
      await signOut(auth);
      
      // Clear token from localStorage
      localStorage.removeItem("token");
      
      // Clear Redux state using your existing action
      dispatch(clearUserData()); //  Using your existing action
      
      await Swal.fire({
        icon: "success",
        title: "Logged Out",
        text: "You have been logged out successfully",
        timer: 1500,
        showConfirmButton: false,
      });
      
      router.push("/login");
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".user-dropdown")) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Navigation links
  const navLinks = [
    { name: "Home", href: "/", icon: <FaHome className="text-lg" /> },
    { name: "Menu", href: "/menu", icon: <MdRestaurantMenu className="text-lg" /> },
    { name: "Cart", href: "/cart", icon: <FaShoppingCart className="text-lg" /> },
    { name: "Favorites", href: "/favorites", icon: <FaHeart className="text-lg" /> },
  ];

  // Admin links
  const adminLinks = [
    { name: "Dashboard", href: "/admin", icon: <FaClipboardList className="text-lg" /> },
    { name: "Manage Users", href: "/admin/users", icon: <FaUser className="text-lg" /> },
    { name: "Manage Orders", href: "/admin/orders", icon: <FaShoppingCart className="text-lg" /> },
  ];

  // User dropdown links
  const userDropdownLinks = [
    { name: "My Profile", href: "/profile", icon: <FaUserCircle className="text-lg" /> },
    { name: "My Orders", href: "/orders", icon: <FaClipboardList className="text-lg" /> },
    { name: "Settings", href: "/settings", icon: <FaCog className="text-lg" /> },
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:opacity-80 transition"
            >
              <FaStore className="text-blue-600" />
              QuickBite
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
                <span className="text-gray-600">Loading...</span>
              </div>
            ) : currentUser ? (
              // Logged in - User dropdown
              <div className="relative user-dropdown">
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
                    <span className="text-sm font-medium text-gray-700">
                      {currentUser.name?.split(" ")[0] || currentUser.email?.split("@")[0]}
                    </span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800">
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

                    {/* Dropdown Links */}
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

                    {/* Admin Links in dropdown (mobile) */}
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
              // Not logged in - Show login/register buttons
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition font-medium"
                >
                  <div className="flex items-center gap-1">
                    <HiOutlineUserAdd className="text-lg" />
                    Register
                  </div>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
            >
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
              
              {/* Admin links in mobile */}
              {isAdmin && (
                <>
                  <div className="border-t border-gray-100 pt-2 mt-2">
                    <p className="px-3 text-xs text-gray-400 uppercase tracking-wider mb-2">
                      Admin Panel
                    </p>
                    {adminLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                      >
                        {link.icon}
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </>
              )}

              {/* User links in mobile (when logged in) */}
              {currentUser && (
                <>
                  <div className="border-t border-gray-100 pt-2 mt-2">
                    <p className="px-3 text-xs text-gray-400 uppercase tracking-wider mb-2">
                      Account
                    </p>
                    {userDropdownLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                      >
                        {link.icon}
                        {link.name}
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex items-center gap-3 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <FaSignOutAlt />
                      {isLoggingOut ? "Logging out..." : "Logout"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}