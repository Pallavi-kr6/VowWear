'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUser } from '@/hooks/useUser';

type Recommendation = {
  id?: string;
  title: string;
  url: string;
  source: string;
  price?: string | null;
  image?: string | null;
  score: number;
  reason: string;
};

type StyleSearch = {
  id: string;
  description: string;
  created_at: string;
  search_queries?: string[];
  recommendations: Recommendation[];
};

const starterPrompt = 'I want a green traditional lehenga for mehndi under 10000';

export default function DashboardPage() {
  const { user, profile, loading: userLoading } = useUser();
  const router = useRouter();

  const [description, setDescription] = useState('');
  const [searches, setSearches] = useState<StyleSearch[]>([]);
  const [selectedSearchId, setSelectedSearchId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      setLoadingHistory(true);
      const response = await fetch('/api/recommendations/search', { cache: 'no-store' });

      if (response.ok) {
        const data = await response.json();
        const loadedSearches = data.searches || [];
        setSearches(loadedSearches);
        setSelectedSearchId(loadedSearches[0]?.id || null);
      } else if (response.status !== 401) {
        setError('Could not load your previous searches.');
      }

      setLoadingHistory(false);
    };

    fetchHistory();
  }, [user]);

  const selectedSearch = useMemo(
    () => searches.find((search) => search.id === selectedSearchId) || searches[0],
    [searches, selectedSearchId]
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const trimmed = description.trim();
    if (trimmed.length < 12) {
      setError('Describe the outfit, occasion, budget, color, and style.');
      return;
    }

    setGenerating(true);
    const response = await fetch('/api/recommendations/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: trimmed }),
    });

    const data = await response.json();
    setGenerating(false);

    if (!response.ok) {
      setError(data.error || 'Could not generate recommendations.');
      return;
    }

    const newSearch = {
      ...data.search,
      recommendations: data.recommendations || [],
    };

    setSearches((current) => [newSearch, ...current]);
    setSelectedSearchId(newSearch.id);
    setDescription('');
  };

  if (userLoading || loadingHistory) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F5F5E9] text-[#243746]">Loading...</div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F5F5E9] px-4 py-6 text-[#243746] md:px-8">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hi, {profile?.first_name || 'there'}</h1>
          <p className="mt-1 text-sm text-gray-600">Describe the wedding outfit you want and get live product matches.</p>
        </div>
        <button
          onClick={() => router.push('/wishlist')}
          className="w-fit rounded-full border-2 border-[#243746] px-4 py-2 text-sm font-semibold transition-colors hover:bg-[#243746] hover:text-[#B7F34D]"
        >
          My Wishlist
        </button>
      </header>

      <main className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <section className="space-y-4">
          <form onSubmit={handleSubmit} className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/5">
            <label htmlFor="style-request" className="block text-sm font-semibold">
              Search something else
            </label>
            <textarea
              id="style-request"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={starterPrompt}
              rows={6}
              className="mt-3 w-full resize-none rounded-md border border-gray-300 px-3 py-3 text-sm outline-none transition focus:border-[#243746] focus:ring-2 focus:ring-[#B7F34D]"
            />
            {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={generating}
              className="mt-4 w-full rounded-full bg-[#B7F34D] px-5 py-3 text-sm font-bold text-[#243746] transition-colors hover:bg-[#a3e03c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generating ? 'Finding matches...' : 'Get AI Recommendations'}
            </button>
          </form>

          <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/5">
            <h2 className="text-sm font-semibold">Previous searches</h2>
            {searches.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500">No previous searches yet. Start with the box above.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {searches.map((search) => (
                  <button
                    key={search.id}
                    onClick={() => setSelectedSearchId(search.id)}
                    className={`w-full rounded-md border px-3 py-3 text-left text-sm transition ${
                      selectedSearch?.id === search.id
                        ? 'border-[#243746] bg-[#FAFDEE]'
                        : 'border-gray-200 hover:border-[#243746]'
                    }`}
                  >
                    <span className="line-clamp-2 font-medium">{search.description}</span>
                    <span className="mt-1 block text-xs text-gray-500">
                      {new Date(search.created_at).toLocaleDateString()}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <section>
          {!selectedSearch ? (
            <div className="flex min-h-[420px] items-center justify-center rounded-lg bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
              <div>
                <h2 className="text-2xl font-semibold">Tell us what you need</h2>
                <p className="mt-2 text-gray-500">Mention the outfit, occasion, budget, color, and style.</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Showing recommendations for</p>
                <h2 className="mt-1 text-2xl font-bold">{selectedSearch.description}</h2>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
              >
                {selectedSearch.recommendations.map((rec, index) => (
                  <motion.article
                    key={rec.id || rec.url}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5"
                  >
                    <div className="relative h-72 bg-gray-100">
                      {rec.image ? (
                        <img
                          src={rec.image}
                          alt={rec.title}
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center px-6 text-center text-sm text-gray-500">
                          Image not available
                        </div>
                      )}
                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold shadow-sm">
                        {Math.round(rec.score * 100)}% Match
                      </span>
                    </div>

                    <div className="flex min-h-[250px] flex-col p-5">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{rec.source}</span>
                        {rec.price && <span className="shrink-0 text-sm font-bold">{rec.price}</span>}
                      </div>
                      <h3 className="line-clamp-2 text-lg font-semibold leading-snug">{rec.title}</h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">{rec.reason}</p>
                      <a
                        href={rec.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-auto block rounded-md bg-[#243746] px-4 py-3 text-center text-sm font-semibold text-[#B7F34D] transition-colors hover:bg-[#1a2833]"
                      >
                        View Product
                      </a>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
