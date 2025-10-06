# HealthTrackr - Developer Guide

## 🚀 Quick Start

Your application is **live and running** at: http://localhost:3000

## 📁 Project Structure Overview

```
trackr/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css        # Global styles & design tokens
│   │   ├── layout.tsx         # Root layout with metadata
│   │   └── page.tsx           # Main dashboard page
│   │
│   ├── components/            # React components
│   │   ├── ui/               # Base UI components (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   └── tabs.tsx
│   │   │
│   │   ├── AlertsPanel.tsx         # Health alerts display
│   │   ├── MetricForm.tsx          # Data entry modal
│   │   ├── RecommendationsPanel.tsx # Health insights
│   │   ├── StatsOverview.tsx       # Metric cards
│   │   └── TrendsChart.tsx         # Interactive charts
│   │
│   └── lib/                   # Core logic & utilities
│       ├── analytics.ts       # Anomaly detection engine
│       ├── storage.ts         # Data persistence layer
│       ├── types.ts           # TypeScript definitions
│       └── utils.ts           # Helper functions
│
├── public/                    # Static assets
├── node_modules/             # Dependencies
├── package.json              # Project manifest
├── tailwind.config.ts        # Tailwind configuration
├── tsconfig.json            # TypeScript config
├── next.config.ts           # Next.js config
└── README.md                # Documentation
```

## 🔧 Core Files Explained

### `src/app/page.tsx` - Main Dashboard

**Purpose**: Root component that orchestrates the entire application

**Key Features**:

- Client-side data management with useState
- Automatic sample data generation
- Real-time metric updates
- Responsive layout with gradient background
- Sticky header with branding

**State Management**:

```typescript
const [metrics, setMetrics] = useState<HealthMetric[]>([]);
const [alerts, setAlerts] = useState<Alert[]>([]);
const [recommendations, setRecommendations] = useState<any[]>([]);
const [isLoaded, setIsLoaded] = useState(false);
```

### `src/lib/storage.ts` - Data Layer

**Purpose**: Handle all data persistence operations

**Key Functions**:

- `saveMetric()`: Add new health entry
- `getMetrics()`: Retrieve all metrics
- `deleteMetric()`: Remove an entry
- `generateSampleData()`: Create demo data

**Storage Keys**:

- `healthtrackr_metrics`: Array of health metrics
- `healthtrackr_user`: User profile data

### `src/lib/analytics.ts` - Intelligence Engine

**Purpose**: Anomaly detection and recommendation generation

**Key Functions**:

1. **`detectAnomalies(metrics: HealthMetric[]): Alert[]`**

   - Checks latest metric against safe ranges
   - Compares weekly trends
   - Returns prioritized alerts

2. **`generateRecommendations(metrics, alerts)`**
   - Analyzes sleep patterns
   - Evaluates activity levels
   - Monitors weight trends
   - Provides actionable advice

**Customizable Ranges**:

```typescript
const METRIC_RANGES = {
  bloodPressureSystolic: { min: 90, max: 120, critical: { min: 70, max: 180 } },
  heartRate: { min: 60, max: 100, critical: { min: 40, max: 140 } },
  // ... customize as needed
};
```

### `src/lib/types.ts` - Type System

**Purpose**: TypeScript type definitions for type safety

**Core Types**:

- `HealthMetric`: Main data structure
- `User`: User profile
- `Alert`: Health notifications
- `Recommendation`: Health insights
- `MetricType`: Metric categories

### `src/components/MetricForm.tsx` - Data Entry

**Purpose**: Modal form for logging health data

**Features**:

- 7 input fields (all optional)
- Form validation
- Reset on submit
- Responsive grid layout
- Dialog state management

**Usage**:

```tsx
<MetricForm onMetricAdded={() => loadData()} />
```

### `src/components/StatsOverview.tsx` - Dashboard Cards

**Purpose**: Display current health metrics at a glance

**Features**:

- 6 metric cards with icons
- Color-coded by category
- Staggered animations
- Hover effects
- N/A for missing data

### `src/components/TrendsChart.tsx` - Visualization

**Purpose**: Interactive time-series charts

**Chart Types**:

- Line charts: BP, Heart Rate, Weight
- Area charts: Blood Sugar, Sleep, Steps

**Features**:

- Tab navigation
- Custom tooltips
- Responsive sizing
- 30-day view
- Smooth animations

### `src/components/AlertsPanel.tsx` - Notifications

**Purpose**: Display health alerts and warnings

**Alert Types**:

1. **Critical** (Red): Immediate medical attention
2. **Warning** (Yellow): Consult doctor
3. **Info** (Blue): General insights

**Features**:

- Dismissible alerts
- Animated entry/exit
- Timestamp display
- Color-coded borders

### `src/components/RecommendationsPanel.tsx` - Insights

**Purpose**: Personalized health recommendations

**Priority Levels**:

- High (Red border): Immediate action
- Medium (Yellow border): Suggestions
- Low (Green border): General tips

**Categories**:

- Sleep optimization
- Activity goals
- Weight management
- General wellness

## 🎨 Styling System

### Tailwind CSS Configuration

**Color Tokens** (`globals.css`):

```css
--primary: 240 5.9% 10%
--secondary: 240 4.8% 95.9%
--accent: 240 4.8% 95.9%
--muted: 240 4.8% 95.9%
--destructive: 0 84.2% 60.2%
```

**Usage**:

```tsx
<div className="bg-primary text-primary-foreground">Content</div>
```

### Custom Utilities

**cn() helper** (`lib/utils.ts`):
Merges Tailwind classes safely:

```tsx
import { cn } from "@/lib/utils";

<div className={cn("base-class", condition && "conditional-class")} />;
```

## 🎭 Animation System

### Framer Motion Patterns

**Page Entrance**:

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.3 }}
>
```

**Staggered Children**:

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};
```

**List Exit**:

```tsx
<AnimatePresence mode="popLayout">
  {items.map(item => (
    <motion.div
      key={item.id}
      exit={{ opacity: 0, x: 20 }}
    >
  ))}
</AnimatePresence>
```

## 📊 Data Flow

### Adding a New Metric

1. **User clicks "Log Health Data"**

   ```
   MetricForm opens (Dialog state = true)
   ```

2. **User fills form and submits**

   ```tsx
   saveMetric(formData); // lib/storage.ts
   localStorage.setItem("healthtrackr_metrics", JSON.stringify(metrics));
   ```

3. **Callback triggers reload**

   ```tsx
   onMetricAdded() -> loadData() // page.tsx
   ```

4. **State updates trigger re-renders**

   ```tsx
   setMetrics(data);
   setAlerts(detectAnomalies(data));
   setRecommendations(generateRecommendations(data, alerts));
   ```

5. **All components receive new data**
   ```
   StatsOverview → Shows latest values
   TrendsChart → Adds new data point
   AlertsPanel → Checks for new alerts
   RecommendationsPanel → Updates insights
   ```

## 🔌 Adding New Features

### Example: Add a New Metric (e.g., "Temperature")

1. **Update Types** (`lib/types.ts`):

```typescript
export interface HealthMetric {
  // ... existing fields
  temperature?: number;
}
```

2. **Add to Form** (`components/MetricForm.tsx`):

```tsx
<div className="space-y-2">
  <Label htmlFor="temperature">Temperature</Label>
  <Input
    id="temperature"
    type="number"
    step="0.1"
    placeholder="98.6"
    value={formData.temperature}
    onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
  />
  <p className="text-xs text-muted-foreground">°F</p>
</div>
```

3. **Add to Overview** (`components/StatsOverview.tsx`):

```tsx
{
  title: 'Temperature',
  value: latestMetric?.temperature || 'N/A',
  unit: '°F',
  icon: Thermometer,
  color: 'text-amber-500',
  bgColor: 'bg-amber-50 dark:bg-amber-950/20'
}
```

4. **Add Chart Tab** (`components/TrendsChart.tsx`):

```tsx
<TabsTrigger value="temperature">Temp</TabsTrigger>

<TabsContent value="temperature" className="h-[300px] mt-6">
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={chartData}>
      {/* Chart configuration */}
    </LineChart>
  </ResponsiveContainer>
</TabsContent>
```

5. **Add Analytics** (`lib/analytics.ts`):

```typescript
const METRIC_RANGES = {
  // ... existing ranges
  temperature: {
    min: 97.0,
    max: 99.0,
    critical: { min: 95.0, max: 103.0 },
  },
};
```

## 🐛 Debugging Tips

### Common Issues

**1. Data not persisting**

- Check browser console for localStorage errors
- Verify browser supports localStorage
- Check for quota exceeded errors

**2. Charts not rendering**

- Ensure data format matches expected structure
- Check date parsing (must be Date objects)
- Verify chartData has valid values

**3. Animations not working**

- Check Framer Motion version compatibility
- Verify motion components are used
- Check for conflicting CSS

**4. TypeScript errors**

- Run `npm run build` to see all errors
- Check type definitions in `lib/types.ts`
- Use type assertions when needed

### Development Tools

**Browser DevTools**:

- React DevTools: Inspect component tree
- localStorage viewer: Check stored data
- Network tab: Monitor requests (future API calls)

**VS Code Extensions**:

- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

## 📦 Build & Deploy

### Production Build

```bash
npm run build
```

### Preview Production

```bash
npm run build
npm start
```

### Deploy to Vercel

```bash
vercel deploy --prod
```

### Environment Variables (Future)

Create `.env.local`:

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

## 🧪 Testing (To Implement)

### Unit Tests

```bash
npm install -D jest @testing-library/react
```

### E2E Tests

```bash
npm install -D playwright
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Framer Motion API](https://www.framer.com/motion/)
- [Recharts Examples](https://recharts.org/en-US/examples)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

**Happy Coding! 🚀**
