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

RULES:
1. Extract the primary item/outfit type first. If unclear, ask: is the user looking for a top, bottom, dress, accessory, jewelry, purse, etc?
2. The user's main keywords should ALWAYS appear in your search queries.
3. Extract occasion, budget, colors, and style attributes.
4. Fix obvious spelling mistakes, for example "inder 10000" means "under 10000".
5. Generate search queries that explicitly include the main item. Do NOT replace the main item with something else.
6. If the request is vague or only mentions an item (e.g., just "purse"), create queries combining that item with common Indian wedding contexts.

Return JSON only:
{
  "parsed_request": {
    "outfit_type": "lehenga or specific item name",
    "occasion": "mehndi or null",
    "max_budget": 10000,
    "colors": ["green"],
    "style": ["traditional"],
    "gender": "female",
    "notes": ["any extra requirements"]
  },
  "queries": [
    "[item] for [occasion] [color] [style] under [budget] buy online India",
    "[item] [occasion] [color] [budget] Indian wedding wear online",
    "[item] buy online India [occasion] [style]"
  ],
  "reasoning": "Explanation of what we're searching for and why"
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
1. CRITICAL: Filter results to match the outfit_type/main item. If user searched for purse, do NOT recommend lehengas.
2. Prefer products that match outfit type, occasion, color, style, and budget.
3. Do not invent product URLs or images. Use only URLs/images from SEARCH RESULTS.
4. If price is missing, set price to null. If it is visible, keep the exact text.
5. Prioritize products with images (image field should be a valid URL or null).
6. Return the best 5 to 8 recommendations that actually match the user's request.
7. If no results match the outfit_type, return an empty recommendations array - do NOT return irrelevant products.

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
