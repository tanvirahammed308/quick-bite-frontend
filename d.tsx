"use client";

import { useRef, useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { 
  FaShoppingCart, 
  FaArrowRight, 
  FaStar, 
  FaTruck, 
  FaClock, 
  FaUtensils,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";
import { MdRestaurantMenu } from "react-icons/md";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const slides = [
  {
    id: 1,
    title: "Butter Chicken",
    subtitle: "Creamy & Spicy Delight",
    description: "Experience rich, creamy butter chicken with authentic Indian spices",
    image: "/images/hero/hero1.jpg",
    price: "$14.99",
    rating: 4.8,
    reviews: 2340,
    time: "20-25 min",
    tag: "🔥 Popular"
  },
  {
    id: 2,
    title: "Royal Biryani",
    subtitle: "Fragrant Rice Masterpiece",
    description: "Aromatic basmati rice with tender meat and exotic spices",
    image: "/images/hero/hero2.jpg",
    price: "$16.99",
    rating: 4.9,
    reviews: 1850,
    time: "25-30 min",
    tag: "👑 Chef's Special"
  },
  {
    id: 3,
    title: "Wood Fired Pizza",
    subtitle: "Italian Classic",
    description: "Authentic wood-fired pizza with fresh mozzarella and basil",
    image: "/images/hero/hero3.png",
    price: "$18.99",
    rating: 4.7,
    reviews: 3120,
    time: "15-20 min",
    tag: "🍕 Best Seller"
  },
  {
    id: 4,
    title: "Grilled Burger",
    subtitle: "Juicy & Smoky",
    description: "Premium Angus beef patty with cheese, lettuce, and our secret sauce",
    image: "/images/hero/hero4.jpg",
    price: "$12.99",
    rating: 4.8,
    reviews: 2780,
    time: "15-20 min",
    tag: "🍔 New Arrival"
  },
  {
    id: 5,
    title: "Pasta Alfredo",
    subtitle: "Creamy & Cheesy",
    description: "Silky fettuccine pasta tossed in rich, creamy Alfredo sauce",
    image: "/images/hero/hero5.png",
    price: "$15.99",
    rating: 4.6,
    reviews: 1950,
    time: "20-25 min",
    tag: "🌿 Vegetarian"
  },
  {
    id: 6,
    title: "Seafood Platter",
    subtitle: "Fresh & Tasty",
    description: "Delightful selection of fresh grilled seafood with lemon butter sauce",
    image: "/images/hero/hero6.png",
    price: "$24.99",
    rating: 4.9,
    reviews: 1670,
    time: "25-30 min",
    tag: "🦞 Chef's Special"
  }
];

export default function HeroSection() {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Navigation Buttons with Icons */}
      <button
        ref={prevRef}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 cursor-pointer"
        aria-label="Previous slide"
      >
        <FaChevronLeft size={20} />
      </button>
      <button
        ref={nextRef}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 cursor-pointer"
        aria-label="Next slide"
      >
        <FaChevronRight size={20} />
      </button>

      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true, dynamicBullets: true }}
        navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
        loop={true}
        className="w-full h-full"
        onInit={(swiper) => {
          // @ts-ignore
          swiper.params.navigation.prevEl = prevRef.current;
          // @ts-ignore
          swiper.params.navigation.nextEl = nextRef.current;
          swiper.navigation.init();
          swiper.navigation.update();
        }}
      >
        {slides.map((slide, idx) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-screen">
              {/* Background Image */}
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
                priority={idx === 0}
              />
              
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-black/50"></div>

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
                <div className="max-w-2xl mx-auto">
                  {/* Tag */}
                  <span className="inline-block bg-red-600 text-white text-xs px-3 py-1 rounded-full mb-3">
                    {slide.tag}
                  </span>

                  {/* Title */}
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {slide.title}
                  </h1>
                  
                  {/* Subtitle */}
                  <p className="text-red-500 text-lg md:text-xl font-semibold mb-3">
                    {slide.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-gray-200 text-sm md:text-base mb-5 max-w-lg mx-auto">
                    {slide.description}
                  </p>

                  {/* Rating & Time */}
                  <div className="flex items-center justify-center gap-4 mb-5">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className="text-yellow-500 text-xs" />
                      ))}
                      <span className="text-white/70 text-xs ml-1">{slide.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaClock className="text-red-500 text-xs" />
                      <span className="text-white/70 text-xs">{slide.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaTruck className="text-red-500 text-xs" />
                      <span className="text-white/70 text-xs">Free Delivery</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-4">
                    <span className="text-3xl font-bold text-red-500">{slide.price}</span>
                    <span className="text-gray-300 text-sm ml-1">+ free delivery</span>
                  </div>

                  {/* Buttons with Icons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                      href="/order-now"
                      className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition duration-300 hover:scale-105"
                    >
                      <FaShoppingCart size={16} />
                      Order Now
                    </Link>
                    <Link
                      href="/menu"
                      className="flex items-center gap-2 px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold text-sm transition duration-300 group"
                    >
                      <MdRestaurantMenu size={16} />
                      View Menu
                      <FaArrowRight className="group-hover:translate-x-1 transition-transform" size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .swiper-pagination-bullet {
          background: white !important;
          opacity: 0.5;
        }
        .swiper-pagination-bullet-active {
          background: #dc2626 !important;
          opacity: 1;
        }
        .swiper-pagination {
          bottom: 20px !important;
        }
      `}</style>
    </section>
  );
}