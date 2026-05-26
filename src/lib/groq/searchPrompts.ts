export type SearchPlan = {
  queries: string[];
  parsed_request: {
    outfit_type?: string;
    occasion?: string;
    max_budget?: number;
    colors?: string[];
    style?: string[];
    gender?: string;
    notes?: string[];
  };
  reasoning?: string;
};

export function buildShoppingSearchPrompt(description: string) {
  return `Convert this free-form outfit request into shopping search queries for Indian e-commerce.

USER REQUEST:
${description}

Extract the outfit type, occasion, budget, colors, and style. Fix obvious spelling mistakes, for example "inder 10000" means "under 10000".

Return JSON only:
{
  "parsed_request": {
    "outfit_type": "lehenga",
    "occasion": "mehndi",
    "max_budget": 10000,
    "colors": ["green"],
    "style": ["traditional"],
    "gender": "female",
    "notes": ["any extra requirements"]
  },
  "queries": [
    "green traditional lehenga for mehndi under 10000 buy online India",
    "mehndi green lehenga under 10000 Indian wedding wear",
    "traditional green lehenga choli under Rs 10000"
  ],
  "reasoning": "Short explanation of the search strategy"
}`;
}

export function buildSearchRankingPrompt(description: string, parsedRequest: unknown, searchResults: unknown[]) {
  return `Rank these shopping results for the user's outfit request.

USER REQUEST:
${description}

PARSED REQUEST:
${JSON.stringify(parsedRequest, null, 2)}

SEARCH RESULTS:
${JSON.stringify(searchResults, null, 2)}

Rules:
1. Prefer products that match outfit type, occasion, color, style, and budget.
2. Do not invent product URLs or images. Use only URLs/images from SEARCH RESULTS.
3. If price is missing, set price to null. If it is visible, keep the exact text.
4. Return the best 5 to 8 recommendations.

Return JSON only:
{
  "recommendations": [
    {
      "title": "Product title",
      "url": "https://product-url",
      "source": "Store or domain",
      "price": "Rs. 9,999",
      "image": "https://image-url-or-null",
      "score": 0.92,
      "reason": "Short personal reason"
    }
  ]
}`;
}
