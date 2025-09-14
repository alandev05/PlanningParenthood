<p align="center">
  <img src="https://github.com/user-attachments/assets/4130e4ac-57fc-4c3b-8d0e-d7653eca55ab" alt="PlanningParenthood">
</p>

<p align="center">
  <strong>AI-powered parenting planner for activities, inspiration, and local resources 👨‍👩‍👧‍👦</strong>
</p>

<p align="center">
  <em>Built with Windsurf – AI-powered development for faster, higher-quality shipping ⚡</em>
</p>

## Overview 🌱

PlanningParenthood helps families discover high-quality, age-appropriate activities and inspiring role models, tailored to their budget, location, schedule, and parenting style. The app blends real-time local search with AI curation to turn preferences into concrete, bookable options — plus research-backed guidance.

---

## Key Features ✨

- **Personalized Intake → Plan:** Quick multi-step intake produces a child-specific activity roadmap. 🧭
- **Local, Real Providers:** Pulls real businesses via Google Places with addresses, phones, websites, and reviews. 📍
- **AI Ranking & Explanations:** Re-ranks local options to match priorities, with concise reasons. 🤖
- **Extraordinary People:** Search or deep-research inspiring figures with sources, images, lessons, and techniques. 🌟
- **Safe-Area UI & Mobile-first:** Polished RN UI with tab navigation, detail pages, and map integration. 📱

---

## How It Works 🔄

1. **Complete Intake:** Provide budget, transport, priorities, and child age; optionally add zip for location bias. 📝
2. **Fetch Real Providers:** Backend queries Google Places (and geocoding) to build concrete local options. 🗺️
3. **AI Curation:** Anthropic re-ranks items to your needs and adds short explanations. 🧠
4. **Guarantees & Fallbacks:** Ensures at least 6 recs; gracefully falls back with clear error modes if web data is insufficient. ✅
5. **Explore & Act:** View details, map context, and contact info; dive into role models with citations. 🔍

---

## Tech Stack 🛠️

- **Frontend:** React Native + Expo, TypeScript, React Navigation, `react-native-safe-area-context`. 📱
- **Maps & Places:** `react-native-maps`, Google Places/Geocoding APIs for real businesses. 🗺️
- **Backend:** Flask REST API, Python, `requests`, structured endpoints (`/api/recommend`, `/api/deep-research`, etc.). 🌐
- **AI Services:** Anthropic (profiles, deep research, ranking), robust JSON prompting and parsing. 🤖
- **Data & Storage:** AsyncStorage (client cache), Firebase (optional programs/user data). 💾
- **Dev Tooling:** TypeScript config, safe-area & platform-aware UI, retrying API client with timeouts. 🔧

---

## Why It’s Useful 💡

- **Actionable, not generic:** Real providers with contact details, filtered for kid/parent relevance (reviews, proximity, budget).
- **Trustworthy insights:** Deep-researched role models with sources and images; practical parenting lessons and techniques.
- **Time-saving:** One place to set goals, discover options, and get concise reasoning to decide faster.

---

## Getting Started 🚀

### Backend

1. `cd backend`
2. Create `.env` with: `GOOGLE_MAPS_API_KEY=...`, `ANTHROPIC_API_KEY=...` (optional `YELP_API_KEY`)
3. `pip install -r requirements.txt`
4. `python server.py`

### Frontend

1. `cd frontend`
2. `npm install`
3. `npx expo start`
   - Press `i` (iOS), `a` (Android), or `w` (web).

---

## Notes & Tips 📝

- If maps don’t render on iOS, ensure you’ve installed the Expo dev client with native modules (`react-native-maps`).
- To force real-business-only recommendations, call `/api/recommend?require_web=1&...` (backend returns 502 if < 6 web items).
- Clear caches: remove `latest_recommendations`, `last_recommend_query`, and call Extraordinary People `CacheService.clearCache()`.

---

## Powered by Windsurf ⚡

This project was developed end-to-end in Windsurf, leveraging:

- **AI Pair Programming:** Rapid feature iteration (intake flow, tabs, safe areas, maps, deep research) with inline edits and tests.
- **Structured Refactors:** Type-safe changes across RN/Expo + Flask without breaking builds.
- **Context-aware Automation:** Multi-file reasoning to wire Anthropic, Google Places, and robust error handling.

Windsurf’s agentic workflows accelerated delivery while keeping code readable, typed, and production-lean.

---

Built with ❤️ for parents and kids.
