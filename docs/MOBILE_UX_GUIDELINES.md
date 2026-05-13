# PWA & MOBILE-FIRST UX GUIDELINES
**Target:** To achieve a 100% "Native App Illusion" inside a Mobile Browser.

## 1. The "Native App" Illusion
Our web app must feel indistinguishable from a native iOS/Android app downloaded from the App Store.
- **App Shell Architecture:** The UI frame (Header, Bottom Navigation bar) must load instantly via SSR/SSG. Only the dynamic content area should show a skeleton loader.
- **Overscroll Behavior:** Disable the default browser pull-to-refresh (`overscroll-behavior: none` in CSS) to prevent the screen from "bouncing" when users scroll to the top. Implement custom, controlled pull-to-refresh if necessary.
- **Safe Area Insets:** Respect `env(safe-area-inset-bottom)` and `env(safe-area-inset-top)` so our UI components do not clash with the iOS Notch or Android gesture bars.

## 2. Touch & Ergonomics (The Thumb Zone)
- **The Thumb Zone:** 80% of interactive elements (especially the primary "Hold to Record Setoran" or "Match Sparing" buttons) must be placed in the bottom half of the screen.
- **Touch Targets:** Minimum 44x44 CSS pixels for any clickable element.
- **Haptic Feedback:** Use the `navigator.vibrate()` API for micro-interactions (e.g., a subtle 50ms buzz when a Setoran starts recording or an error occurs).

## 3. Animations & Hardware Acceleration
- Use `Framer Motion` for layout animations and page transitions.
- **Rule of Thumb:** ONLY animate `transform` (translate/scale) and `opacity`. Animating `width`, `height`, `margin`, or `box-shadow` causes layout thrashing, lag, and drains mobile batteries. Use `will-change: transform` for heavy elements.

## 4. Offline & Intermittent Connectivity (Indonesian Network Context)
Indonesia has varying network qualities. The app must not break when entering a tunnel or an elevator.
- Implement a **Service Worker** to cache static assets, UI components, and fonts.
- If a user loses connection while recording a Setoran, the app must temporarily save the audio Blob to `IndexedDB` and auto-retry the upload transparently when the network is restored.
