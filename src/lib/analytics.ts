import { HealthMetric, Alert } from "./types";

interface MetricRange {
  min: number;
  max: number;
  critical: { min: number; max: number };
}

const METRIC_RANGES: Record<string, MetricRange> = {
  bloodPressureSystolic: {
    min: 90,
    max: 120,
    critical: { min: 70, max: 180 },
  },
  bloodPressureDiastolic: {
    min: 60,
    max: 80,
    critical: { min: 40, max: 120 },
  },
  heartRate: {
    min: 60,
    max: 100,
    critical: { min: 40, max: 140 },
  },
  bloodSugar: {
    min: 70,
    max: 140,
    critical: { min: 50, max: 200 },
  },
};

export function detectAnomalies(metrics: HealthMetric[]): Alert[] {
  const alerts: Alert[] = [];

  if (metrics.length === 0) return alerts;

  // Get the latest metric
  const latestMetric = metrics[0];

  // Check blood pressure
  if (
    latestMetric.bloodPressureSystolic &&
    latestMetric.bloodPressureDiastolic
  ) {
    const systolic = latestMetric.bloodPressureSystolic;
    const diastolic = latestMetric.bloodPressureDiastolic;
    const range = METRIC_RANGES.bloodPressureSystolic;
    const rangeD = METRIC_RANGES.bloodPressureDiastolic;

    if (systolic > range.critical.max || diastolic > rangeD.critical.max) {
      alerts.push({
        id: `alert-bp-${Date.now()}`,
        type: "critical",
        metric: "Blood Pressure",
        message: `Critical: Blood pressure ${systolic}/${diastolic} mmHg is dangerously high. Seek medical attention.`,
        date: latestMetric.date,
        read: false,
      });
    } else if (systolic > range.max || diastolic > rangeD.max) {
      alerts.push({
        id: `alert-bp-${Date.now()}`,
        type: "warning",
        metric: "Blood Pressure",
        message: `Warning: Blood pressure ${systolic}/${diastolic} mmHg is elevated. Consider consulting your doctor.`,
        date: latestMetric.date,
        read: false,
      });
    } else if (
      systolic < range.critical.min ||
      diastolic < rangeD.critical.min
    ) {
      alerts.push({
        id: `alert-bp-low-${Date.now()}`,
        type: "critical",
        metric: "Blood Pressure",
        message: `Critical: Blood pressure ${systolic}/${diastolic} mmHg is dangerously low. Seek medical attention.`,
        date: latestMetric.date,
        read: false,
      });
    }
  }

  // Check heart rate
  if (latestMetric.heartRate) {
    const hr = latestMetric.heartRate;
    const range = METRIC_RANGES.heartRate;

    if (hr > range.critical.max || hr < range.critical.min) {
      alerts.push({
        id: `alert-hr-${Date.now()}`,
        type: "critical",
        metric: "Heart Rate",
        message: `Critical: Heart rate ${hr} bpm is outside safe range. Seek medical attention.`,
        date: latestMetric.date,
        read: false,
      });
    } else if (hr > range.max || hr < range.min) {
      alerts.push({
        id: `alert-hr-${Date.now()}`,
        type: "warning",
        metric: "Heart Rate",
        message: `Warning: Heart rate ${hr} bpm is unusual. Monitor closely.`,
        date: latestMetric.date,
        read: false,
      });
    }
  }

  // Check blood sugar
  if (latestMetric.bloodSugar) {
    const bs = latestMetric.bloodSugar;
    const range = METRIC_RANGES.bloodSugar;

    if (bs > range.critical.max || bs < range.critical.min) {
      alerts.push({
        id: `alert-bs-${Date.now()}`,
        type: "critical",
        metric: "Blood Sugar",
        message: `Critical: Blood sugar ${bs} mg/dL is at dangerous levels. Take immediate action.`,
        date: latestMetric.date,
        read: false,
      });
    } else if (bs > range.max) {
      alerts.push({
        id: `alert-bs-${Date.now()}`,
        type: "warning",
        metric: "Blood Sugar",
        message: `Warning: Blood sugar ${bs} mg/dL is elevated. Check your diet and medication.`,
        date: latestMetric.date,
        read: false,
      });
    } else if (bs < range.min) {
      alerts.push({
        id: `alert-bs-${Date.now()}`,
        type: "warning",
        metric: "Blood Sugar",
        message: `Warning: Blood sugar ${bs} mg/dL is low. Consider eating something.`,
        date: latestMetric.date,
        read: false,
      });
    }
  }

  // Detect sudden changes (comparing to previous week's average)
  if (metrics.length > 7) {
    const recentMetrics = metrics.slice(0, 7);
    const previousMetrics = metrics.slice(7, 14);

    // Blood pressure trend
    const recentBPAvg = calculateAverage(
      recentMetrics,
      "bloodPressureSystolic"
    );
    const previousBPAvg = calculateAverage(
      previousMetrics,
      "bloodPressureSystolic"
    );

    if (
      recentBPAvg &&
      previousBPAvg &&
      Math.abs(recentBPAvg - previousBPAvg) > 15
    ) {
      alerts.push({
        id: `alert-trend-bp-${Date.now()}`,
        type: "info",
        metric: "Blood Pressure Trend",
        message: `Notice: Significant change in blood pressure trend detected over the past week.`,
        date: new Date(),
        read: false,
      });
    }
  }

  return alerts;
}

function calculateAverage(
  metrics: HealthMetric[],
  field: keyof HealthMetric
): number | null {
  const values = metrics
    .map((m) => m[field])
    .filter((v): v is number => typeof v === "number");

  if (values.length === 0) return null;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

export function generateRecommendations(
  metrics: HealthMetric[],
  alerts: Alert[]
) {
  const recommendations = [];

  if (metrics.length === 0) {
    return [
      {
        id: "rec-start",
        category: "Getting Started",
        title: "Start Tracking Your Health",
        description:
          "Begin by logging your daily health metrics to get personalized insights and recommendations.",
        priority: "high" as const,
      },
    ];
  }

  const latestMetric = metrics[0];
  const hasRecentData = metrics.length > 0;

  // Sleep recommendations
  if (latestMetric.sleep && latestMetric.sleep < 7) {
    recommendations.push({
      id: "rec-sleep",
      category: "Sleep",
      title: "Improve Sleep Duration",
      description:
        "You're getting less than 7 hours of sleep. Aim for 7-9 hours for optimal health.",
      priority: "high" as const,
    });
  }

  // Activity recommendations
  const avgSteps = hasRecentData
    ? calculateAverage(metrics.slice(0, 7), "steps")
    : null;
  if (avgSteps && avgSteps < 8000) {
    recommendations.push({
      id: "rec-activity",
      category: "Activity",
      title: "Increase Daily Steps",
      description:
        "Try to reach 10,000 steps per day for better cardiovascular health.",
      priority: "medium" as const,
    });
  }

  // Weight management
  if (metrics.length >= 7) {
    const recentWeights = metrics
      .slice(0, 7)
      .filter((m) => m.weight)
      .map((m) => m.weight!);
    if (recentWeights.length >= 2) {
      const trend = recentWeights[0] - recentWeights[recentWeights.length - 1];
      if (Math.abs(trend) > 5) {
        recommendations.push({
          id: "rec-weight",
          category: "Weight",
          title: "Monitor Weight Changes",
          description: `You've experienced a ${Math.abs(trend).toFixed(
            1
          )} lb change this week. Consult a healthcare provider if concerned.`,
          priority: "medium" as const,
        });
      }
    }
  }

  // General wellness
  if (alerts.length === 0 && hasRecentData) {
    recommendations.push({
      id: "rec-wellness",
      category: "Wellness",
      title: "Keep Up the Good Work!",
      description:
        "Your health metrics look great. Continue your healthy habits.",
      priority: "low" as const,
    });
  }

  return recommendations;
}
