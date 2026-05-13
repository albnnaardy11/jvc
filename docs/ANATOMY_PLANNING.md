# SYSTEM ANATOMY & PLANNING

## 1. Global Architecture Mapping
The system operates on a Multi-Tenant architecture where the UI completely shifts based on the `account_role` (USER, USTADZ, DKM).

## 2. Anatomy: User PWA (Mobile-First)
**Navigation:** Bottom Tab Bar
- **Home (Deen-Feed):** The "Strava" feed. Shows friends' recent activities, streaks, and leaderboards.
- **AI Mentor (Qari):** The interface for *Koreksi Mandiri*. Features a pulsing microphone button and real-time text-highlighting (green for correct, red for wrong).
- **Sparing:** Matchmaking lobby. Shows current online users and a "Find Match" pulsing radar.
- **Map:** Full-screen interactive map showing nearby Mosques and live check-ins.
- **Profile:** Exportable worship statistics, badges, and Setoran history.

## 3. Anatomy: Ustadz Dashboard (Tablet/Desktop)
**Navigation:** Sidebar Navigation
- **Setoran Queue (Inbox):** A kanban-style board (Pending, Analyzing, Ready for Review, Completed).
- **Review Studio:** The core AI-assisted UI. Contains:
  - Audio Player with a Waveform visualizer.
  - AI Warning Markers injected into the waveform (e.g., Red dot at 01:23).
  - Transcribed Arabic text with color-coded Tajwid hints.
  - Input box for Ustadz Voice Note feedback.
- **Murid Roster:** List of active students under this Ustadz's guidance.
- **Earnings/Analytics:** Monetization metrics if setoran reviews are paid.

## 4. Anatomy: DKM Portal (Desktop)
- **Live Event Publisher:** Form to instantly push "Kajian" or "Need Volunteer" to the Social Map.
- **Talent Scout:** Search engine for verified Imams/Muazins with filters (Radius, Voice Maqam, Verification Level).

## 5. Information Flow (The Hybrid Setoran)
`User Audio Input (Opus)` -> `Next.js API Route` -> `GCS Bucket` -> `Pub/Sub Trigger` -> `FastAPI Worker (Vertex AI Chirp)` -> `PostgreSQL Update (Metadata)` -> `FCM Push Notification to Ustadz` -> `Ustadz Review Studio UI`.
