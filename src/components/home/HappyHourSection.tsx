// components/home/HappyHourSection.tsx
"use client";

import { FaGlassCheers, FaClock, FaMapMarkerAlt } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";

export default function HappyHourSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-red-50 to-red-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Left Side - Drink Image */}
          <div className="lg:w-1/2 w-full relative">
            <div className="relative">
              {/* Background Decorative Blobs - Hidden on mobile */}
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-red-500 rounded-full opacity-20 blur-2xl hidden md:block"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-red-600 rounded-full opacity-20 blur-2xl hidden md:block"></div>
              
              {/* Main Image Card */}
              <div className="relative bg-gradient-to-br from-red-50 to-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-500">
                <div className="p-4 md:p-6">
                  {/* Drink Image - Responsive heights */}
                  <div className="relative w-full h-64 sm:h-80 md:h-96">
                    <Image
                      src="/images/offer.jpg"
                      alt="Happy Hour Cocktail"
                      fill
                      className="object-contain"
                      priority
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 80vw, (max-width: 1024px) 50vw, 50vw"
                    />
                  </div>
                  
                  {/* Price Tag Overlay - Responsive sizing */}
                  <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-red-600 text-white px-2 py-1 md:px-4 md:py-2 rounded-full shadow-lg transform rotate-12">
                    <span className="text-base md:text-2xl font-bold">$2.29</span>
                    <span className="text-xs md:text-sm">/shot</span>
                  </div>
                  
                  {/* Bottom Text - Responsive sizing */}
                  <div className="text-center mt-3 md:mt-4">
                    <div className="text-4xl md:text-6xl font-bold text-gray-800">29</div>
                    <p className="text-xs md:text-base text-gray-500">The Party!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="lg:w-1/2 w-full text-center lg:text-left">
            {/* Badge - Responsive */}
            <div className="inline-flex items-center gap-2 bg-red-100 text-red-600 px-3 py-1.5 md:px-4 md:py-2 rounded-full mb-4 md:mb-6">
              <FaGlassCheers className="text-base md:text-lg" />
              <span className="text-xs md:text-sm font-medium">Limited Time Offer</span>
            </div>

            {/* Title - Responsive font sizes */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-3 md:mb-4">
              LET US <span className="text-red-600">HAPPY HOUR!</span>
            </h2>

            {/* Description - Responsive text */}
            <p className="text-gray-600 text-sm md:text-lg mb-4 md:mb-6 leading-relaxed">
              Gustavo is your place to gather with your friends and enjoy some of the best drinks around. 
              See you after work! <span className="text-red-500 text-xs md:text-sm">*Happy Hour prices and participation may vary by location.</span>
            </p>

            {/* Info Cards - Responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
              <div className="flex items-center gap-2 md:gap-3 bg-white rounded-xl p-3 md:p-4 shadow-md hover:shadow-lg transition">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaClock className="text-red-600 text-base md:text-xl" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-500">Happy Hours</p>
                  <p className="text-xs md:text-sm font-semibold text-gray-800">Mon - Fri: 4PM - 7PM</p>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3 bg-white rounded-xl p-3 md:p-4 shadow-md hover:shadow-lg transition">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaMapMarkerAlt className="text-red-600 text-base md:text-xl" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-500">Location</p>
                  <p className="text-xs md:text-sm font-semibold text-gray-800">All Participating Bars</p>
                </div>
              </div>
            </div>

            {/* Button - Responsive */}
            <Link
              href="/specials"
              className="inline-flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm md:text-base"
            >
              SEE OUR SPECIALS
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}