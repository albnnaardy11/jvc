# THE ENGINEERING MANIFESTO
**Authored by: Systems Architecture Lead (Linus Torvalds Framework)**

> *"Bad programmers worry about the code. Good programmers worry about data structures and their relationships."*

## 1. Architecture Philosophy
1. **Modularity over Monolith:** The Frontend (Next.js) and Backend (FastAPI) must be completely decoupled. They communicate ONLY via strict, versioned REST/gRPC contracts.
2. **Deterministic State:** The UI should be a pure reflection of state. No direct DOM manipulation. Use React exactly as intended.
3. **Fail Fast, Fail Loud:** Do not swallow exceptions. FastAPI must return standardized `HTTPException` JSON responses. Next.js must catch them cleanly using global `ErrorBoundaries`.

## 2. The Repository Structure
We will use a standard modular structure to ensure it scales safely:
- `/frontend` -> Next.js PWA (Pages/App Router, Components, Hooks, Utils)
- `/backend` -> FastAPI (Routers, Services, Repositories, Core/Config)
- `/docs` -> PRD, Architecture, Manifestos

## 3. Mobile Web Audio Processing (The Hardest Problem)
*Recording audio on Mobile Web (especially iOS Safari) is notoriously flaky and requires absolute engineering discipline.*
**The Rule:** 
- Always request Microphone permissions via an explicit User Action (Button click), never on page load.
- Handle `NotAllowedError` and `NotFoundError` gracefully.
- Compress audio on the client using WebRTC/Opus before sending it to the FastAPI backend to save bandwidth and reduce latency.

## 4. Deployment & CI/CD Strictness
- The `main` branch is sacred. No untested code enters `main`.
- Deployments to Google Cloud Run must be containerized via Docker. Images must be exceptionally slim (Alpine/Debian Slim) to ensure sub-second cold starts.
