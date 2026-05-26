'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUser } from '@/hooks/useUser';

export default function OnboardingPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const trimmed = description.trim();
    if (trimmed.length < 12) {
      setError('Please include the outfit, occasion, budget, color, and style.');
      return;
    }

    setLoading(true);
    const response = await fetch('/api/recommendations/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: trimmed }),
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || 'Could not create recommendations.');
      return;
    }

    router.push('/dashboard');
  };

  if (userLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F5F5E9] text-[#243746]">Loading...</div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F5F5E9] px-4 py-8 text-[#243746]">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-lg bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-10"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">First search</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Describe your wedding outfit</h1>
          <p className="mt-3 text-gray-600">
            Include the outfit type, occasion, budget, color, and style. For example: I want a green traditional lehenga for mehndi under 10000.
          </p>

          <form onSubmit={handleSubmit} className="mt-8">
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={7}
              placeholder="I want a lehenga for mehndi under 10000. It should be green and traditional."
              className="w-full resize-none rounded-md border border-gray-300 px-4 py-4 text-sm outline-none transition focus:border-[#243746] focus:ring-2 focus:ring-[#B7F34D]"
            />

            {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-[#B7F34D] px-6 py-3 text-sm font-bold text-[#243746] transition-colors hover:bg-[#a3e03c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Finding matches...' : 'Show Recommendations'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="rounded-full border border-[#243746] px-6 py-3 text-sm font-semibold transition-colors hover:bg-[#243746] hover:text-[#B7F34D]"
              >
                Explore dashboard
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
