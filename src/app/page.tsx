'use client';

import { useState } from 'react';
import {
  SplashCursor,
  Skiper19,
  Skiper30,
  FeaturesSection,
  HowItWorks,
  FloatingNavbar
  
} from '@/components';
 
export default function Home() {
  const [showNotification, setShowNotification] = useState(false);

  const handleExplore = () => {
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleGetRecommendations = () => {
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Splash Cursor - Elegant pastel effect */}
      <SplashCursor
        RAINBOW_MODE={false}
        COLOR="#f5c6d6"
        SPLAT_FORCE={1500}
        CURL={0.3}
      />

{/* Hero Section with SVG Animation */}
<FloatingNavbar />
      <Skiper19 />

{/* Gallery Section with Parallax */}
      <Skiper30 />

      {/* Features Section */}
      <FeaturesSection />

      {/* How It Works Section */}
      <HowItWorks />

    
 

      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg shadow-lg animate-bounce z-50">
          <p className="font-semibold">Coming Soon!</p>
          <p className="text-sm text-white/90">Feature will be available very soon.</p>
        </div>
      )}

      {/* Footer */}
      <footer className="relative bg-[#F5F5E9] text-[#243746] py-20 px-6 overflow-hidden">

  {/* subtle glow (hero style) */}
  <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-[#B7F34D] opacity-10 blur-3xl rounded-full"></div>

  <div className="max-w-6xl mx-auto relative z-10">

    {/* Top Grid */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">

      {/* Brand */}
      <div>
        <h3 className="text-2xl font-semibold mb-3 tracking-tight">
          ShaadiStyle <span className="text-[#B7F34D]">AI</span>
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          Your perfect wedding outfit, powered by AI and tailored to your style.
        </p>
      </div>

      {/* Product */}
      <div>
        <h4 className="font-medium mb-4">Product</h4>
        <ul className="space-y-3 text-sm text-gray-600">
          <li><a href="#" className="hover:text-[#243746] transition">How It Works</a></li>
          <li><a href="#" className="hover:text-[#243746] transition">Features</a></li>
          <li><a href="#" className="hover:text-[#243746] transition">Pricing</a></li>
        </ul>
      </div>

      {/* Company */}
      <div>
        <h4 className="font-medium mb-4">Company</h4>
        <ul className="space-y-3 text-sm text-gray-600">
          <li><a href="#" className="hover:text-[#243746] transition">About</a></li>
          <li><a href="#" className="hover:text-[#243746] transition">Blog</a></li>
          <li><a href="#" className="hover:text-[#243746] transition">Contact</a></li>
        </ul>
      </div>

      {/* Social */}
      <div>
        <h4 className="font-medium mb-4">Follow Us</h4>
        <div className="flex gap-4">

          {/* Social Button */}
          {['facebook', 'twitter', 'linkedin'].map((item, i) => (
            <a
              key={i}
              href="#"
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#243746]/10 text-[#243746] hover:bg-[#243746] hover:text-[#B7F34D] transition-all duration-300"
            >
              <span className="text-sm">{item[0].toUpperCase()}</span>
            </a>
          ))}

        </div>
      </div>
    </div>

    {/* Divider */}
    <div className="border-t border-[#243746]/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">

      <p className="text-gray-500 text-sm">
        © 2024 ShaadiStyle AI. All rights reserved.
      </p>

      <div className="flex gap-6 text-sm text-gray-500">
        <a href="#" className="hover:text-[#243746] transition">Privacy</a>
        <a href="#" className="hover:text-[#243746] transition">Terms</a>
        <a href="#" className="hover:text-[#243746] transition">Cookies</a>
      </div>
    </div>

  </div>
</footer>
    </div>
  );
}
