# 2-WEEK SPRINT ROADMAP & PRIORITIZATION
**Goal:** Deliver a highly polished, fully functional MVP for the Competition.

## Phase 1: Foundation & Infrastructure (Days 1 - 3)
*Focus: Environment, Auth, and Database*
- [x] **Day 1:** Initialize Next.js (Tailwind + Framer Motion) & FastAPI repos. Setup GCP Cloud Run & Cloud SQL (Postgres).
- [x] **Day 2:** Implement JWT Role-Based Auth (User, Ustadz, DKM). Build base UI shells (Bottom Nav for Mobile, Sidebar for Admin).
- [x] **Day 3:** Setup Database schemas (Prisma or SQLAlchemy) for Users, Activities, and Setoran.
ro
## Phase 2: Core AI & The Hybrid Setoran (Days 4 - 7)
*Focus: The "Wow Factor" Feature*
- [ ] **Day 4:** Build the *User Audio Recorder* UI using Web Audio API (Opus). Implement direct-to-GCS upload.
- [ ] **Day 5:** Integrate **Google Vertex AI (Chirp)** in FastAPI. Build the async pipeline to extract text and detect Makhraj anomalies.
- [ ] **Day 6:** Build the **Ustadz Review Studio UI**. Visualize the AI metadata (waveform markers, color-coded text).
- [ ] **Day 7:** Implement the Feedback loop (Ustadz giving approval/voice notes back to User).

## Phase 3: Social Mechanics & Map (Days 8 - 11)
*Focus: The "Strava" effect and Real-time Map*
- [x] **Day 8:** Build the **Worship Tracker** data structure and the *Deen-Feed* UI.
- [x] **Day 9:** Develop the **"Export to IG/WA" Image Generator** (Dynamic Canvas/SVG to Image generation).
- [ ] **Day 10:** Integrate Google Maps API / Mapbox. Build the **Mosque Explorer** and Live Activities radar.
- [ ] **Day 11:** Implement Check-in logic and Badge rendering.

## Phase 4: Sparing & Final Polish (Days 12 - 14)
*Focus: Gamification and Enterprise-level Aesthetics*
- [ ] **Day 12:** Build **Sparing Tilawah** Matchmaking using WebSockets (Simple random pairing).
- [ ] **Day 13:** **UI/UX Polish:** Apply Glassmorphism, transition animations, dark mode refinements. Ensure zero layout shifts.
- [ ] **Day 14:** Bug Bash, Latency Optimization, and Final Pitch Video Recording.
