export interface HealthMetric {
  id: string;
  userId: string;
  date: Date;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  weight?: number;
  bloodSugar?: number;
  sleep?: number;
  steps?: number;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
  gender?: "male" | "female" | "other";
}

export interface Alert {
  id: string;
  type: "warning" | "critical" | "info";
  metric: string;
  message: string;
  date: Date;
  read: boolean;
}

export interface Recommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

export type MetricType =
  | "bloodPressure"
  | "heartRate"
  | "weight"
  | "bloodSugar"
  | "sleep"
  | "steps";
