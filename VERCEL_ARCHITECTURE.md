# 🚀 MASTER PROMPT — Optimize AI Adaptive Learning Platform for Vercel (Free Tier)

This repository contains the foundational implementation of the AI-powered GATE adaptive learning platform, optimized for the Vercel Free Tier.

## 🧠 SYSTEM ARCHITECTURE (VERCEL-OPTIMIZED)

### 1. 🌐 Frontend (Vercel Hosting)
* **Framework**: Next.js App Router (14+)
* **Styling**: Tailwind CSS combined with Framer Motion for lightweight, performant UI and smooth transitions.
* **State Management**: Zustand, enabling rapid state updates without unnecessary re-renders.
* **Optimization**: Components like the dashboard leverage SSR, and quiz elements are dynamically lazy-loaded.

### 2. ⚙️ Backend (Serverless Functions)
Built natively in `src/app/api/...` utilizing Vercel's Edge Functions:
* `export const runtime = 'edge'` applied to reduce cold boots and execute nearest to the user.
* Lightweight JSON passing instead of deep data joins.
* **Endpoints available**:
   - `/api/quiz/generate` - RAG powered quiz logic router
   - `/api/adaptive-engine` - Core engine for behavioral tracking and subsequent quiz difficulty calibration

### 3. 🗄️ DATABASE & STATE
* **Storage Engine**: Supabase (Free Tier)
* **Logic flow**: Edge compute evaluates metrics (`accuracy`, `timeTaken`, `retries`) matching it against `TopicStats` inside our Zustand user store.

### 4. 🧩 Adaptive Engine Logic implementation
* Located inside the Edge API: evaluates metrics in real-time. 
* Easy < 50%, Medium 50-75%, Hard > 75% accuracy thresholds.

### 5. ⚡ Performance Enhancements
* Tailwind CSS JIT compilation ensures the styling tree is incredibly trivial.
* `nextConfig` supports forced API caching on edge networks.
* Strict limits on JSON response payload sizes.

## 🧾 DEPLOYMENT STEPS (VERCEL FREE)
1. Push code to your GitHub repo.
2. Select **Add New Project** in Vercel.
3. Keep default settings (Next.js is auto-detected).
4. Add the following to Environment Variables:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
5. Click **Deploy**. Vercel will automatically parse the edge runtime flags and distribute your API boundaries efficiently.
