# 🏥 HealthTrackr

A production-quality, full-stack health tracking application built with **Next.js 15**, **TypeScript**, **shadcn/ui**, and **Framer Motion**. HealthTrackr helps users log daily health metrics, visualize trends, detect anomalies, and receive personalized health recommendations.

![HealthTrackr Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8)

## ✨ Features

### 📊 **Health Metrics Tracking**

- **Blood Pressure** (Systolic/Diastolic)
- **Heart Rate** monitoring
- **Weight** tracking
- **Blood Sugar** levels
- **Sleep Duration** logging
- **Daily Steps** counter
- Personal notes for each entry

### 📈 **Data Visualization**

- Interactive trend charts with **Recharts**
- Multiple time-series views for each metric
- Beautiful, responsive charts with smooth animations
- Switch between different health metrics seamlessly

### 🔔 **Intelligent Anomaly Detection**

- Real-time analysis of health data
- Critical alerts for dangerous levels
- Warning notifications for concerning trends
- Automatic detection of sudden changes
- Color-coded alert system (Critical/Warning/Info)

### 💡 **Personalized Recommendations**

- AI-powered health insights
- Sleep improvement suggestions
- Activity level recommendations
- Weight management guidance
- Wellness tips based on your data

### 🎨 **Beautiful UI/UX**

- Modern, clean interface with **shadcn/ui** components
- Smooth animations powered by **Framer Motion**
- Fully mobile-responsive design
- Dark mode support
- Gradient backgrounds and glassmorphism effects
- Intuitive navigation and interaction

### 🚀 **Performance & Quality**

- Built with **Next.js 15** App Router
- TypeScript for type safety
- Modular, scalable code architecture
- Client-side data persistence with localStorage
- Sample data generation for quick demos

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Date Handling**: date-fns

## 📦 Installation & Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The app will automatically generate sample data on first load to showcase all features.

## 🎯 Usage

### Adding Health Metrics

1. Click the **"Log Health Data"** button in the top right
2. Fill in any metrics you want to track (not all fields required)
3. Add optional notes about how you're feeling
4. Click **"Save Metrics"**

### Viewing Trends

- Navigate to the **Trends Chart** section
- Switch between different metrics using the tabs
- Hover over data points for detailed information
- Charts automatically update when new data is added

### Monitoring Alerts

- Check the **Health Alerts** panel for any warnings
- Critical alerts appear in red and require immediate attention
- Warning alerts (yellow) suggest consulting a healthcare provider
- Info alerts (blue) provide general health insights
- Dismiss alerts by clicking the X button

### Getting Recommendations

- View personalized recommendations in the **Recommendations** panel
- High-priority items (red border) require immediate action
- Medium-priority items (yellow border) are suggestions for improvement
- Low-priority items (green border) are general wellness tips

## 🏗️ Project Structure

```
trackr/
├── src/
│   ├── app/
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   └── tabs.tsx
│   │   ├── AlertsPanel.tsx
│   │   ├── MetricForm.tsx
│   │   ├── RecommendationsPanel.tsx
│   │   ├── StatsOverview.tsx
│   │   └── TrendsChart.tsx
│   └── lib/
│       ├── analytics.ts      # Anomaly detection & recommendations
│       ├── storage.ts        # Data persistence
│       ├── types.ts          # TypeScript types
│       └── utils.ts          # Utility functions
├── public/
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 🧩 Key Components

### `MetricForm`

Modal form for logging health metrics with validation and user-friendly inputs.

### `StatsOverview`

Dashboard cards showing the latest values for all health metrics with icons and color coding.

### `TrendsChart`

Interactive charts displaying historical data with multiple metric views and custom tooltips.

### `AlertsPanel`

Real-time health alerts with severity levels and dismissible notifications.

### `RecommendationsPanel`

Personalized health insights and actionable recommendations based on user data.

## 🔒 Data Storage

Currently uses **localStorage** for client-side data persistence. Perfect for demos and MVPs.

**Future Enhancements:**

- Backend integration with PostgreSQL/MongoDB
- User authentication (NextAuth.js)
- Cloud data synchronization
- Data export/import functionality

## 🚀 Deployment

### Vercel (Recommended)

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

```bash
npm run build
vercel deploy
```

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## ⚠️ Disclaimer

**HealthTrackr is for demonstration and educational purposes only.** It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.

## 📝 License

This project is open source and available under the MIT License.

---

**Built with ❤️ using Next.js, TypeScript, and Modern Web Technologies**
