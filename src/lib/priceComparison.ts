// Price comparison utilities
export type PriceResult = {
  platform: string;
  price: number | null;
  originalPrice?: number | null;
  discount?: number | null;
  url: string;
  title: string;
  image?: string;
  availability: 'in_stock' | 'out_of_stock' | 'unknown';
};

export type ComparisonResult = {
  productName: string;
  query: string;
  results: PriceResult[];
  bestDeal: PriceResult | null;
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
  searchedAt: string;
};

export type PriceHistory = {
  id: string;
  productName: string;
  platform: string;
  price: number;
  date: string;
};

// Extract price from text (handles various formats like "₹5000", "$50", "5000 INR")
export const extractPrice = (text: string): number | null => {
  if (!text) return null;

  // Remove common currency symbols and words
  const cleaned = text
    .replace(/[₹$€£¥]/g, '')
    .replace(/INR|USD|EUR|GBP|JPY/gi, '')
    .replace(/,/g, '') // Remove commas
    .trim();

  const match = cleaned.match(/\d+(\.\d{2})?/);
  return match ? parseFloat(match[0]) : null;
};

export const PLATFORM_CONFIGS = {
  myntra: {
    name: 'Myntra',
    domain: 'myntra.com',
    icon: '🛍️',
    color: 'from-orange-500 to-yellow-400',
  },
  ajio: {
    name: 'AJIO',
    domain: 'ajio.com',
    icon: '🛒',
    color: 'from-purple-500 to-pink-400',
  },
  amazon: {
    name: 'Amazon',
    domain: 'amazon.in',
    icon: '📦',
    color: 'from-yellow-500 to-orange-400',
  },
  flipkart: {
    name: 'Flipkart',
    domain: 'flipkart.com',
    icon: '💫',
    color: 'from-blue-600 to-blue-400',
  },
};

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

export const calculateSavings = (original: number, current: number): number => {
  if (original <= 0) return 0;
  return Math.round(((original - current) / original) * 100);
};
