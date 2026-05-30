"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaFacebook, FaTwitter, FaInstagram, FaGithub, FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, FaHeart } from "react-icons/fa";
import { MdRestaurantMenu, MdDeliveryDining } from "react-icons/md";
import { HiOutlineUserAdd } from "react-icons/hi";

export default function Footer() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  // Quick links
  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Menu", href: "/menu" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "FAQs", href: "/faqs" },
  ];

  // Legal links
  const legalLinks = [
    { name: "Terms of Service", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Refund Policy", href: "/refund" },
    { name: "Cookie Policy", href: "/cookie" },
  ];

  // Social media links
  const socialLinks = [
    { name: "Facebook", icon: <FaFacebook className="text-xl" />, href: "https://facebook.com", color: "hover:text-blue-600" },
    { name: "Twitter", icon: <FaTwitter className="text-xl" />, href: "https://twitter.com", color: "hover:text-blue-400" },
    { name: "Instagram", icon: <FaInstagram className="text-xl" />, href: "https://instagram.com", color: "hover:text-pink-600" },
    { name: "GitHub", icon: <FaGithub className="text-xl" />, href: "https://github.com", color: "hover:text-gray-900" },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MdRestaurantMenu className="text-3xl text-blue-500" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                QuickBite
              </h2>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              QuickBite is your go-to platform for delicious food delivery. 
              Order your favorite meals from the best restaurants in town.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-gray-400 transition-colors duration-200 ${social.color}`}
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Hours Column */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact & Hours</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <FaMapMarkerAlt className="text-blue-400 mt-0.5" />
                <span className="text-gray-400">123 Food Street, Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <FaPhone className="text-blue-400" />
                <a href="tel:+880123456789" className="text-gray-400 hover:text-blue-400 transition">
                  +880 1234 56789
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <FaEnvelope className="text-blue-400" />
                <a href="mailto:support@quickbite.com" className="text-gray-400 hover:text-blue-400 transition">
                  support@quickbite.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <FaClock className="text-blue-400 mt-0.5" />
                <div className="text-gray-400">
                  <p>Mon - Fri: 10:00 AM - 11:00 PM</p>
                  <p>Sat - Sun: 11:00 AM - 12:00 AM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <MdDeliveryDining className="text-2xl text-blue-500" />
              <p className="text-gray-400 text-sm">
                Subscribe to get special offers and updates!
              </p>
            </div>
            <form className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 md:w-64 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              &copy; {currentYear} QuickBite. All rights reserved.
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              Made with <FaHeart className="text-red-500 text-xs" /> by QuickBite Team
            </p>
            <div className="flex gap-4 text-xs text-gray-500">
              <Link href="/sitemap" className="hover:text-blue-400 transition">
                Sitemap
              </Link>
              <Link href="/accessibility" className="hover:text-blue-400 transition">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}