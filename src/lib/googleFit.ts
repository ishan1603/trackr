import { HealthMetric } from "./types";

export type GoogleFitMetricPayload = Omit<HealthMetric, "id" | "userId">;

// Dummy dataset simulating Google Fit health summaries for the last seven days.
const GOOGLE_FIT_SAMPLE_DATA: GoogleFitMetricPayload[] = [
  {
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
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
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
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
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
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
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
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
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
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
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
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
];

export async function fetchGoogleFitSampleData(): Promise<
  GoogleFitMetricPayload[]
> {
  // Simulate network delay for better UX feedback.
  await new Promise((resolve) => setTimeout(resolve, 600));
  // Return a deep copy so callers can mutate without affecting the fixture.
  return GOOGLE_FIT_SAMPLE_DATA.map((metric) => ({
    ...metric,
    date: new Date(metric.date),
  }));
}

export function summarizeGoogleFitData(metrics: GoogleFitMetricPayload[]) {
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
