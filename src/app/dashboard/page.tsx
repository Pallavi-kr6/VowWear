'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { user, profile, loading: userLoading } = useUser();
  const router = useRouter();
  
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
    
    // Check if onboarding is completed, otherwise redirect
    // We check via a quick fetch to user preferences
    const checkPreferences = async () => {
      if (user) {
        const res = await fetch('/api/user/preferences');
        if (res.ok) {
          const data = await res.json();
          if (!data.preferences || !data.preferences.is_completed) {
            router.push('/onboarding');
          } else {
            fetchRecommendations();
          }
        }
      }
    };
    
    if (user) checkPreferences();
  }, [user, userLoading, router]);

  const fetchRecommendations = async () => {
    setLoadingRecs(true);
    const res = await fetch('/api/recommend', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setRecommendations(data.recommendations);
    }
    setLoadingRecs(false);
  };

  const handleSave = (id: string) => {
    // Basic local state save simulation for MVP
    alert('Outfit added to wishlist!');
  };

  if (userLoading) return <div className="min-h-screen flex items-center justify-center bg-[#F5F5E9]">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F5F5E9] p-4 md:p-8 text-[#243746]">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Hi, {profile?.first_name || 'there'}!
          </h1>
          <p className="text-gray-600 mt-1">Here are your personalized outfit matches.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => router.push('/wishlist')}
            className="px-4 py-2 border-2 border-[#243746] rounded-full text-sm font-semibold hover:bg-[#243746] hover:text-[#B7F34D] transition-colors"
          >
            My Wishlist
          </button>
          <button 
            onClick={() => router.push('/onboarding')}
            className="px-4 py-2 bg-[#B7F34D] rounded-full text-sm font-semibold hover:bg-[#a3e03c] transition-colors"
          >
            Edit Profile
          </button>
        </div>
      </header>

      <main>
        {loadingRecs ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-200 h-96 rounded-2xl"></div>
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-2">No matches found</h2>
            <p className="text-gray-500">Try adjusting your preferences to see more results.</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {recommendations.map((rec, index) => (
              <motion.div 
                key={rec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-gray-100 flex flex-col group relative"
              >
                {/* AI Score Badge */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[#243746] text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10">
                  ✨ {(rec.score * 100).toFixed(0)}% Match
                </div>

                {/* Save Button Overlay */}
                <button 
                  onClick={() => handleSave(rec.id)}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm w-8 h-8 rounded-full flex items-center justify-center shadow-sm z-10 hover:text-red-500 transition-colors"
                >
                  🤍
                </button>

                {/* Image */}
                <div className="h-72 bg-gray-100 overflow-hidden relative">
                  <img 
                    src={rec.image_url} 
                    alt={rec.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap">
                    {rec.tags.map((tag: string) => (
                      <span key={tag} className="bg-black/50 text-white text-[10px] px-2 py-1 rounded-sm uppercase tracking-wider backdrop-blur-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">{rec.brand}</span>
                  <h3 className="font-semibold text-lg text-[#243746] leading-tight mb-2 line-clamp-2">{rec.title}</h3>
                  <div className="font-bold text-xl mb-4">₹{rec.price.toLocaleString()}</div>
                  
                  {/* Reason Text */}
                  <div className="bg-[#FAFDEE] p-3 rounded-lg text-sm text-[#243746] italic flex-1 mb-4 border border-[#B7F34D]/30">
                    "{rec.reason}"
                  </div>

                  {/* External Link */}
                  <a 
                    href={rec.product_url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full text-center py-3 bg-[#243746] text-[#B7F34D] font-medium rounded-xl hover:bg-[#1a2833] transition-colors"
                  >
                    View Product
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
