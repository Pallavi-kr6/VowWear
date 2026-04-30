'use client';

import { useState } from 'react';
import {
  SplashCursor,
  Skiper19,
  Skiper30,
  FeaturesSection,
  HowItWorks,
  FinalCTA,
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
        enabled={true}
        rainbowMode={false}
        color="#f5c6d6"
        splatForce={1.5}
        curl={0.3}
      />

{/* Hero Section with SVG Animation */}
      <Skiper19 />

{/* Gallery Section with Parallax */}
      <Skiper30 />

      {/* Features Section */}
      <FeaturesSection />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Final CTA Section */}
      <FinalCTA />

      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg shadow-lg animate-bounce z-50">
          <p className="font-semibold">Coming Soon!</p>
          <p className="text-sm text-white/90">Feature will be available very soon.</p>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                ShaadiStyle AI
              </h3>
              <p className="text-gray-400 text-sm">
                Your perfect wedding outfit, just one click away.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 002.856-3.51 10 10 0 01-2.856 1.13 5 5 0 00-8.606-4.49 5 5 0 00-8.606 4.49 5 5 0 002.126-1.275 10 10 0 01-2.856-3.51 10 10 0 013.51 2.856 10 10 0 01-2.856 3.51 5 5 0 008.606 4.49v-1.12a10 10 0 002.856-3.51" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.731-2.004 1.436-.103.25-.129.599-.129.948v5.421h-3.554s.047-8.789 0-9.714h3.554v1.375c.427-.659 1.191-1.595 2.897-1.595 2.117 0 3.704 1.385 3.704 4.362v5.572zM5.337 9.432c-1.144 0-1.915-.755-1.915-1.699 0-.955.77-1.7 1.916-1.7 1.144 0 1.914.745 1.914 1.7 0 .944-.769 1.699-1.914 1.699zm1.575 11.02H3.762V9.718h3.15v10.734zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 ShaadiStyle AI. All rights reserved.
            </p>
            <div className="flex gap-6 text-gray-400 text-sm">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
