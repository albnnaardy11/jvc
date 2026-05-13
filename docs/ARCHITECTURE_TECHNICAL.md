# TECHNICAL ARCHITECTURE (GLOBAL 3-BILLION SCALE)

## 1. System Topology (Multi-Region)
To serve 2.2 to 3 Billion users globally, the architecture must survive extreme spikes (e.g., during Ramadan) and provide sub-second latency worldwide.
- **Global Edge Routing:** Next.js deployed on Vercel Edge Network or Cloudflare Workers. Requests hit the nearest data center (Anycast routing).
- **Backend API:** FastAPI (Python) orchestrated via Google Cloud Run (Multi-region deployment: `us-central1`, `europe-west4`, `asia-southeast1`).
- **AI/ML Layer:** Google Vertex AI for advanced LLM reasoning, Google Cloud Speech-to-Text (Chirp) optimized for global Arabic accents.
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
  - *Google Cloud Spanner:* We bypass standard PostgreSQL and use Spanner. It provides the relational strictness of SQL with the infinite, global horizontal scalability of NoSQL. Essential for syncing user data across continents without replication lag.
  - *Firestore:* For real-time, low-latency data (Matchmaking, Map Activities) localized to specific regions.