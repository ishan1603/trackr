Thank you FLIPR LABS for this surreal learning experience - Team Ice Kings.

# 🏥 HealthTrackr

Modern personal health command center built with **Next.js 15**, **TypeScript**, **shadcn/ui**, and **Framer Motion**. HealthTrackr lets anyone capture wellness metrics, surface trends, and stay on top of daily routines within a single, responsive dashboard.

## 🔗 Live Demo

- Production: [https://trackr-thi1.vercel.app/](https://trackr-thi1.vercel.app/)
- Tested on both desktop and mobile breakpoints; no install required.

## 🚀 Introduction

HealthTrackr is a full-stack experience that makes quantified self data approachable. One can step through onboarding, import wearable samples, log daily vitals, review anomaly alerts, and export findings in minutes. Everything runs in the browser with polished motion design and pragmatic performance defaults.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui and Radix primitives
- **Animations**: Framer Motion for component transitions
- **Charts**: Recharts for multi-series visualizations
- **Auth**: Clerk (optional, ready for email magic links)
- **Data Layer**: Firebase
- **Emailing**: Nodemailer + Gmail SMTP

## 🏆 Why It Stands Out

- **Guided onboarding** captures high-value profile details and preferred metrics in under a minute.
- **Wearable integrations sandbox** (Google Fit, Fitbit, Apple Health) delivers realistic dummy records, summaries, and CSV export without external credentials.
- **Smart alerts and recommendations** highlight spikes, dips, and weekly focus areas derived from rule-based analytics.
- **Goal tracking** keeps weight, steps, sleep, exercise, and hydration milestones front and center.
- **Responsive glassmorphism UI** pairs Framer Motion animation with shadcn/ui components for an energetic, production-ready feel.

## 🧭 Demo Script (5 Minutes)

1. **Launch & Sign In** – Use the “Launch your dashboard” button and follow Clerk’s email sign-in (magic link or code). On first load, hit the guided onboarding flow.
2. **Complete Onboarding** – Provide sample profile info, pick tracked metrics, and enable a goal to show goal cards.
3. **Import Wearable Data** – Visit `/connect`, connect to a provider, preview the dummy data, export the CSV, and sync it into storage.
4. **Review Dashboard** – Back on `/`, highlight the goals, statistics overview, collapsible trends chart, and alert center.
5. **Send Weekly Report** – Trigger the weekly email from the reminder card or inspect the recommendations list for actionable insights.


## � Integrations & Automations

- Wearable sandboxes provide seven-day data slices for each provider along with step, sleep, and weight summaries.
- Scheduled reminder card uses the Notifications API to nudge users for daily logging.
- Weekly email report endpoint delivers digest summaries via server actions.
- CSV exporter converts any wearable dataset into judge-friendly spreadsheets.

## 🛠️ Local Setup (Optional)

```bash
git clone https://github.com/ishan1603/trackr.git
cd trackr
npm install
npm run dev
```

Open `http://localhost:3000` and sign in through Clerk’s development instance. The app seeds demo data automatically once wearable imports run.

### Environment Variables

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
GMAIL_SMTP_USER=example@gmail.com
GMAIL_SMTP_PASS=app-password
NEXT_PUBLIC_FIREBASE_ENABLED=false
```

Leaving `NEXT_PUBLIC_FIREBASE_ENABLED` as `false` keeps everything in the local-first demo mode used for the hackathon build.

## ✅ Quality Checklist

- `npm run lint` – ESLint and TypeScript checks (passes cleanly)
- `npm run build` – Production build validated (Next.js 15)
- Tested against desktop (1440px), tablet (834px), and mobile (390px) breakpoints
- All user-facing copy reviewed to avoid medical guarantees

## 📂 Project Structure at a Glance

```
src/
├── app/                # Next.js routes and layouts
│   ├── page.tsx        # Authenticated dashboard
│   ├── connect/        # Wearable import hub
│   ├── weekly/         # Weekly analytics view
│   └── monthly/        # Monthly analytics view
├── components/         # UI, forms, charts, panels
└── lib/                # Analytics, storage, sample data
```

---
