import React from 'react';
import { useState } from "react";
const PricingComponent = () => {
  return (
    <div className="relative w-full h-screen bg-pricing-gradient overflow-hidden">
      {/* Background Organic Shapes */}
      <div className="absolute inset-0">
        {/* Top left flowing shape */}
        <div className="absolute top-0 left-0 w-full h-full">
          <svg
            className="absolute top-0 left-0 w-full h-full"
            viewBox="0 0 1440 800"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0 C200,50 350,100 500,150 C650,200 800,250 900,300 C1000,350 1100,400 1200,450 C1300,500 1400,550 1440,600 L1440,0 Z"
              fill="rgba(255,127,80,0.4)"
            />
          </svg>
        </div>

        {/* Main flowing organic shape */}
        <div className="absolute top-0 left-0 w-full h-full">
          <svg
            className="absolute top-0 left-0 w-full h-full"
            viewBox="0 0 1440 800"
            preserveAspectRatio="none"
          >
            <path
              d="M0,200 C150,180 300,160 450,200 C600,240 750,280 900,320 C1050,360 1200,400 1350,440 C1400,460 1420,480 1440,500 L1440,800 L0,800 Z"
              fill="rgba(255,105,180,0.3)"
            />
          </svg>
        </div>

        {/* Bottom flowing shape */}
        <div className="absolute bottom-0 left-0 w-full h-full">
          <svg
            className="absolute bottom-0 left-0 w-full h-full"
            viewBox="0 0 1440 800"
            preserveAspectRatio="none"
          >
            <path
              d="M0,400 C200,380 400,360 600,340 C800,320 1000,300 1200,280 C1300,270 1370,260 1440,250 L1440,800 L0,800 Z"
              fill="rgba(199,21,133,0.35)"
            />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-5 h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start p-8 md:p-12 lg:p-16">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-pricing-text-dark">
            Pricing
          </h1>
        </div>

        {/* Pricing Card - Centered */}
        <div className="flex-1 flex justify-center items-center px-8">
          <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-10 md:p-14 shadow-2xl border border-white/30 max-w-lg w-full text-center">
            {/* Subscribe Now Title */}
            <div className="bg-blue-500 text-white px-8 py-3 rounded-2xl font-semibold text-lg mb-8 shadow-lg">
              Subscribe Now
            </div>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-8 leading-tight">
              Bastion Research Core
            </h2>

            {/* Price */}
            <div className="mb-10">
              <span className="text-5xl md:text-6xl font-bold text-blue-500">
                ₹ 18,750
              </span>
              <span className="text-2xl text-pricing-text-light ml-3">
                / Annually
              </span>
            </div>

            {/* Button */}
            <button
              className="bg-white hover:bg-red-500 text-black hover:text-white px-12 py-5 rounded-2xl font-semibold text-xl w-full mb-6 shadow-xl transition-colors duration-300"
            >
              Secure Your Access
            </button>

            {/* Note */}
            <p className="text-base text-pricing-text-light font-medium">
              *Above Price Is Inclusive Of GST
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingComponent;
