import { useState, useEffect } from 'react';

export function useInteractions(userId?: string) {
  const [savedOutfits, setSavedOutfits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    setLoading(true);
    const res = await fetch('/api/saved');
    if (res.ok) {
      const data = await res.json();
      setSavedOutfits(data.savedOutfits || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (userId) {
      fetchSaved();
    } else {
      setLoading(false);
      setSavedOutfits([]);
    }
  }, [userId]);

  const saveOutfit = async (outfit_id: string) => {
    const res = await fetch('/api/saved', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ outfit_id }),
    });
    if (res.ok) {
      await fetchSaved();
    }
    return res.ok;
  };

  const removeOutfit = async (outfit_id: string) => {
    const res = await fetch(`/api/saved?outfit_id=${outfit_id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      await fetchSaved();
    }
    return res.ok;
  };

  const logInteraction = async (outfit_id: string, type: 'view' | 'click' | 'like' | 'dislike' | 'share') => {
    fetch('/api/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ outfit_id, interaction_type: type }),
    }).catch(console.error);

    // Recommendations are now generated from explicit style searches.
  };

  return { 
    savedOutfits, 
    loading, 
    saveOutfit, 
    removeOutfit, 
    logInteraction,
    isSaved: (outfit_id: string) => savedOutfits.some(s => s.outfit_id === outfit_id)
  };
}
