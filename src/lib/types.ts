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
  waterIntake?: number;
  exercise?: number;
  calories?: number;
  mood?: number;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  age?: number;
  gender?: "male" | "female" | "other";
  height?: number;
  currentWeight?: number;
  onboardingCompleted?: boolean;
  createdAt?: Date;
  activeMetrics?: MetricType[];
}

export interface UserProfile {
  userId: string;
  height: number;
  currentWeight: number;
  targetWeight?: number;
  age: number;
  gender: "male" | "female" | "other";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very-active";
  medicalConditions?: string[];
}

export interface Goal {
  id: string;
  userId: string;
  type:
    | "weight"
    | "steps"
    | "sleep"
    | "exercise"
    | "water"
    | "bloodPressure"
    | "bloodSugar";
  targetValue: number;
  currentValue: number;
  deadline?: Date;
  createdAt: Date;
  status: "active" | "completed" | "abandoned";
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
  | "steps"
  | "waterIntake"
  | "exercise"
  | "calories"
  | "mood";
