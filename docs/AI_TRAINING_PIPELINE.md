# AI TRAINING & DEPLOYMENT PIPELINE
*Roadmap to train the Tajwid & Makhraj Engine up to "Go Publish"*

## Phase 1: Data Acquisition & Annotation (Sanad-Verified)
*You cannot train an Islamic AI on random internet audio.*
1. **Dataset Collection:** Collect thousands of hours of Quranic recitations strictly from Qaris who hold a connected *Sanad* to the Prophet (Makkah/Madinah graduates).
2. **Global Accent Variations:** Include reciters from Indonesia, Pakistan, and Europe to train the AI to recognize correct Makhraj regardless of the native accent.
3. **Ustadz Annotation (Labeling):** Human scholars must manually tag audio waveforms. Example: Tagging timestamps where a "Qalqalah" was missed, or where "Mad" was read as 2 harakat instead of 4.

## Phase 2: Base Model & Fine-Tuning (Vertex AI Chirp)
1. **Base Model:** Use **Google Cloud Chirp** (Universal Speech Model), which already understands Arabic phonetics at a highly advanced level.
2. **Supervised Fine-Tuning:** Feed the annotated dataset (Phase 1) into Chirp via Vertex AI. The goal is to shift the AI from standard Arabic "Speech-to-Text" to strict "Tajwid-Anomaly-Detection".
3. **Duration Analysis Layer:** Build a custom Python script alongside the AI to analyze audio wave lengths (in milliseconds) to calculate *Harakat* (vowel elongation) mathematically.

## Phase 3: RLHF (Reinforcement Learning from Human Feedback)
*This is where the "Hybrid Setoran" becomes our biggest asset.*
1. Deploy the Beta version to users and Ustadz.
2. When the AI flags an error, but the human Ustadz overrides it and marks it "Correct" (False Positive), this data is sent back to the ML Pipeline.
3. The AI is retrained weekly using this Ustadz-verified feedback, making it exponentially smarter over time.

## Phase 4: Optimization & "Go Publish"
1. **Latency Optimization:** The model is deployed to Google Cloud Run with GPU support (Nvidia T4/L4) to ensure the audio is processed and returned to the mobile app in < 300ms.
2. **On-Device VAD (Voice Activity Detection):** Before sending audio to the cloud, the mobile app (Next.js PWA) uses Web Audio API to trim silence, saving 40% bandwidth.
3. **Publishing:** Launch on Web, configure the PWA manifest for App Store / Play Store packaging (using Trusted Web Activities / Bubblewrap).
