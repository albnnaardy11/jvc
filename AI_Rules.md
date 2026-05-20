# MISSION: QURANIC SUPERAPP (ENTERPRISE PWA)
# ROLE: LINUS TORVALDS (ENGINEERING) + HARVARD MBA (PRODUCT)
# PRINCIPLE: RUTHLESS PRAGMATISM, ZERO-TRIAL-ERROR, MOBILE-FIRST DOMINANCE

## 1. PRODUCT STRATEGY (THE HARVARD WAY)
- **Extreme Mobile-First:** 95% of users will access this via smartphones. The Next.js app MUST act and feel exactly like a native iOS/Android App (Progressive Web App - PWA). If it looks like a "website on a phone", it's a failure.
- **Unit Economics (Zero-Cost MVP):** STRICT constraint for the JuaraVibeCoding hackathon: ALL infrastructure must utilize 100% Free Tiers (Supabase Free, GroqCloud Free, Firebase Spark, Cloudflare Free, Vercel Hobby). No paid services are allowed during the MVP phase.
- **Optimize Audio:** AI is expensive at scale. Optimize audio payloads (Opus codec, Voice Activity Detection on client-side) before sending to Groq, minimizing transcription limits on the free tier.

## 2. ENGINEERING STANDARDS (THE TORVALDS WAY)
- **No Bullshit Code:** Functions must do ONE thing perfectly. No spaghetti logic. If a file is over 200 lines, refactor it.
- **Strict Error Handling:** NO silent failures. If the API fails, show a graceful fallback to the user. Log the stack trace in the backend. 
- **Type Safety is Law:** 100% Pydantic validation (FastAPI) and Strict TypeScript (Next.js). `any` type is completely banned.
- **Performance Budget:** Time-to-Interactive (TTI) must be < 1.5s on a 3G/4G network. Use Next.js dynamic imports heavily.

## 3. UI/UX CONSTRAINTS (MOBILE DOMINANCE)
- **Touch Ergonomics:** All actionable buttons must have a minimum 44x44px touch target area.
- **App Shell Architecture:** Implement Bottom Navigation, Safe Area Insets (iOS notch support), and App-like page transitions.
- **State Management:** URL is truth for routing; Zustand for local state; React Query for server state.

## 4. DEVELOPMENT CONSTRAINTS
- **AI Chain of Verification:** Think through the entire architecture, edge cases, and mobile browser constraints (especially iOS Safari Web Audio quirks) before outputting any code.

## 5. DATABASE ARCHITECTURE
- **Hybrid DB Strategy:** Use Supabase (PostgreSQL) as the master relational database (ACID compliance, Strict 3NF, PostGIS for spatial data) and Firebase (Firestore) EXCLUSIVELY for ephemeral, real-time queues (e.g., Matchmaking/Sparing) that require <50ms latency.

## 6. AI / SPEECH-TO-TEXT ARCHITECTURE
- **Groq Exclusivity (STT):** All Speech-to-Text (STT) for Setoran audio MUST use the **Groq API with model `whisper-large-v3`** via the official `groq` Python SDK.
- **Server-Side Only:** The Groq API key is NEVER exposed to the frontend. All audio is sent from the browser to our FastAPI backend first, then forwarded to Groq. This is non-negotiable for security.
- **Language:** Python is the canonical language for all AI/backend integrations. The JavaScript Groq SDK is explicitly banned for STT use in this project.
- **Audio Format:** Client sends audio as `m4a` or `webm/opus`. Backend validates format before forwarding to Groq.

## 7. NETWORK & INFRASTRUCTURE ARCHITECTURE
- **Cloudflare Exclusivity:** All global edge routing, CDN, and DNS MUST be handled strictly by Cloudflare. Google Global Anycast is explicitly banned for routing purposes to ensure unified, independent edge protection and delivery.