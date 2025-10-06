# HealthTrackr - Feature Documentation

## ✨ Features Implemented

### 🎨 Dark Mode / Light Mode

- **Theme Toggle**: Beautiful toggle button in navbar with Sun/Moon icons
- **System Detection**: Automatically detects and applies system preference
- **Persistent**: Theme choice saved across sessions
- **Smooth Transitions**: Animated theme switching with Framer Motion
- **Global Application**: Works across all pages (Dashboard, Weekly, Monthly)

**Location**:

- Component: `src/components/ThemeToggle.tsx`
- Provider: `src/components/ThemeProvider.tsx`
- Configuration: `src/app/layout.tsx`

---

### 👤 User Onboarding Flow

A comprehensive 4-step wizard that collects essential user information:

#### Step 1: Basic Information

- Full Name
- Email Address
- Age
- Gender Selection (Male, Female, Other)

#### Step 2: Health Profile

- Height (inches)
- Weight (lbs)
- Activity Level (Sedentary, Light, Moderate, Very Active, Extra Active)

#### Step 3: Metric Selection

Choose from 10 health metrics to track:

- ✅ Weight
- ✅ Blood Pressure
- ✅ Blood Sugar
- ✅ Heart Rate
- ✅ Sleep Hours
- ✅ Steps
- ✅ Water Intake
- ✅ Exercise Minutes
- ✅ Calories
- ✅ Mood Rating

#### Step 4: Goal Setting

Set personal health targets:

- **Weight Goal**: Target weight in lbs
- **Steps Goal**: Daily step target
- **Sleep Goal**: Nightly sleep hours target
- **Exercise Goal**: Weekly exercise minutes
- **Water Goal**: Daily water intake (glasses)

**Features**:

- ✨ Multi-step wizard with progress indicator
- 💾 Auto-save to localStorage
- ✅ Form validation
- 🎯 Customizable metric selection
- 🔄 First-time user detection

**Location**: `src/components/OnboardingFlow.tsx`

---

### 🎯 Goals & Progress Tracking

Track your health goals with visual progress bars and encouraging messages!

**Features**:

- 📊 Visual Progress Bars for each goal
- 📈 Percentage completion tracking
- 💬 Encouraging messages at different milestones:
  - 0%: "Let's start this journey together!"
  - 25%: "Great start! Keep it up!"
  - 50%: "You're halfway there!"
  - 75%: "Almost there! Don't give up now!"
  - 90%: "So close! Just a little more!"
  - 100%: "🎉 Goal achieved! Amazing work!"

**Supported Goals**:

- Weight management
- Daily step count
- Sleep duration
- Exercise minutes
- Water intake

**Location**: `src/components/GoalsProgress.tsx`

---

### 📊 Dashboard Views

#### Main Dashboard (`/`)

- Health metrics overview
- Trend charts with 7/30-day views
- Anomaly detection and alerts
- Personalized recommendations
- Goal progress display
- Quick metric logging

#### Weekly Dashboard (`/weekly`)

- Week-by-week navigation
- Summary cards:
  - Total Steps
  - Average Sleep
  - Average Heart Rate
  - Total Entries
- Bar chart for daily steps
- Line chart for sleep & heart rate trends
- Week-over-week comparison

#### Monthly Dashboard (`/monthly`)

- Month-by-month view
- Monthly statistics:
  - Average Weight
  - Weight Change Indicator
  - Average Blood Pressure
  - Average Sleep
  - Total Entries
- Area charts for trends:
  - Weight progression
  - Blood pressure monitoring
  - Sleep patterns
- Weekly aggregated data

**Navigation**: Accessible via header buttons on main dashboard

---

### 📝 Enhanced Metric Logging

**Dynamic Form Fields**:

- Only shows metrics selected during onboarding
- Customizable metric selection per entry
- Date/time picker for retrospective logging
- Comprehensive metric types:
  - Weight (lbs)
  - Blood Pressure (Systolic/Diastolic)
  - Blood Sugar (mg/dL)
  - Heart Rate (bpm)
  - Sleep (hours)
  - Steps (count)
  - Water (glasses)
  - Exercise (minutes)
  - Calories (kcal)
  - Mood (1-10 scale)

**Features**:

- ✅ Real-time validation
- 💾 Instant save to localStorage
- 📱 Mobile-responsive modal
- 🔔 Success notifications
- 🎯 Goal-aware logging

---

## 🗂️ Data Storage

All data is stored locally in the browser using localStorage:

### Storage Keys

- `healthtrackr_metrics` - Health metric entries
- `healthtrackr_profile` - User profile & health info
- `healthtrackr_goals` - User health goals
- `healthtrackr_user` - User authentication data (future)

### Storage Functions

Located in `src/lib/storage.ts`:

**Metrics**:

- `saveMetric(metric)` - Save new health entry
- `getMetrics()` - Retrieve all metrics
- `generateSampleData()` - Demo data generator

**Profile**:

- `saveProfile(profile)` - Save user profile
- `getProfile()` - Get user profile
- `updateProfile(updates)` - Update profile fields

**Goals**:

- `saveGoal(goal)` - Create new goal
- `getGoals()` - Get all goals
- `getActiveGoals()` - Get active goals only
- `updateGoal(goalId, updates)` - Update goal progress
- `deleteGoal(goalId)` - Remove goal

---

## 🎯 Smart Analytics

### Anomaly Detection

Located in `src/lib/analytics.ts`:

**Monitored Metrics**:

- 🩸 **Blood Pressure**: Alerts if systolic > 140 or < 90
- ❤️ **Heart Rate**: Alerts if > 100 or < 60 bpm
- 🍬 **Blood Sugar**: Alerts if > 140 mg/dL

**Alert Levels**:

- 🔴 **Critical**: Immediate attention needed
- 🟡 **Warning**: Worth monitoring
- 🟢 **Normal**: All good!

### Personalized Recommendations

AI-driven suggestions based on:

- Recent health trends
- Goal progress
- Detected anomalies
- Activity patterns

---

## 🎨 UI Components

Built with shadcn/ui and Radix UI primitives:

### Form Components

- `Button` - Various sizes and variants
- `Input` - Form text fields
- `Label` - Accessible form labels
- `Textarea` - Multi-line input
- `Checkbox` - Selection controls
- `Dialog` - Modal overlays
- `Progress` - Progress bars

### Display Components

- `Card` - Content containers
- `Tabs` - Tab navigation
- `Alert` - Status messages

**Location**: `src/components/ui/`

---

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router + Turbopack)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS v3
- **UI Library**: shadcn/ui + Radix UI
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Dark Mode**: next-themes
- **Date Utilities**: date-fns
- **Auth (Future)**: NextAuth.js

---

## 📱 Responsive Design

All pages and components are fully responsive:

- 📱 **Mobile**: Optimized layouts for phones
- 📱 **Tablet**: Adaptive grid systems
- 💻 **Desktop**: Full-featured dashboard experience

---

## 🔮 Future Enhancements

### Authentication

- Login/Signup pages (dependencies installed)
- Session management with NextAuth.js
- Protected routes
- Multi-user support

### Data Export

- CSV/JSON export functionality
- Print-friendly reports
- Share progress feature

### Advanced Analytics

- Machine learning predictions
- Correlation analysis
- Long-term trend forecasting
- Comparative benchmarking

### Integrations

- Fitness tracker sync (Fitbit, Apple Health)
- Calendar integration
- Reminder notifications
- Doctor report generation

---

## 🧪 Testing

To test all features:

1. **First Visit** → Onboarding flow appears
2. **Complete Onboarding** → Select metrics and set goals
3. **Log Data** → Add health entries via "Log Metrics" button
4. **View Progress** → Check goal progress on main dashboard
5. **Toggle Theme** → Test dark/light mode
6. **Weekly View** → Navigate to `/weekly` for week-by-week stats
7. **Monthly View** → Navigate to `/monthly` for month-by-month trends
8. **Alerts** → System detects anomalies automatically
9. **Recommendations** → Personalized suggestions appear

---

## 📖 User Guide

### Getting Started

1. Open the app in your browser
2. Complete the 4-step onboarding process
3. Start logging your daily health metrics
4. Set realistic health goals
5. Track your progress over time

### Best Practices

- ✅ Log metrics daily for accurate trends
- ✅ Update goals as you achieve them
- ✅ Review weekly/monthly dashboards regularly
- ✅ Pay attention to alerts and recommendations
- ✅ Be consistent with your selected metrics

### Tips

- 💡 Use the date picker to log past entries
- 💡 Choose metrics relevant to your health goals
- 💡 Set achievable, incremental goals
- 💡 Celebrate small wins along the way
- 💡 Adjust goals as needed - progress is progress!

---

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 📄 License

This project is for demonstration and educational purposes. Consult healthcare professionals for medical advice.

---

**Built with ❤️ using Next.js, shadcn/ui, and Framer Motion**
