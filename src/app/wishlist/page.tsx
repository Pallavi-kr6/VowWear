'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { motion } from 'framer-motion';

export default function WishlistPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  
  const [savedItems, setSavedItems] = useState<any[]>([]);
  // Mock wishlist data for MVP visualization
  const mockWishlist = [
    {
      id: "m4",
      title: "Midnight Blue Sequined Saree",
      price: 12000,
      image_url: "https://images.unsplash.com/photo-1610030469983-98e5509c5331?w=500&q=80",
      brand: "Ajio",
      product_url: "#"
    }
  ];

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    } else if (user) {
      // In a real app, fetch from /api/saved
      setSavedItems(mockWishlist);
    }
  }, [user, userLoading, router]);

  if (userLoading) return <div className="min-h-screen flex items-center justify-center bg-[#F5F5E9]">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F5F5E9] p-4 md:p-8 text-[#243746]">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Wishlist</h1>
          <p className="text-gray-600 mt-1">Saved items you love.</p>
        </div>
        <button 
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 border-2 border-[#243746] rounded-full text-sm font-semibold hover:bg-[#243746] hover:text-[#B7F34D] transition-colors"
        >
          Back to Dashboard
        </button>
      </header>

      <main>
        {savedItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Explore your recommendations to find outfits you love.</p>
            <button 
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-[#B7F34D] text-[#243746] font-bold rounded-full hover:bg-[#a3e03c] transition-colors"
            >
              Discover Outfits
            </button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {savedItems.map((item, index) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col group relative"
              >
                {/* Remove Button Overlay */}
                <button 
                  onClick={() => setSavedItems(savedItems.filter(i => i.id !== item.id))}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm w-8 h-8 rounded-full flex items-center justify-center shadow-sm z-10 hover:text-red-500 transition-colors"
                  title="Remove from wishlist"
                >
                  ✕
                </button>

                {/* Image */}
                <div className="h-72 bg-gray-100 overflow-hidden relative">
                  <img 
                    src={item.image_url} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                
                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">{item.brand}</span>
                  <h3 className="font-semibold text-lg text-[#243746] leading-tight mb-2 line-clamp-2">{item.title}</h3>
                  <div className="font-bold text-xl mb-4">₹{item.price.toLocaleString()}</div>

                  {/* External Link */}
                  <a 
                    href={item.product_url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full text-center py-3 bg-[#243746] text-[#B7F34D] font-medium rounded-xl hover:bg-[#1a2833] transition-colors mt-auto"
                  >
                    Buy Now
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
