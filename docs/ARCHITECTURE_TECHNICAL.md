# TECHNICAL ARCHITECTURE (GLOBAL 3-BILLION SCALE)

## 1. System Topology (Multi-Region)
To serve 2.2 to 3 Billion users globally, the architecture must survive extreme spikes (e.g., during Ramadan) and provide sub-second latency worldwide.
> **Note for JuaraVibeCoding Hackathon:** During the MVP phase, this entire 3-billion scale blueprint is scaled down to run on **100% Zero-Cost Free Tiers** (Supabase Free, Vercel Hobby, Cloudflare Free, Groq Free, Firebase Spark) to demonstrate maximum capital efficiency without sacrificing enterprise design patterns.
- **Global Edge Routing:** Next.js deployed strictly behind Cloudflare. Requests hit the nearest data center via Cloudflare's Global Anycast network for ultimate DDoS protection and CDN caching.
- **Backend API:** FastAPI (Python) orchestrated via Google Cloud Run (Multi-region deployment: `us-central1`, `europe-west4`, `asia-southeast1`).
- **AI/ML Layer:** **Groq API (Whisper-large-v3)** for ultra-fast Speech-to-Text (STT) transcription of Setoran audio. Called server-side from the FastAPI backend using the official `groq` Python SDK. Groq's LPU inference provides sub-second transcription latency vs. traditional GPU-based APIs.
- **Content Delivery (CDN):** Global CDN caching for all static assets and Ustadz audio feedback.

## 2. Next.js Frontend (Global Localization)
- **i18n (Internationalization):** Day-1 support for Arabic (RTL), English, Indonesian, Urdu, and French. Dynamic Right-To-Left (RTL) layout rendering via Tailwind CSS `rtl:` modifiers.
- **Timezone Awareness:** All client-side times (Adhan, Kajian, Sparing) strictly localized using UTC in the backend and `Intl.DateTimeFormat` on the frontend.

## 3. FastAPI Backend & Auth
- **Architecture:** Domain-Driven Design (DDD) with asynchronous I/O.
- **Authentication:** OAuth2 with Apple, Google, and strict JWT for RBAC.

## 4. Google Cloud Infrastructure (The 3-Billion Pivot)
- **Compute:** Cloud Run (Auto-scaling from 0 to 10,000+ container instances globally in seconds).
- **Database (The Heavy Lifter):** 
  - *Supabase (PostgreSQL):* Serves as the master database ensuring strict ACID compliance, relational data integrity (Strict 3NF), and PostGIS mapping for Mosque spatial data.
  - *Firebase (Firestore):* Used exclusively as an ephemeral, real-time queue engine for low-latency Matchmaking and Sparing Tilawah, auto-clearing via TTL.