# QA & VERIFICATION PROTOCOL

## 1. Static Analysis
- Mypy (Strict mode) for Python.
- ESLint + Prettier for Frontend.
- SonarQube for vulnerability scanning.

## 2. AI Logic Testing (The Golden Set)
- Provide 100 "Reference Audio" files (Clear, Murattal, Noisy, Child Voice, Fast Recitation).
- System must pass >98% accuracy on text-matching before any deployment.

## 3. Performance Budget
- Time to First Byte (TTFB): < 50ms.
- AI Feedback Latency: < 300ms.