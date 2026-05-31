# VowWear

VowWear is an AI-powered wedding outfit recommendation platform that helps users discover the perfect attire for weddings and celebrations. By combining user preferences, event details, style choices, and AI-driven recommendations, VowWear delivers personalized fashion suggestions tailored to every occasion.

---

## About

Choosing the right wedding outfit can be overwhelming due to the large number of options available across fashion platforms. VowWear simplifies this process by analyzing user preferences and generating curated outfit recommendations that align with their style, budget, event type, and theme.

The platform focuses on delivering a premium user experience through intelligent recommendations, elegant design, and smooth interactions.

---

## Features

### Personalized Recommendations
- AI-powered outfit suggestions
- Recommendations tailored to user preferences
- Personalized styling experience

### Wedding-Focused Styling
Supports recommendations for:
- Weddings
- Engagement Ceremonies
- Receptions
- Mehendi
- Haldi
- Sangeet
- Cocktail Events

### User Profiles
- Secure authentication
- Profile management
- Saved preferences
- Measurement storage
- Recommendation history

### Interactive Experience
- Modern responsive UI
- Smooth scrolling with Lenis
- Framer Motion animations
- Interactive landing page sections

### Fashion Discovery
- Outfit cards with images and details
- Curated recommendations
- Multi-source outfit exploration
- Personalized filtering

---

## Tech Stack

| Category | Technology |
|-----------|------------|
| Framework | Next.js 16 |
| UI Library | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Animations | Framer Motion |
| Smooth Scrolling | Lenis |
| Database | Supabase |
| Authentication | Supabase Auth |
| Deployment | Vercel |

---

## Project Structure

```text
src/
# ShadiStyle - Folder Structure

```text
.
├─ public/
│  └─ sw.js
├─ src/
│  ├─ app/
│  │  ├─ api/
│  │  │  ├─ auth/
│  │  │  │  ├─ errors.ts
│  │  │  │  ├─ login/
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ signup/
│  │  │  │     └─ route.ts
│  │  │  ├─ health/
│  │  │  │  └─ route.ts
│  │  │  ├─ interactions/
│  │  │  │  └─ route.ts
│  │  │  ├─ outfits/
│  │  │  │  └─ route.ts
│  │  │  ├─ price-comparison/
│  │  │  │  └─ search/
│  │  │  │     └─ route.ts
│  │  │  ├─ prices/
│  │  │  │  └─ compare/
│  │  │  │     └─ route.ts
│  │  │  ├─ recommend/
│  │  │  ├─ recommendations/
│  │  │  │  ├─ generate/
│  │  │  │  ├─ get/
│  │  │  │  └─ search/
│  │  │  │     └─ route.ts
│  │  │  ├─ reviews/
│  │  │  │  └─ route.ts
│  │  │  ├─ saved/
│  │  │  │  └─ route.ts
│  │  │  └─ user/
│  │  │     ├─ preferences/
│  │  │     │  └─ route.ts
│  │  │     └─ profile/
│  │  │        └─ route.ts
│  │  ├─ auth/
│  │  │  └─ callback/
│  │  │     └─ route.ts
│  │  ├─ dashboard/
│  │  │  └─ page.tsx
│  │  ├─ diagnostics/
│  │  │  └─ page.tsx
│  │  ├─ login/
│  │  │  └─ page.tsx
│  │  ├─ onboarding/
│  │  │  └─ page.tsx
│  │  ├─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ globals.css
│  │  ├─ favicon.ico
│  │  ├─ price-compare/
│  │  ├─ test-search-recommendations/
│  │  └─ wishlist/
│  │     └─ page.tsx
│  ├─ components/
│  │  ├─ CornerDecoration.tsx
│  │  ├─ FeaturesSection.tsx
│  │  ├─ FloatingNavbar.tsx
│  │  ├─ FlowerDecoration.tsx
│  │  ├─ HowItWorks.tsx
│  │  ├─ PriceComparisonModal.tsx
│  │  ├─ Skiper19.tsx
│  │  ├─ Skiper30.tsx
│  │  ├─ SplashCursor.tsx
│  │  └─ index.ts
│  ├─ hooks/
│  │  ├─ useInteractions.ts
│  │  ├─ useOutfits.ts
│  │  ├─ usePreferences.ts
│  │  └─ useUser.ts
│  └─ lib/
│     ├─ mockData.ts
│     ├─ priceComparison.ts
│     ├─ userProfile.ts
│     ├─ groq/
│     │  ├─ client.ts
│     │  ├─ prompts.ts
│     │  └─ searchPrompts.ts
│     └─ supabase/
│        ├─ client.ts
│        └─ server.ts
├─ .gitignore
├─ eslint.config.mjs
├─ next.config.ts
├─ package.json
├─ package-lock.json
├─ postcss.config.mjs
├─ tsconfig.json
├─ supabase_complete_setup.sql
├─ IMPLEMENTATION_README.md
└─ README.md

```

---

## How It Works

### 1. Create an Account
Users sign up and access their personalized dashboard.

### 2. Complete the Style Profile
Users provide:
- Gender
- Event Type
- Wedding Theme
- Preferred Colors
- Budget
- Body Measurements
- Style Preferences

### 3. AI Analysis
The recommendation engine processes the user's inputs and identifies suitable outfit options.

### 4. Personalized Recommendations
Users receive curated outfit suggestions displayed in a clean card-based interface.

### 5. Discover and Choose
Users browse recommendations and select outfits that best match their requirements.

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/your-username/vowwear.git
```

### Navigate to the Project Directory

```bash
cd vowwear
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY="gsk_your_groq_api_key_here" 
SERPAPI_API_KEY=your_serpapi_key
GOOGLE_CUSTOM_SEARCH_KEY=your_google_search_key
GOOGLE_CUSTOM_SEARCH_ID=your_search_engine_id
```

### Start Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Available Scripts

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm run start
```

### Run Linter

```bash
npm run lint
```

---

## Design Philosophy

VowWear is designed around three core principles:

- Personalization
- Simplicity
- Elegance

The interface combines modern animations, clean layouts, and intelligent recommendations to create a seamless fashion discovery experience.

---

## Roadmap

- AI-powered style assistant
- Image-based recommendations
- Virtual try-on experience
- Wishlist functionality
- Outfit comparison tools
- Trend-based recommendations
- Multi-language support
- Mobile application

---

## Deployment

The application is optimized for deployment on Vercel.

```bash
npm run build
``` 

---
 
