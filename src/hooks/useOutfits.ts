import { useState, useEffect } from 'react';

interface FetchOutfitsParams {
  category?: string;
  gender?: string;
  minPrice?: string;
  maxPrice?: string;
  colors?: string[];
  tags?: string[];
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export function useOutfits(initialFilters?: FetchOutfitsParams) {
  const [outfits, setOutfits] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchOutfits = async (params: FetchOutfitsParams = {}) => {
    setLoading(true);
    const searchParams = new URLSearchParams();
    
    if (params.category) searchParams.set('category', params.category);
    if (params.gender) searchParams.set('gender', params.gender);
    if (params.minPrice) searchParams.set('minPrice', params.minPrice);
    if (params.maxPrice) searchParams.set('maxPrice', params.maxPrice);
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.sort) searchParams.set('sort', params.sort);
    if (params.order) searchParams.set('order', params.order);
    
    if (params.colors) {
      params.colors.forEach(c => searchParams.append('colors', c));
    }
    if (params.tags) {
      params.tags.forEach(t => searchParams.append('tags', t));
    }

    const res = await fetch(`/api/outfits?${searchParams.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setOutfits(data.outfits);
      setPagination(data.pagination);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOutfits(initialFilters);
  }, []);

  return { outfits, pagination, loading, fetchOutfits };
}
