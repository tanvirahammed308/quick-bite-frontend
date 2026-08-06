// components/home/HowItWorksSection.tsx
"use client";

import { FaUtensils, FaTruck, FaTemperatureHigh, FaRedoAlt } from "react-icons/fa";


export default function HowItWorksSection() {
  const steps = [
    {
      id: 1,
      title: "Choose your meals",
      icon: <FaUtensils className="text-3xl text-red-600" />,
      description: "Browse our menu and select your favorite dishes",
      bgColor: "bg-red-50",
      step: "01"
    },
    {
      id: 2,
      title: "We cook & deliver",
      icon: <FaTruck className="text-3xl text-red-600" />,
      description: "Our chefs prepare fresh meals and deliver to your door",
      bgColor: "bg-red-100",
      step: "02"
    },
    {
      id: 3,
      title: "Heat & eat",
      icon: <FaTemperatureHigh className="text-3xl text-red-600" />,
      description: "Simply heat and enjoy restaurant-quality food at home",
      bgColor: "bg-red-50",
      step: "03"
    },
    {
      id: 4,
      title: "Enjoy & Repeat",
      icon: <FaRedoAlt className="text-3xl text-red-600" />,
      description: "Love your meal? Order again and earn rewards!",
      bgColor: "bg-red-100",
      step: "04"
    }
  ];

  const popularItems = [
    { name: "Pizza Bacon Slice", price: 14.90, image: "/images/pizza.jpg" },
    { name: "BBQ Chicken Wings", price: 5.90, image: "/images/wings.jpg" },
    { name: "Margherita Pizza", price: 12.90, image: "/images/margherita.jpg" },
    { name: "Caesar Salad", price: 8.90, image: "/images/salad.jpg" }
  ];

  return (
    <section className="py-16 bg-linear-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            How It’s <span className="text-red-600">Work</span>
          </h2>
          
          <h3 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-3">
            Real Delicious Food Straight To Your Door
          </h3>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`${step.bgColor} rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden group`}
            >
              {/* Step Number Background */}
              <div className="absolute -top-4 -right-4 text-6xl font-bold text-red-200 opacity-50 group-hover:opacity-100 transition">
                {step.step}
              </div>
              
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-md mb-4 group-hover:scale-110 transition-transform duration-300">
                {step.icon}
              </div>
              
              {/* Title */}
              <h3 className="text-xl font-bold text-gray-800 mb-2">{step.title}</h3>
              
              {/* Description */}
              <p className="text-gray-500 text-sm">{step.description}</p>
            </div>
          ))}
        </div>

        
      </div>
    </section>
  );
}