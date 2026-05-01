'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { usePreferences } from '@/hooks/usePreferences';
import { motion } from 'framer-motion';

export default function OnboardingPage() {
  const { user, loading: userLoading } = useUser();
  const { updatePreferences } = usePreferences(user?.id);
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    preferred_gender: '',
    wedding_functions: [] as string[],
    preferred_colors: [] as string[],
    outfit_styles: [] as string[],
    budget_min: 0,
    budget_max: 50000,
    size: '',
    location: '',
    body_type: '',
    is_completed: true
  });

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const handleMultiSelect = (field: keyof typeof formData, value: string) => {
    const current = formData[field] as string[];
    if (current.includes(value)) {
      setFormData({ ...formData, [field]: current.filter(v => v !== value) });
    } else {
      setFormData({ ...formData, [field]: [...current, value] });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const result = await updatePreferences(formData);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    // AI recommendation trigger is inside updatePreferences hook
    router.push('/dashboard');
  };

  if (userLoading) return <div className="min-h-screen flex items-center justify-center bg-[#F5F5E9]">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F5F5E9] flex items-center justify-center p-4 text-[#243746]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white rounded-3xl shadow-lg p-8 md:p-12"
      >
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold">Personalize Your Style</h1>
            <span className="text-sm font-medium text-gray-400">Step {step} of 3</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-[#B7F34D] h-2 rounded-full transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>
          </div>
        </div>

        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
              <label className="block text-lg font-medium mb-3">Who are we styling?</label>
              <div className="grid grid-cols-2 gap-4">
                {['female', 'male', 'other', 'any'].map(gender => (
                  <button
                    key={gender}
                    onClick={() => setFormData({ ...formData, preferred_gender: gender })}
                    className={`py-3 rounded-xl border-2 transition-all ${formData.preferred_gender === gender ? 'border-[#B7F34D] bg-[#F5F5E9]' : 'border-gray-200 hover:border-[#B7F34D]'}`}
                  >
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium mb-3">Which functions are you attending?</label>
              <div className="flex flex-wrap gap-3">
                {['haldi', 'mehendi', 'sangeet', 'wedding', 'reception'].map(func => (
                  <button
                    key={func}
                    onClick={() => handleMultiSelect('wedding_functions', func)}
                    className={`px-5 py-2 rounded-full border transition-all ${formData.wedding_functions.includes(func) ? 'bg-[#243746] text-[#B7F34D] border-[#243746]' : 'border-gray-300 hover:border-[#243746]'}`}
                  >
                    {func.charAt(0).toUpperCase() + func.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <button onClick={handleNext} disabled={!formData.preferred_gender || formData.wedding_functions.length === 0} className="w-full py-4 mt-4 bg-[#B7F34D] text-[#243746] font-bold rounded-xl disabled:opacity-50 hover:bg-[#a3e03c] transition-colors">
              Next Step
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
             <div>
              <label className="block text-lg font-medium mb-3">Preferred Colors</label>
              <div className="flex flex-wrap gap-3">
                {['Pastels', 'Vibrant', 'Dark', 'Gold/Silver', 'Red/Maroon', 'Neutral'].map(color => (
                  <button
                    key={color}
                    onClick={() => handleMultiSelect('preferred_colors', color)}
                    className={`px-5 py-2 rounded-full border transition-all ${formData.preferred_colors.includes(color) ? 'bg-[#243746] text-[#B7F34D] border-[#243746]' : 'border-gray-300 hover:border-[#243746]'}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium mb-3">Outfit Style</label>
              <div className="grid grid-cols-3 gap-3">
                {['traditional', 'indo-western', 'modern'].map(style => (
                  <button
                    key={style}
                    onClick={() => handleMultiSelect('outfit_styles', style)}
                    className={`py-3 rounded-xl border transition-all ${formData.outfit_styles.includes(style) ? 'bg-[#243746] text-[#B7F34D] border-[#243746]' : 'border-gray-300 hover:border-[#243746]'}`}
                  >
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={handlePrev} className="w-1/3 py-4 border border-gray-300 font-bold rounded-xl hover:bg-gray-50 transition-colors">Back</button>
              <button onClick={handleNext} disabled={formData.preferred_colors.length === 0 || formData.outfit_styles.length === 0} className="w-2/3 py-4 bg-[#B7F34D] text-[#243746] font-bold rounded-xl disabled:opacity-50 hover:bg-[#a3e03c] transition-colors">Next Step</button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
              <label className="block text-lg font-medium mb-3">Max Budget (₹)</label>
              <input 
                type="range" 
                min="5000" 
                max="200000" 
                step="5000"
                value={formData.budget_max} 
                onChange={(e) => setFormData({...formData, budget_max: parseInt(e.target.value)})}
                className="w-full accent-[#B7F34D]"
              />
              <div className="text-right font-bold mt-2">₹{formData.budget_max.toLocaleString()}</div>
            </div>

            <div>
              <label className="block text-lg font-medium mb-3">Size</label>
              <div className="flex flex-wrap gap-3">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom'].map(size => (
                  <button
                    key={size}
                    onClick={() => setFormData({ ...formData, size })}
                    className={`px-5 py-2 rounded-full border transition-all ${formData.size === size ? 'bg-[#243746] text-[#B7F34D] border-[#243746]' : 'border-gray-300 hover:border-[#243746]'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={handlePrev} className="w-1/3 py-4 border border-gray-300 font-bold rounded-xl hover:bg-gray-50 transition-colors">Back</button>
              <button onClick={handleSubmit} disabled={loading || !formData.size} className="w-2/3 py-4 bg-[#B7F34D] text-[#243746] font-bold rounded-xl disabled:opacity-50 hover:bg-[#a3e03c] transition-colors">
                {loading ? 'Saving...' : 'Get Recommendations'}
              </button>
            </div>
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
