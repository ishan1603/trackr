import { HealthMetric } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

export type WearableProvider = "google-fit" | "fitbit" | "apple-health";

export type WearableMetricPayload = Omit<HealthMetric, "id" | "userId">;
export type GoogleFitMetricPayload = WearableMetricPayload;
type CsvColumn = {
  key: keyof WearableMetricPayload;
  header: string;
};

const CSV_COLUMNS: CsvColumn[] = [
  { key: "date", header: "Date" },
  { key: "source", header: "Source" },
  { key: "steps", header: "Steps" },
  { key: "sleep", header: "Sleep (hrs)" },
  { key: "weight", header: "Weight (lbs)" },
  { key: "heartRate", header: "Heart Rate (bpm)" },
  { key: "bloodPressureSystolic", header: "Systolic" },
  { key: "bloodPressureDiastolic", header: "Diastolic" },
  { key: "bloodSugar", header: "Blood Sugar" },
  { key: "exercise", header: "Exercise (mins)" },
  { key: "calories", header: "Calories" },
  { key: "waterIntake", header: "Water Intake (oz)" },
  { key: "mood", header: "Mood" },
  { key: "notes", header: "Notes" },
];

const SAMPLE_DATA: Record<WearableProvider, WearableMetricPayload[]> = {
  "google-fit": [
    {
      date: new Date(Date.now() - 6 * DAY_MS),
      steps: 10452,
      sleep: 7.1,
      weight: 169.3,
      heartRate: 68,
      bloodPressureSystolic: 118,
      bloodPressureDiastolic: 76,
      exercise: 45,
      calories: 2150,
      source: "google-fit",
      notes: "Morning run with interval training.",
    },
    {
      date: new Date(Date.now() - 5 * DAY_MS),
      steps: 9820,
      sleep: 6.8,
      weight: 169.1,
      heartRate: 70,
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 78,
      exercise: 35,
      calories: 2050,
      source: "google-fit",
      notes: "Strength training and yoga cooldown.",
    },
    {
      date: new Date(Date.now() - 4 * DAY_MS),
      steps: 12340,
      sleep: 7.6,
      weight: 168.8,
      heartRate: 65,
      bloodPressureSystolic: 117,
      bloodPressureDiastolic: 75,
      exercise: 50,
      calories: 2250,
      source: "google-fit",
      notes: "Cycling commute and evening walk.",
    },
    {
      date: new Date(Date.now() - 3 * DAY_MS),
      steps: 8734,
      sleep: 6.2,
      weight: 168.9,
      heartRate: 71,
      bloodPressureSystolic: 121,
      bloodPressureDiastolic: 79,
      exercise: 25,
      calories: 1980,
      source: "google-fit",
    },
    {
      date: new Date(Date.now() - 2 * DAY_MS),
      steps: 11012,
      sleep: 7.8,
      weight: 168.6,
      heartRate: 66,
      bloodPressureSystolic: 116,
      bloodPressureDiastolic: 74,
      exercise: 40,
      calories: 2105,
      source: "google-fit",
      notes: "Long hike day with hills.",
    },
    {
      date: new Date(Date.now() - DAY_MS),
      steps: 9520,
      sleep: 6.9,
      weight: 168.5,
      heartRate: 69,
      bloodPressureSystolic: 119,
      bloodPressureDiastolic: 77,
      exercise: 30,
      calories: 2020,
      source: "google-fit",
    },
    {
      date: new Date(),
      steps: 11480,
      sleep: 7.4,
      weight: 168.2,
      heartRate: 67,
      bloodPressureSystolic: 118,
      bloodPressureDiastolic: 76,
      exercise: 55,
      calories: 2200,
      source: "google-fit",
      notes: "Tempo run with stretching routine.",
    },
  ],
  fitbit: [
    {
      date: new Date(Date.now() - 6 * DAY_MS),
      steps: 12780,
      sleep: 7.4,
      weight: 172.1,
      heartRate: 64,
      bloodPressureSystolic: 116,
      bloodPressureDiastolic: 73,
      exercise: 60,
      calories: 2350,
      source: "fitbit",
      notes: "Morning HIIT session and lunchtime walk.",
    },
    {
      date: new Date(Date.now() - 5 * DAY_MS),
      steps: 11892,
      sleep: 6.5,
      weight: 172,
      heartRate: 66,
      bloodPressureSystolic: 118,
      bloodPressureDiastolic: 74,
      exercise: 35,
      calories: 2210,
      source: "fitbit",
      notes: "Office day with evening spin class.",
    },
    {
      date: new Date(Date.now() - 4 * DAY_MS),
      steps: 14234,
      sleep: 7.9,
      weight: 171.6,
      heartRate: 63,
      bloodPressureSystolic: 115,
      bloodPressureDiastolic: 72,
      exercise: 70,
      calories: 2450,
      source: "fitbit",
      notes: "Long trail run with elevation gains.",
    },
    {
      date: new Date(Date.now() - 3 * DAY_MS),
      steps: 10112,
      sleep: 6.1,
      weight: 171.8,
      heartRate: 67,
      bloodPressureSystolic: 119,
      bloodPressureDiastolic: 75,
      exercise: 25,
      calories: 2080,
      source: "fitbit",
    },
    {
      date: new Date(Date.now() - 2 * DAY_MS),
      steps: 13405,
      sleep: 7.2,
      weight: 171.2,
      heartRate: 65,
      bloodPressureSystolic: 117,
      bloodPressureDiastolic: 73,
      exercise: 55,
      calories: 2285,
      source: "fitbit",
      notes: "Rowing workout and yoga recovery.",
    },
    {
      date: new Date(Date.now() - DAY_MS),
      steps: 9634,
      sleep: 6.8,
      weight: 171,
      heartRate: 68,
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 76,
      exercise: 30,
      calories: 2140,
      source: "fitbit",
    },
    {
      date: new Date(),
      steps: 13988,
      sleep: 7.6,
      weight: 170.9,
      heartRate: 62,
      bloodPressureSystolic: 114,
      bloodPressureDiastolic: 71,
      exercise: 65,
      calories: 2380,
      source: "fitbit",
      notes: "Brick workout ahead of triathlon prep.",
    },
  ],
  "apple-health": [
    {
      date: new Date(Date.now() - 6 * DAY_MS),
      steps: 9804,
      sleep: 7.9,
      weight: 158.4,
      heartRate: 59,
      bloodPressureSystolic: 112,
      bloodPressureDiastolic: 70,
      exercise: 40,
      calories: 1980,
      source: "apple-health",
      notes: "Guided meditation and light jog.",
    },
    {
      date: new Date(Date.now() - 5 * DAY_MS),
      steps: 10221,
      sleep: 8.1,
      weight: 158.3,
      heartRate: 58,
      bloodPressureSystolic: 111,
      bloodPressureDiastolic: 69,
      exercise: 50,
      calories: 2055,
      source: "apple-health",
      notes: "Pilates session and evening walk.",
    },
    {
      date: new Date(Date.now() - 4 * DAY_MS),
      steps: 11560,
      sleep: 7.4,
      weight: 158.2,
      heartRate: 60,
      bloodPressureSystolic: 113,
      bloodPressureDiastolic: 70,
      exercise: 60,
      calories: 2120,
      source: "apple-health",
      notes: "Pool laps with interval sprints.",
    },
    {
      date: new Date(Date.now() - 3 * DAY_MS),
      steps: 8720,
      sleep: 6.7,
      weight: 158.4,
      heartRate: 62,
      bloodPressureSystolic: 115,
      bloodPressureDiastolic: 72,
      exercise: 30,
      calories: 1885,
      source: "apple-health",
    },
    {
      date: new Date(Date.now() - 2 * DAY_MS),
      steps: 12210,
      sleep: 7.6,
      weight: 158,
      heartRate: 57,
      bloodPressureSystolic: 110,
      bloodPressureDiastolic: 68,
      exercise: 55,
      calories: 2075,
      source: "apple-health",
      notes: "Outdoor cycling with friends.",
    },
    {
      date: new Date(Date.now() - DAY_MS),
      steps: 9350,
      sleep: 7.2,
      weight: 157.9,
      heartRate: 61,
      bloodPressureSystolic: 112,
      bloodPressureDiastolic: 69,
      exercise: 35,
      calories: 1940,
      source: "apple-health",
    },
    {
      date: new Date(),
      steps: 12840,
      sleep: 7.8,
      weight: 157.7,
      heartRate: 58,
      bloodPressureSystolic: 111,
      bloodPressureDiastolic: 68,
      exercise: 65,
      calories: 2090,
      source: "apple-health",
      notes: "Strength training and mindfulness cooldown.",
    },
  ],
};

function cloneMetrics(
  metrics: WearableMetricPayload[]
): WearableMetricPayload[] {
  return metrics.map((metric) => ({
    ...metric,
    date: new Date(metric.date),
  }));
}

async function fetchSampleData(
  provider: WearableProvider
): Promise<WearableMetricPayload[]> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return cloneMetrics(SAMPLE_DATA[provider]);
}

export async function fetchGoogleFitSampleData(): Promise<
  GoogleFitMetricPayload[]
> {
  return fetchSampleData("google-fit");
}

export async function fetchFitbitSampleData(): Promise<
  WearableMetricPayload[]
> {
  return fetchSampleData("fitbit");
}

export async function fetchAppleHealthSampleData(): Promise<
  WearableMetricPayload[]
> {
  return fetchSampleData("apple-health");
}

export interface WearableSummary {
  totalSteps: number;
  avgSleep: number;
  avgWeight: number;
}

export function summarizeWearableData(
  metrics: WearableMetricPayload[]
): WearableSummary {
  if (metrics.length === 0) {
    return {
      totalSteps: 0,
      avgSleep: 0,
      avgWeight: 0,
    };
  }

  const totalSteps = metrics.reduce(
    (acc, metric) => acc + (metric.steps ?? 0),
    0
  );
  const avgSleep =
    metrics.reduce((acc, metric) => acc + (metric.sleep ?? 0), 0) /
    metrics.length;
  const avgWeight =
    metrics.reduce((acc, metric) => acc + (metric.weight ?? 0), 0) /
    metrics.length;

  return {
    totalSteps,
    avgSleep: Number(avgSleep.toFixed(1)),
    avgWeight: Number(avgWeight.toFixed(1)),
  };
}

export const summarizeGoogleFitData = summarizeWearableData;

export const WEARABLE_PROVIDER_LABELS: Record<WearableProvider, string> = {
  "google-fit": "Google Fit",
  fitbit: "Fitbit",
  "apple-health": "Apple Health",
};
type CsvValue = WearableMetricPayload[keyof WearableMetricPayload];

function formatCsvValue(value: CsvValue | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const stringValue = typeof value === "number" ? String(value) : `${value}`;
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export function wearableMetricsToCsv(metrics: WearableMetricPayload[]): string {
  const header = CSV_COLUMNS.map((column) => column.header).join(",");
  const rows = metrics.map((metric) =>
    CSV_COLUMNS.map((column) => {
      const value = metric[column.key];
      return formatCsvValue(value);
    }).join(",")
  );

  return [header, ...rows].join("\n");
}
