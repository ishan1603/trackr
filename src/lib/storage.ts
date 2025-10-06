import { HealthMetric, Goal, UserProfile, User } from "./types";

// Simulated database with localStorage
const STORAGE_KEY = "healthtrackr_metrics";
const USER_KEY = "healthtrackr_user";
const PROFILE_KEY = "healthtrackr_profile";
const GOALS_KEY = "healthtrackr_goals";

export function saveMetric(metric: Omit<HealthMetric, "id">): HealthMetric {
  const metrics = getMetrics();
  const newMetric: HealthMetric = {
    ...metric,
    id: `metric-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };

  metrics.unshift(newMetric);

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics));
  }

  return newMetric;
}

export function getMetrics(): HealthMetric[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const parsed = JSON.parse(data);
    // Convert date strings back to Date objects
    return parsed.map((m: any) => ({
      ...m,
      date: new Date(m.date),
    }));
  } catch {
    return [];
  }
}

export function deleteMetric(id: string): void {
  const metrics = getMetrics();
  const filtered = metrics.filter((m) => m.id !== id);

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
}

export function getCurrentUser() {
  if (typeof window === "undefined") return null;

  try {
    const data = localStorage.getItem(USER_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function saveUser(user: any) {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

// Generate sample data for demo
export function generateSampleData(): HealthMetric[] {
  const sampleData: HealthMetric[] = [];
  const now = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Add some variance and trends
    const variance = (Math.random() - 0.5) * 10;
    const trend = i * 0.1;

    sampleData.push({
      id: `sample-${i}`,
      userId: "demo-user",
      date,
      bloodPressureSystolic: Math.round(118 + variance + (i > 20 ? 15 : 0)), // Spike in older data
      bloodPressureDiastolic: Math.round(78 + variance * 0.5),
      heartRate: Math.round(72 + variance),
      weight: Math.round(170 - trend + variance * 0.3),
      bloodSugar: Math.round(95 + variance * 1.5),
      sleep: Math.max(4, Math.min(10, 7.5 + (Math.random() - 0.5) * 2)),
      steps: Math.round(8500 + variance * 100),
      notes: i % 5 === 0 ? "Feeling good today" : undefined,
    });
  }

  return sampleData;
}

// Profile Management
export function saveProfile(profile: UserProfile): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }
}

export function getProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;

  try {
    const data = localStorage.getItem(PROFILE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// Goals Management
export function saveGoal(goal: Omit<Goal, "id" | "createdAt">): Goal {
  const goals = getGoals();
  const newGoal: Goal = {
    ...goal,
    id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
  };

  goals.push(newGoal);

  if (typeof window !== "undefined") {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  }

  return newGoal;
}

export function getGoals(): Goal[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(GOALS_KEY);
    if (!data) return [];

    const parsed = JSON.parse(data);
    return parsed.map((g: any) => ({
      ...g,
      createdAt: new Date(g.createdAt),
      deadline: g.deadline ? new Date(g.deadline) : undefined,
    }));
  } catch {
    return [];
  }
}

export function updateGoal(id: string, updates: Partial<Goal>): void {
  const goals = getGoals();
  const index = goals.findIndex((g) => g.id === id);

  if (index !== -1) {
    goals[index] = { ...goals[index], ...updates };

    if (typeof window !== "undefined") {
      localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
    }
  }
}

export function deleteGoal(id: string): void {
  const goals = getGoals();
  const filtered = goals.filter((g) => g.id !== id);

  if (typeof window !== "undefined") {
    localStorage.setItem(GOALS_KEY, JSON.stringify(filtered));
  }
}

export function getActiveGoals(): Goal[] {
  return getGoals().filter((g) => g.status === "active");
}
