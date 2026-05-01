import { useState, useEffect } from 'react';

export function useRecommendations(userId?: string) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    const res = await fetch('/api/recommendations/get');
    if (res.ok) {
      const data = await res.json();
      setRecommendations(data.recommendations || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (userId) {
      fetchRecommendations();
    } else {
      setLoading(false);
      setRecommendations([]);
    }
  }, [userId]);

  const generateRecommendations = async () => {
    setIsGenerating(true);
    const res = await fetch('/api/recommend', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setRecommendations(data.recommendations || []);
    }
    setIsGenerating(false);
    return res.ok;
  };

  return { 
    recommendations, 
    loading, 
    isGenerating, 
    refresh: fetchRecommendations,
    generate: generateRecommendations
  };
}
